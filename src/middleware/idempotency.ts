import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export async function idempotency(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-idempotency-key"] as string;

  if (!key) return next();

  const exists = await pool.query(
    "SELECT 1 FROM slf_idempotency WHERE idempotency_key=$1",
    [key]
  );

  if ((exists.rowCount ?? 0) > 0) {
    return res.status(409).json({ error: "Duplicate request" });
  }

  await pool.query(
    "INSERT INTO slf_idempotency (idempotency_key) VALUES ($1)",
    [key]
  );

  next();
}
