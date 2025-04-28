
-- Enable the pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the archive-old-orders function every hour
SELECT cron.schedule(
  'archive-old-orders-hourly',  -- unique job name
  '0 * * * *',                  -- cron schedule (every hour at minute 0)
  $$
  SELECT net.http_post(
    url := 'https://imcxvnivqrckgjrimzck.supabase.co/functions/v1/archive-old-orders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltY3h2bml2cXJja2dqcmltemNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NjM4NjIsImV4cCI6MjA1ODUzOTg2Mn0.BGIWnSFMuz4AR0FuYeH8kRvRwoa72x6JMtdnTbOE6k0"}'::jsonb,
    body := '{"action": "run-scheduled"}'::jsonb
  ) as request_id;
  $$
);
