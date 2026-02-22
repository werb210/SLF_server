import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { apiKeyAuth } from "../middleware/auth";

const router = Router();

const DealSchema = z.object({
  id: z.string().min(1),
  product_family: z.string().min(1),
  raw_payload: z.record(z.string(), z.any()),
});

router.post("/", apiKeyAuth, async (req, res, next) => {
  try {
    const data = DealSchema.parse(req.body);

    await pool.query(
      `
      INSERT INTO slf_deals (id, product_family, raw_payload)
      VALUES ($1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET
        product_family = EXCLUDED.product_family,
        raw_payload = EXCLUDED.raw_payload,
        updated_at = NOW()
      `,
      [data.id, data.product_family, data.raw_payload]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get("/", apiKeyAuth, async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM slf_deals ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
