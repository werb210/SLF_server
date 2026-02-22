CREATE TABLE IF NOT EXISTS slf_deals (
    id TEXT PRIMARY KEY,
    product_family TEXT NOT NULL,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
