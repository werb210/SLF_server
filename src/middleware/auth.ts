import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../config/env";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");

  if (!key || key !== env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
}

export function hmacValidator(req: Request, res: Response, next: NextFunction) {
  const signature = req.header("x-signature");

  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const rawBody = (req as any).rawBody;

  if (!rawBody) {
    return res.status(400).json({ error: "Raw body missing" });
  }

  const expected = crypto
    .createHmac("sha256", env.HMAC_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
}
