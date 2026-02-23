CREATE TABLE IF NOT EXISTS slf_deals (
    id TEXT PRIMARY KEY,
    business_unit TEXT NOT NULL DEFAULT 'SLF',
    product_family TEXT NOT NULL,
    raw_payload JSONB NOT NULL,
    stage TEXT DEFAULT 'INTAKE',
    funded_amount NUMERIC DEFAULT 0,
    funded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
