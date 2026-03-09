import { Pool } from "pg"
import { Request, Response, NextFunction } from "express"
import crypto from "crypto"

export function idempotency(pool: Pool) {
  return async (req: Request & { rawBody?: string }, res: Response, next: NextFunction) => {
    const key = req.headers["x-idempotency-key"] as string
    if (!key) return res.status(400).json({ error: "Missing idempotency key" })

    const hash = crypto.createHash("sha256").update(req.rawBody || "").digest("hex")

    const existing = await pool.query(
      "SELECT * FROM slf_idempotency WHERE idempotency_key=$1",
      [key]
    )

    if ((existing.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: "Duplicate request" })
    }

    await pool.query(
      "INSERT INTO slf_idempotency (idempotency_key, request_hash) VALUES ($1,$2)",
      [key, hash]
    )

    next()
  }
}
