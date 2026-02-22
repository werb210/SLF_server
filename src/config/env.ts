import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (!process.env.API_KEY) {
  throw new Error("API_KEY is required");
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_KEY: process.env.API_KEY,
  PORT: process.env.PORT || "4001",
};

export const ENV = {
  ...env,
  SLF_BASE_URL: process.env.SLF_BASE_URL || "",
  SLF_TOKEN: process.env.SLF_TOKEN || "",
  SLF_PRODUCT_FAMILIES: (process.env.SLF_PRODUCT_FAMILIES || "credit")
    .split(",")
    .map((family: string) => family.trim()),
  SYNC_INTERVAL_MINUTES: Number(process.env.SYNC_INTERVAL_MINUTES || 5),
};
