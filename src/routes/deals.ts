import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { pool } from "../db";
import { apiKeyAuth, hmacValidator } from "../middleware/auth";
import { limiter } from "../middleware/rateLimit";
import { BUSINESS_UNIT } from "../config/businessUnit";

const router = Router();

const DealSchema = z.object({
  id: z.string().min(1),
  product_family: z.string().min(1),
  raw_payload: z.record(z.string(), z.any()),
});

router.post("/", limiter, apiKeyAuth, hmacValidator, async (req, res, next) => {
  const ip = req.ip;
  const headers = req.headers;

  try {
    const data = DealSchema.parse(req.body);

    const idempotencyKey = req.header("x-idempotency-key");
    const requestHash = crypto
      .createHash("sha256")
      .update((req as any).rawBody)
      .digest("hex");

    if (idempotencyKey) {
      // Cleanup old keys (24hr window)
      await pool.query(
        `DELETE FROM slf_idempotency
         WHERE created_at < NOW() - INTERVAL '24 hours'`
      );

      const existing = await pool.query(
        `SELECT * FROM slf_idempotency WHERE idempotency_key = $1`,
        [idempotencyKey]
      );

      if (existing.rows.length > 0) {
        return res.json({ message: "Duplicate request ignored" });
      }

      await pool.query(
        `INSERT INTO slf_idempotency (idempotency_key, request_hash)
     VALUES ($1, $2)`,
        [idempotencyKey, requestHash]
      );
    }

    await pool.query(
      `INSERT INTO slf_deals (id, business_unit, product_family, raw_payload)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id)
         DO UPDATE SET
           business_unit = EXCLUDED.business_unit,
           product_family = EXCLUDED.product_family,
           raw_payload = EXCLUDED.raw_payload,
           updated_at = NOW()`,
      [data.id, BUSINESS_UNIT, data.product_family, data.raw_payload]
    );

    await pool.query(
      `INSERT INTO slf_deal_logs (deal_id, headers, ip)
         VALUES ($1, $2, $3)`,
      [data.id, headers, ip]
    );

    res.json({ success: true });
  } catch (err: any) {
    await pool.query(
      `INSERT INTO slf_deal_logs (headers, ip, error)
         VALUES ($1, $2, $3)`,
      [headers, ip, err.message]
    );

    next(err);
  }
});

export default router;
