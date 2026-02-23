import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { pool } from "./db";
import dealsRouter from "./routes/deals";
import { calculateCurrentCommission } from "./services/commission.service";
import "./cron/monthlySnapshot";

const app = express();

/**
 * Security headers
 */
app.use(helmet());

/**
 * Capture raw body for HMAC verification
 */
app.use(
  express.json({
    limit: "1mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db_error" });
  }
});

app.use("/deals", dealsRouter);

const restrictedRoutes = [
  "/api/client-messaging",
  "/api/lender-transmission",
  "/api/document-uploads",
  "/api/marketing-automation",
];

restrictedRoutes.forEach((route) => {
  app.all(`${route}*`, (_req, res) => {
    res.status(403).json({ error: "Feature not available in SLF server" });
  });
});

app.get("/api/slf/reports/summary", async (_req, res) => {
  try {
    const summary = await calculateCurrentCommission();
    res.json(summary);
  } catch {
    res.status(500).json({ error: "Failed to generate report" });
  }
});


app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(400).json({ error: err.message });
});

/**
 * Graceful shutdown
 */
process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Interrupted. Closing DB...");
  await pool.end();
  process.exit(0);
});

app.listen(env.PORT, () => {
  console.log(`SLF Server running on port ${env.PORT}`);
});
