import { Pool } from "pg"
import fs from "fs"
import path from "path"

export async function runMigrations(pool: Pool) {
  const sql = fs.readFileSync(
    path.join(process.cwd(), "migrations/001_initial_schema.sql"),
    "utf8"
  )
  await pool.query(sql)
}
