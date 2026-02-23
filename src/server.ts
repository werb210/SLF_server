import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json());

async function ensureSchema() {
  await pool.query("ALTER TABLE slf_deals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';");
}

/**
 * Health Endpoint
 */
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db_error" });
  }
});

/**
 * Sync Logging Endpoint (call this after SLF poll)
 */
app.post("/internal/sync-log", async (req, res) => {
  const { recordsSynced, status, error } = req.body;

  await pool.query(
    `
    INSERT INTO slf_sync_log (records_synced, status, error)
    VALUES ($1,$2,$3)
    `,
    [recordsSynced || 0, status || "unknown", error || null]
  );

  res.json({ success: true });
});

/**
 * Last Sync Status
 */
app.get("/sync-status", async (_req, res) => {
  const result = await pool.query(
    `
    SELECT * FROM slf_sync_log
    ORDER BY last_sync DESC
    LIMIT 1
    `
  );

  res.json(result.rows[0] || null);
});

app.get("/api/pipeline", async (_req, res) => {
  const result = await pool.query(`
    SELECT status, COUNT(*) as count
    FROM slf_deals
    GROUP BY status
  `);

  res.json(result.rows);
});

app.get("/api/deals", async (_req, res) => {
  const result = await pool.query(
    "SELECT * FROM slf_deals ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

ensureSchema()
  .then(() => {
    app.listen(process.env.PORT || 4001, () =>
      console.log("SLF Server running")
    );
  })
  .catch(err => {
    console.error("Failed to initialize schema", err);
    process.exit(1);
  });
