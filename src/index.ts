import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { pool } from "./db";
import dealsRouter from "./routes/deals";

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
