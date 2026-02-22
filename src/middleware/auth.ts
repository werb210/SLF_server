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

  const payload = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", env.HMAC_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
}
