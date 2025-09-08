-- Set up cron job to update CEDEAR prices every minute
SELECT cron.schedule(
  'update-cedear-prices-minutely',
  '* * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://tquuloafjtxbopnpzmxw.functions.supabase.co/functions/v1/update-cedear-prices',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);