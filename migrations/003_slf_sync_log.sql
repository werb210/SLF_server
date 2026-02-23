CREATE TABLE IF NOT EXISTS slf_sync_log (
  id SERIAL PRIMARY KEY,
  last_sync TIMESTAMP DEFAULT NOW(),
  records_synced INTEGER DEFAULT 0,
  status TEXT,
  error TEXT
);
