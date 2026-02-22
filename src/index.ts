import express from "express";
import { env } from "./config/env";
import health from "./routes/health";
import { startSyncWorker } from "./slf/sync.worker";

const app = express();
app.use(express.json());
app.use("/health", health);

startSyncWorker();

app.listen(env.PORT, () => {
  console.log(`SLF Server running on port ${env.PORT}`);
});
