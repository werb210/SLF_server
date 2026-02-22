import { pool } from "../db/pool";

export async function upsertDeal(id: string, family: string, payload: unknown) {
  await pool.query(
    `
    INSERT INTO slf_deals (id, product_family, raw_payload)
    VALUES ($1, $2, $3)
    ON CONFLICT (id)
    DO UPDATE SET
      product_family = EXCLUDED.product_family,
      raw_payload = EXCLUDED.raw_payload,
      updated_at = NOW()
    `,
    [id, family, payload]
  );
}

export async function getAllDeals() {
  const { rows } = await pool.query(
    `SELECT * FROM slf_deals ORDER BY updated_at DESC LIMIT 100`
  );
  return rows;
}
