import cron from "node-cron";
import { env } from "../config/env";
import { syncFamily } from "./sync.service";
import { logger } from "../logger";

export function startSyncWorker() {
  cron.schedule(`*/${env.SYNC_INTERVAL_MINUTES} * * * *`, async () => {
    const families = env.SLF_PRODUCT_FAMILIES.split(",");

    for (const family of families) {
      try {
        await syncFamily(family.trim());
      } catch (err) {
        logger.error(err);
      }
    }
  });

  logger.info("SLF Sync Worker Started");
}
