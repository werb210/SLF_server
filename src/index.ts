import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { Pool } from "pg";
import { z } from "zod";
import { ENV } from "./config/env";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = ENV.PORT;
const DATABASE_URL = ENV.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

if (!ENV.JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined");
}

const jwtSecret: string = ENV.JWT_SECRET;

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

/* ================= BOOTSTRAP ================= */

async function bootstrap() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS slf_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','staff')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS slf_deals (
      id SERIAL PRIMARY KEY,
      company_name TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

bootstrap();

/* ================= AUTH ================= */

function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(header.split(" ")[1], jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function requireRole(role: string) {
  return (req: any, res: any, next: any) => {
    if (req.user.role !== role && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

/* ================= USER CREATE ================= */

app.post("/slf/users/create", auth, requireRole("admin"), async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "staff"])
  });

  try {
    const data = schema.parse(req.body);
    const hash = await bcrypt.hash(data.password, 10);

    await pool.query(
      `INSERT INTO slf_users (email,password_hash,role)
       VALUES ($1,$2,$3)`,
      [data.email, hash, data.role]
    );

    res.json({ created: true });
  } catch {
    res.status(400).json({ error: "User exists or invalid" });
  }
});

/* ================= LOGIN ================= */

app.post("/slf/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query(
    `SELECT * FROM slf_users WHERE email=$1`,
    [email]
  );

  if (!user.rows.length)
    return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(
    password,
    user.rows[0].password_hash
  );

  if (!valid)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { email: user.rows[0].email, role: user.rows[0].role },
    jwtSecret,
    { expiresIn: "8h" }
  );

  res.json({ token, role: user.rows[0].role });
});

/* ================= CREATE DEAL ================= */

const DealSchema = z.object({
  company_name: z.string(),
  amount: z.number()
});

app.post("/slf/deals", auth, requireRole("staff"), async (req, res) => {
  try {
    const data = DealSchema.parse(req.body);

    await pool.query(
      `INSERT INTO slf_deals (company_name,amount)
       VALUES ($1,$2)`,
      [data.company_name, data.amount]
    );

    res.json({ created: true });
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
  }
});

/* ================= UPDATE STAGE ================= */

app.post("/slf/deals/:id/status", auth, requireRole("staff"), async (req, res) => {
  const schema = z.object({
    status: z.string()
  });

  try {
    const { status } = schema.parse(req.body);
    const { id } = req.params;

    await pool.query(
      `UPDATE slf_deals SET status=$1 WHERE id=$2`,
      [status, id]
    );

    res.json({ updated: true });
  } catch {
    res.status(400).json({ error: "Invalid status update" });
  }
});

/* ================= PIPELINE VIEW ================= */

app.get("/slf/pipeline", auth, async (req, res) => {
  const deals = await pool.query(`
    SELECT * FROM slf_deals
    ORDER BY created_at DESC
  `);

  const grouped: any = {};

  deals.rows.forEach(d => {
    if (!grouped[d.status]) grouped[d.status] = [];
    grouped[d.status].push(d);
  });

  res.json(grouped);
});

/* ================= SUMMARY REPORT ================= */

app.get("/slf/reports/summary", auth, requireRole("admin"), async (req, res) => {
  const totals = await pool.query(`
    SELECT 
      COUNT(*) as total_deals,
      SUM(amount) as total_amount
    FROM slf_deals
  `);

  res.json(totals.rows[0]);
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`SLF Server running on ${PORT}`);
});
