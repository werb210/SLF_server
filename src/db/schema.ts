import { pool } from "./index";

export async function runSchema() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS slf_deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      external_id TEXT UNIQUE,
      product_family TEXT NOT NULL,
      raw_payload JSONB NOT NULL,
      status TEXT DEFAULT 'received',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS slf_idempotency (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      idempotency_key TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS slf_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ip TEXT,
      headers JSONB,
      payload JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
