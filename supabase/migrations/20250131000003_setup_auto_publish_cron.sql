-- Setup pg_cron for automatic article publishing
-- This creates a scheduled job that runs every minute to publish scheduled articles

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the auto-publish job to run every minute
SELECT cron.schedule(
  'auto-publish-scheduled-articles',  -- job name
  '* * * * *',                         -- every minute
  $$
  SELECT publish_scheduled_articles();
  $$
);

-- Check if the job was created successfully
-- You can view all cron jobs with: SELECT * FROM cron.job;
