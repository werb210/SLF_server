import { pool } from "../db/pool";
import { BUSINESS_UNIT } from "../config/businessUnit";

export async function upsertDeal(id: string, family: string, payload: unknown) {
  await pool.query(
    `
    INSERT INTO slf_deals (id, business_unit, product_family, raw_payload)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id)
    DO UPDATE SET
      business_unit = EXCLUDED.business_unit,
      product_family = EXCLUDED.product_family,
      raw_payload = EXCLUDED.raw_payload,
      updated_at = NOW()
    `,
    [id, BUSINESS_UNIT, family, payload]
  );
}

export async function getAllDeals() {
  const { rows } = await pool.query(
    `SELECT * FROM slf_deals WHERE business_unit = $1 ORDER BY updated_at DESC LIMIT 100`,
    [BUSINESS_UNIT]
  );
  return rows;
}
