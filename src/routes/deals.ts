import { Router } from "express"
import { Pool } from "pg"

export function dealsRouter(pool: Pool) {
  const router = Router()

  router.post("/", async (req, res) => {
    const payload = req.body

    const result = await pool.query(
      `INSERT INTO slf_deals
      (external_id, borrower_name, amount, raw_payload)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [
        payload.external_id,
        payload.borrower_name,
        payload.amount,
        payload
      ]
    )

    res.json(result.rows[0])
  })

  router.get("/", async (_, res) => {
    const deals = await pool.query(
      "SELECT * FROM slf_deals ORDER BY created_at DESC"
    )

    res.json(deals.rows)
  })

  return router
}
