import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || "4001",
  DATABASE_URL: process.env.DATABASE_URL!,
  SLF_BASE_URL: process.env.SLF_BASE_URL!,
  SLF_TOKEN: process.env.SLF_TOKEN!,
  SLF_PRODUCT_FAMILIES: process.env.SLF_PRODUCT_FAMILIES || "credit",
  SYNC_INTERVAL_MINUTES: Number(process.env.SYNC_INTERVAL_MINUTES || 5)
};
