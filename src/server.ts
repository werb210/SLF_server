import express from "express"
import { Pool } from "pg"
import dotenv from "dotenv"

import { rawBodyMiddleware } from "./middleware/rawBody"
import { verifyHmac } from "./middleware/hmacAuth"
import { idempotency } from "./middleware/idempotency"

import { dealsRouter } from "./routes/deals"
import { runMigrations } from "./db/init"

import { startSyncWorker } from "./slf/sync.worker"
import { startMonthlySnapshot } from "./cron/monthlySnapshot"

dotenv.config()

const PORT = process.env.PORT || 4001

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function start() {
  await runMigrations(pool)

  const app = express()

  app.use(rawBodyMiddleware)

  app.get("/health", async (_, res) => {
    await pool.query("SELECT 1")
    res.json({ status: "ok" })
  })

  app.use(
    "/deals",
    verifyHmac(process.env.HMAC_SECRET || "dev"),
    idempotency(pool),
    dealsRouter(pool)
  )

  app.listen(PORT, () => {
    console.log("SLF server running on port", PORT)
  })

  startSyncWorker()
  startMonthlySnapshot()
}

start()
