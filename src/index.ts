import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import { runSchema } from "./db/schema";
import { pool } from "./db";
import { slfAuth } from "./middleware/slfAuth";
import { requireRole } from "./middleware/requireRole";
import { idempotency } from "./middleware/idempotency";
import { createDeal, getDeals } from "./modules/deals.controller";
import { updateDealStatus } from "./modules/status.controller";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});
app.get("/ready", (_, res) => res.json({ ready: true }));

app.post("/slf/deals", slfAuth, idempotency, createDeal);
app.get("/slf/deals", slfAuth, getDeals);
app.patch("/slf/deals/:id/status", slfAuth, requireRole("admin"), updateDealStatus);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

async function start() {
  await runSchema();
  app.listen(config.port, () => {
    console.log(`SLF Server running on port ${config.port}`);
  });
}

start();
