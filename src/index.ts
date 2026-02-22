import express from "express";
import { env } from "./config/env";
import { pool } from "./db";
import dealsRouter from "./routes/deals";

const app = express();

app.use(express.json());

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

app.listen(env.PORT, () => {
  console.log(`SLF Server running on port ${env.PORT}`);
});
