export type MatchStatus = 'open' | 'closed';

export interface FeeItem {
  title: string;
  amount: number;
}

export interface FeeBreakdown {
  player_count: number;
  items: FeeItem[];
  is_detailed: boolean;
}

export interface Match {
  id: string;
  date: string;
  fee_amount: number;
  upi_id: string;
  reminder_after_days: number;
  status: MatchStatus;
  created_by: string;
  created_at: string;
  fee_breakdown: FeeBreakdown | null;
  share_message: string | null;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_name: string;
  paid: boolean;
  paid_at: string | null;
  joined_at: string;
  reminder_sent: boolean;
}

export interface DashboardMatch {
  id: string;
  date: string;
  fee_amount: number;
  status: MatchStatus;
  created_at: string;
  created_by: string;
  total_players: number;
  paid_count: number;
  total_collected: number;
}

export interface MatchWithPlayers extends Match {
  players: MatchPlayer[];
}

export interface CaptainProfile {
  user_id: string;
  display_name: string;
  team_name: string | null;
  created_at: string;
  updated_at: string;
}