import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { runSchema } from "./db/schema";
import { slfAuth } from "./middleware/auth";
import { idempotency } from "./middleware/idempotency";
import { createDeal, getDeals } from "./modules/deals.controller";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/ready", (_, res) => res.json({ ready: true }));

app.post("/slf/deals", slfAuth, idempotency, createDeal);
app.get("/slf/deals", slfAuth, getDeals);

async function start() {
  await runSchema();
  app.listen(config.port, () => {
    console.log(`SLF Server running on port ${config.port}`);
  });
}

start();
