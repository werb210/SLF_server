import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import dealsRouter from "./routes/deals";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());

// Health check
app.get("/health", async (_req, res) => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await pool.query("SELECT 1");
    return res.json({ status: "ok" });
  } catch (err) {
    console.error("Health check failed:", err);
    return res.status(500).json({ status: "db_error" });
  }
});

// Deals API
app.use("/deals", dealsRouter);

// Root route
app.get("/", (_req, res) => {
  res.json({ message: "SLF Server Running" });
});

app.listen(port, () => {
  console.log(`SLF Server running on port ${port}`);
});
