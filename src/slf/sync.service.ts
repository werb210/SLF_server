import { upsertDeal } from "./slf.repository";
import { logger } from "../logger";
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
      await upsertDeal(deal.id || deal.uuid, productFamily, deal);
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
