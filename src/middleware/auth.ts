import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

export function slfAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth || auth !== `Bearer ${config.slfToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
