import { Request, Response } from "express";
import { pool } from "../db";
import { config } from "../config/env";

export async function createDeal(req: Request, res: Response) {
  const { external_id, product_family, raw_payload } = req.body;

  if (!external_id || !product_family || !raw_payload) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!config.allowedFamilies.includes(product_family)) {
    return res.status(400).json({ error: "Invalid product family" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO slf_deals (external_id, product_family, raw_payload)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [external_id, product_family, raw_payload]
    );

    res.json({ success: true, deal: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: "Insert failed" });
  }
}

export async function getDeals(req: Request, res: Response) {
  const result = await pool.query(
    "SELECT * FROM slf_deals ORDER BY created_at DESC"
  );

  res.json(result.rows);
}
