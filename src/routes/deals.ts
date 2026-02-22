import { Router } from "express";
import { Pool } from "pg";

const router = Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

router.post("/", async (req, res) => {
  try {
    const { id, product_family, raw_payload } = req.body;

    if (!id || !product_family || !raw_payload) {
      return res.status(400).json({
        error: "id, product_family and raw_payload are required",
      });
    }

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
      [id, product_family, raw_payload]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("DEALS INSERT ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM slf_deals ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("DEALS FETCH ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
