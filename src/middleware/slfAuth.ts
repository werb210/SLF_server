import { Request, Response, NextFunction } from "express";

export interface SLFUser {
  role: "admin" | "staff";
}

declare global {
  namespace Express {
    interface Request {
      user?: SLFUser;
    }
  }
}

export function slfAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.replace("Bearer ", "");

  if (token !== process.env.SLF_TOKEN) {
    return res.status(403).json({ error: "Invalid token" });
  }

  req.user = { role: "admin" };

  next();
}
