import { Request, Response } from "express";
import { getAllDeals } from "./slf.repository";

export async function listDeals(req: Request, res: Response) {
  const deals = await getAllDeals();
  res.json({ count: deals.length, deals });
}
