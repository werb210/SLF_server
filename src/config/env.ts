import dotenv from "dotenv";
dotenv.config();

const required = ["DATABASE_URL", "SLF_TOKEN"];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
});

export const config = {
  port: process.env.PORT || 4001,
  databaseUrl: process.env.DATABASE_URL!,
  slfToken: process.env.SLF_TOKEN!,
  allowedFamilies: (process.env.SLF_PRODUCT_FAMILIES || "credit,equipment-financing,factoring-bid,invoice")
    .split(",")
    .map((f) => f.trim()),
};
