import { slfClient } from "./client";
import { pool } from "../db/pool";
import { v4 as uuid } from "uuid";
import { logger } from "../logger";

export async function syncFamily(productFamily: string) {
  const endpoint = `/api/${productFamily}/request/`;
  logger.info(`Syncing ${productFamily}`);

  const { data } = await slfClient.get(endpoint);

  for (const deal of data) {
    await pool.query(
      `
      INSERT INTO slf.deals (
        id, slf_id, product_family, amount, country,
        status, is_active, raw_payload
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (slf_id, product_family)
      DO UPDATE SET
        raw_payload = EXCLUDED.raw_payload,
        amount = EXCLUDED.amount,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        updated_at = NOW(),
        last_synced_at = NOW();
      `,
      [
        uuid(),
        deal.id,
        productFamily,
        deal.amount,
        deal.country,
        deal.offered,
        deal.is_active,
        deal
      ]
    );
  }

  logger.info(`Sync complete for ${productFamily}`);
}
