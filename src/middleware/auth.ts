import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.header("x-api-key");

  if (!key || key !== env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
