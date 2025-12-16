-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Match status enum
CREATE TYPE match_status AS ENUM ('open', 'closed');

-- Matches table with fee breakdown support
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    fee_amount INTEGER NOT NULL,
    upi_id TEXT NOT NULL,
    reminder_after_days INTEGER NOT NULL DEFAULT 2,
    status match_status NOT NULL DEFAULT 'open',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Expected number of players (set by captain when creating match)
    total_players INTEGER,

    -- Fee breakdown stored as JSONB
    -- Structure: { player_count: number, items: [{ title: string, amount: number }], is_detailed: boolean }
    fee_breakdown JSONB,

    -- WhatsApp message template for sharing
    share_message TEXT,

    CONSTRAINT valid_fee_amount CHECK (fee_amount > 0),
    CONSTRAINT valid_reminder_days CHECK (reminder_after_days >= 0),
    CONSTRAINT valid_upi_id CHECK (upi_id ~* '^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$'),
    CONSTRAINT valid_total_players CHECK (total_players IS NULL OR total_players > 0)
);

-- Match players table
CREATE TABLE match_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reminder_sent BOOLEAN NOT NULL DEFAULT false,

    -- Prevent duplicate names in same match
    CONSTRAINT unique_player_per_match UNIQUE (match_id, player_name),
    -- Sanitize player name
    CONSTRAINT valid_player_name CHECK (
        LENGTH(TRIM(player_name)) >= 2 AND
        LENGTH(TRIM(player_name)) <= 50 AND
        player_name !~ '[<>{}[\]\\|`]'
    )
);

-- Indexes for performance
CREATE INDEX idx_matches_created_by ON matches(created_by);
CREATE INDEX idx_matches_date ON matches(date DESC);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_match_players_match_id ON match_players(match_id);
CREATE INDEX idx_match_players_paid ON match_players(paid);
CREATE INDEX idx_match_players_reminder ON match_players(match_id, paid, reminder_sent);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches table

-- Captain can view their own matches created in last 4 weeks
CREATE POLICY "captains_view_own_recent_matches" ON matches
    FOR SELECT
    USING (
        created_by = auth.uid() AND
        date >= CURRENT_DATE - INTERVAL '28 days'
    );

-- Captain can create matches
CREATE POLICY "captains_create_matches" ON matches
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Captain can update only their own matches
CREATE POLICY "captains_update_own_matches" ON matches
    FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Anyone can view open matches (for public match page)
CREATE POLICY "anyone_view_open_matches" ON matches
    FOR SELECT
    USING (status = 'open');

-- RLS Policies for match_players table

-- Captain can view players in their matches
CREATE POLICY "captains_view_own_match_players" ON match_players
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_players.match_id
            AND matches.created_by = auth.uid()
        )
    );

-- Captain can update players in their matches (mark paid, etc)
CREATE POLICY "captains_update_own_match_players" ON match_players
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_players.match_id
            AND matches.created_by = auth.uid()
        )
    );

-- Players can view players in open matches
CREATE POLICY "anyone_view_players_in_open_matches" ON match_players
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_players.match_id
            AND matches.status = 'open'
        )
    );

-- Players can join open matches (insert)
CREATE POLICY "anyone_join_open_matches" ON match_players
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_players.match_id
            AND matches.status = 'open'
        )
    );

-- Players can only update their own paid status in open matches
-- This prevents players from modifying other players' data
CREATE POLICY "players_update_own_paid_status" ON match_players
    FOR UPDATE
    USING (
        paid = false AND -- Can only update if currently unpaid
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_players.match_id
            AND matches.status = 'open'
        )
    )
    WITH CHECK (
        paid = true AND -- Can only set to paid
        paid_at IS NOT NULL -- Must set paid timestamp
    );

-- Function to automatically delete old matches (older than 28 days)
CREATE OR REPLACE FUNCTION delete_old_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM matches
    WHERE date < CURRENT_DATE - INTERVAL '28 days';
END;
$$;

-- Function to get reminder candidates
CREATE OR REPLACE FUNCTION get_reminder_candidates()
RETURNS TABLE (
    match_id UUID,
    match_date DATE,
    fee_amount INTEGER,
    player_id UUID,
    player_name TEXT,
    captain_user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.date,
        m.fee_amount,
        mp.id,
        mp.player_name,
        m.created_by
    FROM match_players mp
    JOIN matches m ON m.id = mp.match_id
    WHERE mp.paid = false
        AND mp.reminder_sent = false
        AND m.status = 'open'
        AND CURRENT_DATE >= m.date + (m.reminder_after_days || ' days')::INTERVAL;
END;
$$;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION mark_reminder_sent(player_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE match_players
    SET reminder_sent = true
    WHERE id = ANY(player_ids);
END;
$$;

-- Function to sanitize player name
CREATE OR REPLACE FUNCTION sanitize_player_name(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Trim, remove extra spaces, title case
    RETURN TRIM(REGEXP_REPLACE(name, '\s+', ' ', 'g'));
END;
$$;

-- Trigger to sanitize player names on insert/update
CREATE OR REPLACE FUNCTION trigger_sanitize_player_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.player_name := sanitize_player_name(NEW.player_name);
    RETURN NEW;
END;
$$;

CREATE TRIGGER sanitize_player_name_trigger
BEFORE INSERT OR UPDATE ON match_players
FOR EACH ROW
EXECUTE FUNCTION trigger_sanitize_player_name();

-- View for captain dashboard (only last 4 weeks)
CREATE OR REPLACE VIEW captain_dashboard_matches AS
SELECT
    m.id,
    m.date,
    m.fee_amount,
    m.status,
    m.created_at,
    m.created_by,
    COUNT(mp.id) as total_players,
    COUNT(mp.id) FILTER (WHERE mp.paid = true) as paid_count,
    COALESCE(SUM(m.fee_amount) FILTER (WHERE mp.paid = true), 0) as total_collected
FROM matches m
LEFT JOIN match_players mp ON mp.match_id = m.id
WHERE m.date >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY m.id, m.date, m.fee_amount, m.status, m.created_at, m.created_by;

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant select on views
GRANT SELECT ON captain_dashboard_matches TO authenticated;
