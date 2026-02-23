ALTER TABLE slf_deals
ADD COLUMN IF NOT EXISTS business_unit TEXT DEFAULT 'SLF',
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'INTAKE',
ADD COLUMN IF NOT EXISTS funded_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS funded_at TIMESTAMP;

UPDATE slf_deals
SET business_unit = 'SLF'
WHERE business_unit IS NULL;

CREATE TABLE IF NOT EXISTS slf_monthly_commission_snapshots (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  total_submitted INTEGER NOT NULL,
  total_funded INTEGER NOT NULL,
  close_rate NUMERIC NOT NULL,
  tier_applied NUMERIC NOT NULL,
  funded_volume NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
