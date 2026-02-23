import { Request, Response } from "express";
import { pool } from "../db";

export async function updateDealStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["received", "processing", "completed", "rejected"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  await pool.query("UPDATE slf_deals SET status=$1 WHERE id=$2", [status, id]);

  await pool.query(
    "INSERT INTO slf_logs(entity_type, entity_id, event_type, metadata) VALUES($1,$2,$3,$4)",
    ["deal", id, "status_update", { status }]
  );

  res.json({ success: true });
}
