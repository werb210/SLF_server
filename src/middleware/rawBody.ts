import express from "express"

export const rawBodyMiddleware = express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString()
  }
})
