import cron from "node-cron"

export async function syncAllFamilies(force = false) {
  console.log("Running SLF sync worker", { force })
}

export function startSyncWorker() {
  cron.schedule("*/10 * * * *", async () => {
    await syncAllFamilies(false)
  })
}
