import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

const SLF_TOKEN = requireEnv("SLF_TOKEN");
const SLF_BASE_URL = requireEnv("SLF_BASE_URL");

if (
  SLF_TOKEN.includes("YOUR_REAL_TOKEN") ||
  SLF_TOKEN.includes("ACTUAL_TOKEN")
) {
  throw new Error(
    "SLF_TOKEN is still a placeholder. Insert real token from Sergey."
  );
}

if (!SLF_TOKEN.startsWith("Token ")) {
  throw new Error("SLF_TOKEN must start with 'Token '");
}

export const ENV = {
  PORT: process.env.PORT || "4001",
  DATABASE_URL: requireEnv("DATABASE_URL"),
  SLF_BASE_URL,
  SLF_TOKEN,
  SLF_PRODUCT_FAMILIES: (process.env.SLF_PRODUCT_FAMILIES || "credit")
    .split(",")
    .map((family: string) => family.trim()),
  SYNC_INTERVAL_MINUTES: Number(process.env.SYNC_INTERVAL_MINUTES || 5),
};
