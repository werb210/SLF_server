import { pool } from "../db/pool";
import { logger } from "../logger";
import { v4 as uuid } from "uuid";
import { calculateBackoff } from "./backoff";
import { slfClient } from "./client";
import { slfState } from "./slf.state";

function getErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { detail?: string } } }).response ===
      "object"
  ) {
    const detail = (err as { response?: { data?: { detail?: string } } }).response
      ?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Unknown SLF sync error";
}

export async function syncFamily(productFamily: string) {
  const now = Date.now();

  if (slfState.suspendedUntil && now < slfState.suspendedUntil) {
    logger.warn(
      `SLF ${productFamily} sync is suspended until ${new Date(
        slfState.suspendedUntil
      ).toISOString()}`
    );
    return;
  }

  const endpoint = `/api/${productFamily}/request/`;
  logger.info(`Syncing ${productFamily}`);

  try {
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
          deal,
        ]
      );
    }

    slfState.lastSuccessfulSync = now;
    slfState.consecutiveFailures = 0;
    slfState.lastError = null;
    slfState.suspendedUntil = null;

    logger.info(`Sync complete for ${productFamily}`);
  } catch (err: unknown) {
    slfState.consecutiveFailures += 1;
    slfState.lastError = getErrorMessage(err);

    const backoff = calculateBackoff(slfState.consecutiveFailures);
    slfState.suspendedUntil = now + backoff;

    logger.error(
      `SLF ${productFamily} sync failed: ${slfState.lastError}. Backing off ${
        backoff / 1000
      }s`
    );

    throw err;
  }
}
