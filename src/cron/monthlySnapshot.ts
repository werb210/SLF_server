import cron from "node-cron"

export function startMonthlySnapshot() {
  cron.schedule("0 0 1 * *", async () => {
    console.log("Running monthly commission snapshot")
  })
}
