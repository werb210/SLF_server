CREATE TABLE IF NOT EXISTS slf_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE,
    business_unit TEXT NOT NULL DEFAULT 'SLF',
    product_family TEXT NOT NULL,
    raw_payload JSONB NOT NULL,
    borrower_name TEXT,
    amount NUMERIC,
    stage TEXT DEFAULT 'INTAKE',
    status TEXT DEFAULT 'new',
    funded_amount NUMERIC DEFAULT 0,
    funded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE slf_deals
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
