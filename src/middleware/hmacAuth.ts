import crypto from "crypto"
import { Request, Response, NextFunction } from "express"

export function verifyHmac(secret: string) {
  return (req: Request & { rawBody?: string }, res: Response, next: NextFunction) => {
    const signature = req.headers["x-signature"] as string

    if (!signature) {
      return res.status(401).json({ error: "Missing signature header" })
    }

    const computed = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody || "")
      .digest("hex")

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed))) {
      return res.status(401).json({ error: "Invalid signature" })
    }

    next()
  }
}
