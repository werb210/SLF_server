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
