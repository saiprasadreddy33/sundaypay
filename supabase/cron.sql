-- Supabase Cron Job Configuration
-- Run this in your Supabase SQL Editor to set up daily tasks

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily tasks to run at 2 AM UTC every day
SELECT cron.schedule(
    'sundaypay-daily-tasks',
    '0 2 * * *',
    $$
    SELECT
      net.http_post(
          url:='YOUR_SUPABASE_FUNCTION_URL/daily-tasks',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('sundaypay-daily-tasks');
