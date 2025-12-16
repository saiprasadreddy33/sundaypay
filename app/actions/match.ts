'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { generateShareMessage } from '@/lib/utils';
import { FeeBreakdown } from '@/lib/types';

const feeItemSchema = z.object({
  title: z.string().min(1).max(50),
  amount: z.number().positive(),
});

const createMatchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fee_amount: z.number().positive(),
  upi_id: z.string().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/, 'Invalid UPI ID'),
  reminder_after_days: z.number().min(0).max(14),
  fee_breakdown: z.object({
    player_count: z.number().positive(),
    items: z.array(feeItemSchema),
    is_detailed: z.boolean(),
  }).optional(),
});

export async function createMatchAction(data: any) {
  const user = await requireAuth();
  const supabase = await createClient();

  // Validate input
  const validation = createMatchSchema.safeParse(data);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const validated = validation.data;

  // Generate share message
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Insert match
  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      date: validated.date,
      fee_amount: validated.fee_amount,
      upi_id: validated.upi_id,
      reminder_after_days: validated.reminder_after_days,
      created_by: user.id,
      total_players: validated.fee_breakdown?.player_count || null,
      fee_breakdown: validated.fee_breakdown || null,
      status: 'open',
    })
    .select()
    .single();

  if (error || !match) {
    return { error: 'Failed to create match' };
  }

  // Generate share message after match is created
  const matchLink = `${siteUrl}/match/${match.id}`;
  const shareMessage = generateShareMessage(
    validated.date,
    validated.fee_amount,
    validated.fee_breakdown,
    matchLink
  );

  // Update match with share message
  await supabase
    .from('matches')
    .update({ share_message: shareMessage })
    .eq('id', match.id);

  revalidatePath('/dashboard');

  return { success: true, matchId: match.id };
}

export async function closeMatchAction(matchId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('matches')
    .update({ status: 'closed' })
    .eq('id', matchId)
    .eq('created_by', user.id);

  if (error) {
    return { error: 'Failed to close match' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/match/${matchId}/admin`);

  return { success: true };
}

export async function markPlayerPaidAction(playerId: string, matchId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  // Verify match belongs to captain
  const { data: match } = await supabase
    .from('matches')
    .select('created_by')
    .eq('id', matchId)
    .single();

  if (!match || match.created_by !== user.id) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('match_players')
    .update({
      paid: true,
      paid_at: new Date().toISOString()
    })
    .eq('id', playerId)
    .eq('match_id', matchId);

  if (error) {
    return { error: 'Failed to mark player as paid' };
  }

  revalidatePath(`/match/${matchId}/admin`);

  return { success: true };
}

export async function markPlayerPendingAction(playerId: string, matchId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  // Verify match belongs to captain
  const { data: match } = await supabase
    .from('matches')
    .select('created_by, status')
    .eq('id', matchId)
    .single();

  if (!match || match.created_by !== user.id) {
    return { error: 'Unauthorized' };
  }

  if (match.status !== 'open') {
    return { error: 'Cannot change payment status on a closed match' };
  }

  const { error } = await supabase
    .from('match_players')
    .update({
      paid: false,
      paid_at: null,
    })
    .eq('id', playerId)
    .eq('match_id', matchId);

  if (error) {
    return { error: 'Failed to mark player as pending' };
  }

  revalidatePath(`/match/${matchId}/admin`);

  return { success: true };
}

export async function getDashboardMatches() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from('captain_dashboard_matches')
    .select('*')
    .eq('created_by', user.id)
    .order('date', { ascending: false });

  if (error) {
    return { error: 'Failed to load matches' };
  }

  return { matches };
}

export async function deleteMatchAction(matchId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)
    .eq('created_by', user.id);

  if (error) {
    return { error: error.message || 'Failed to delete match' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
