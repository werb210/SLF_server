import { Request, Response } from "express";
import { syncAllFamilies } from "./sync.worker";
import { slfState } from "./slf.state";

export async function manualSync(req: Request, res: Response) {
  try {
    await syncAllFamilies(true); // force mode
    return res.json({
      status: "triggered",
      lastSuccessfulSync: slfState.lastSuccessfulSync,
      lastError: slfState.lastError
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "failed",
      error: err.message
    });
  }
}
