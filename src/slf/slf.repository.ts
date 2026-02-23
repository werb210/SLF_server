import { pool } from "../db/pool";
import { BUSINESS_UNIT } from "../config/businessUnit";

export async function upsertDeal(
  externalId: string,
  family: string,
  payload: unknown,
  borrowerName: string | null,
  amount: number | null,
  status: string
) {
  await pool.query(
    `
    INSERT INTO slf_deals (external_id, business_unit, product_family, raw_payload, borrower_name, amount, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (external_id)
    DO UPDATE SET
      business_unit = EXCLUDED.business_unit,
      product_family = EXCLUDED.product_family,
      raw_payload = EXCLUDED.raw_payload,
      borrower_name = EXCLUDED.borrower_name,
      amount = EXCLUDED.amount,
      status = EXCLUDED.status,
      updated_at = NOW()
    `,
    [externalId, BUSINESS_UNIT, family, payload, borrowerName, amount, status]
  );
}

export async function getAllDeals() {
  const { rows } = await pool.query(
    `SELECT * FROM slf_deals WHERE business_unit = $1 ORDER BY updated_at DESC LIMIT 100`,
    [BUSINESS_UNIT]
  );
  return rows;
}
