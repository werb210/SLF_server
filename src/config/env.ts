import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  API_KEY: required("API_KEY"),
  HMAC_SECRET: required("HMAC_SECRET"),
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
