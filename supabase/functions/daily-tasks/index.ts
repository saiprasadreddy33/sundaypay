// Supabase Edge Function for daily tasks
// This function should be scheduled to run daily via Supabase Cron Jobs

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderCandidate {
  match_id: string;
  match_date: string;
  fee_amount: number;
  player_id: string;
  player_name: string;
  captain_user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Task 1: Delete old matches (older than 28 days)
    const { error: deleteError } = await supabase.rpc('delete_old_matches');
    
    if (deleteError) {
      console.error('Error deleting old matches:', deleteError);
    } else {
      console.log('Old matches deleted successfully');
    }

    // Task 2: Get reminder candidates
    const { data: reminderCandidates, error: reminderError } = await supabase.rpc<ReminderCandidate>(
      'get_reminder_candidates'
    );

    if (reminderError) {
      console.error('Error getting reminder candidates:', reminderError);
    } else if (reminderCandidates && reminderCandidates.length > 0) {
      console.log(`Found ${reminderCandidates.length} players needing reminders`);

      // Mark all as sent
      const playerIds = reminderCandidates.map(c => c.player_id);
      const { error: markError } = await supabase.rpc('mark_reminder_sent', {
        player_ids: playerIds,
      });

      if (markError) {
        console.error('Error marking reminders as sent:', markError);
      } else {
        console.log('Reminders marked as sent');
      }

      // In a production system, you would send actual WhatsApp messages or emails here
      // For now, we just log the reminder candidates
      console.log('Reminder candidates:', JSON.stringify(reminderCandidates, null, 2));
    } else {
      console.log('No reminder candidates found');
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedOldMatches: true,
        remindersProcessed: reminderCandidates?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in daily tasks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
