import cron from "node-cron";
import { ENV } from "../config/env";
import { syncFamily } from "./sync.service";
import { logger } from "../logger";

export async function syncAllFamilies(force = false) {
  const families = ENV.SLF_PRODUCT_FAMILIES;

  for (const family of families) {
    try {
      if (force) {
        logger.info(`Force syncing ${family}`);
      }
      await syncFamily(family);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

export function startSyncWorker() {
  cron.schedule(`*/${ENV.SYNC_INTERVAL_MINUTES} * * * *`, async () => {
    try {
      await syncAllFamilies();
    } catch {
      // errors are logged in syncAllFamilies
    }
  });

  logger.info("SLF Sync Worker Started");
}
