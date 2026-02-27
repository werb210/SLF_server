import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { ENV, config } from "../config/env";

export function slfAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth || auth !== `Bearer ${config.slfToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"];

  if (!key || key !== ENV.API_KEY) {
    return res.status(401).json({ error: "invalid_api_key" });
  }

  next();
}

export function hmacValidator(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["x-signature"];

  if (!signature || Array.isArray(signature)) {
    return res.status(401).json({ error: "missing_signature" });
  }

  if (!ENV.HMAC_SECRET) {
    return res.status(500).json({ error: "hmac_not_configured" });
  }

  const rawBody = (req as Request & { rawBody?: string }).rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: "missing_raw_body" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", ENV.HMAC_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: "invalid_signature" });
  }

  next();
}
