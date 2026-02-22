CREATE SCHEMA IF NOT EXISTS slf;

CREATE TABLE IF NOT EXISTS slf.deals (
    id UUID PRIMARY KEY,
    slf_id INTEGER NOT NULL,
    product_family TEXT NOT NULL,
    amount NUMERIC,
    country TEXT,
    status TEXT,
    is_active BOOLEAN,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_synced_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(slf_id, product_family)
);

CREATE TABLE IF NOT EXISTS slf_deal_logs (
  id SERIAL PRIMARY KEY,
  deal_id TEXT,
  headers JSONB,
  ip TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS slf_idempotency (
  idempotency_key TEXT PRIMARY KEY,
  request_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
