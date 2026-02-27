import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  API_KEY: process.env.API_KEY ?? "",
  HMAC_SECRET: process.env.HMAC_SECRET ?? "",
  SLF_TOKEN: process.env.SLF_TOKEN ?? "",
  SLF_BASE_URL: process.env.SLF_BASE_URL ?? "",
  SLF_PRODUCT_FAMILIES: (process.env.SLF_PRODUCT_FAMILIES ??
    "credit,equipment-financing,factoring-bid,invoice")
    .split(",")
    .map((family) => family.trim())
    .filter(Boolean),
  SYNC_INTERVAL_MINUTES: Number(process.env.SYNC_INTERVAL_MINUTES ?? 5),
};

if (ENV.NODE_ENV === "production") {
  if (!ENV.JWT_SECRET) throw new Error("Missing JWT_SECRET");
  if (!ENV.DATABASE_URL) throw new Error("Missing DATABASE_URL");
}

export const config = {
  port: ENV.PORT,
  databaseUrl: ENV.DATABASE_URL,
  slfToken: ENV.SLF_TOKEN,
  allowedFamilies: ENV.SLF_PRODUCT_FAMILIES,
};
