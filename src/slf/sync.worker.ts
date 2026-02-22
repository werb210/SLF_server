import cron from "node-cron";
import { ENV } from "../config/env";
import { syncFamily } from "./sync.service";
import { logger } from "../logger";

export function startSyncWorker() {
  cron.schedule(`*/${ENV.SYNC_INTERVAL_MINUTES} * * * *`, async () => {
    const families = ENV.SLF_PRODUCT_FAMILIES;

    for (const family of families) {
      try {
        await syncFamily(family);
      } catch (err) {
        logger.error(err);
      }
    }
  });

  logger.info("SLF Sync Worker Started");
}
