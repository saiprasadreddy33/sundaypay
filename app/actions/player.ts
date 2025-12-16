'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { sanitizePlayerName } from '@/lib/utils';

const joinMatchSchema = z.object({
  matchId: z.string().uuid(),
  playerName: z.string().min(2).max(50),
});

const markPaidSchema = z.object({
  playerId: z.string().uuid(),
  matchId: z.string().uuid(),
});

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function joinMatchAction(data: any) {
  const supabase = await createClient();

  // Validate input
  const validation = joinMatchSchema.safeParse(data);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { matchId, playerName } = validation.data;

  // Rate limit by match ID
  if (!checkRateLimit(`join-${matchId}`, 10, 30000)) {
    return { error: 'Too many join attempts. Please wait.' };
  }

  // Sanitize player name
  const sanitized = sanitizePlayerName(playerName);

  // Check if match is open
  const { data: match } = await supabase
    .from('matches')
    .select('status')
    .eq('id', matchId)
    .single();

  if (!match || match.status !== 'open') {
    return { error: 'This match is no longer accepting players' };
  }

  // Attempt to join
  const { data: player, error } = await supabase
    .from('match_players')
    .insert({
      match_id: matchId,
      player_name: sanitized,
      paid: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return { error: 'This name is already joined' };
    }
    return { error: 'Failed to join match' };
  }

  revalidatePath(`/match/${matchId}`);
  revalidatePath(`/match/${matchId}/admin`);

  return { success: true, playerId: player.id };
}

export async function markSelfPaidAction(data: any) {
  const supabase = await createClient();

  // Validate input
  const validation = markPaidSchema.safeParse(data);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { playerId, matchId } = validation.data;

  // Rate limit by player ID
  if (!checkRateLimit(`paid-${playerId}`, 3, 60000)) {
    return { error: 'Too many attempts. Please wait.' };
  }

  // Update paid status (RLS will ensure player can only update their own)
  const { error } = await supabase
    .from('match_players')
    .update({
      paid: true,
      paid_at: new Date().toISOString()
    })
    .eq('id', playerId)
    .eq('match_id', matchId)
    .eq('paid', false); // Can only update if currently unpaid

  if (error) {
    return { error: 'Failed to update payment status' };
  }

  revalidatePath(`/match/${matchId}`);
  revalidatePath(`/match/${matchId}/admin`);

  return { success: true };
}

export async function getMatchDetails(matchId: string) {
  const supabase = await createClient();

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .eq('status', 'open')
    .single();

  if (matchError || !match) {
    return { error: matchError?.message || 'Match not found or closed' };
  }

  const { data: players, error: playersError } = await supabase
    .from('match_players')
    .select('*')
    .eq('match_id', matchId)
    .order('joined_at', { ascending: true });

  if (playersError) {
    return { error: playersError.message || 'Failed to load players' };
  }

  return { match, players };
}

export async function getMatchDetailsForAdmin(matchId: string) {
  const supabase = await createClient();

  // This requires authentication via requireAuth in the calling component
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (matchError || !match) {
    return { error: matchError?.message || 'Match not found' };
  }

  const { data: players, error: playersError } = await supabase
    .from('match_players')
    .select('*')
    .eq('match_id', matchId)
    .order('joined_at', { ascending: true });

  if (playersError) {
    return { error: 'Failed to load players' };
  }

  return { match, players };
}
