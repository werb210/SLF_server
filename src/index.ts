import express from "express";
import { env } from "./config/env";
import health from "./routes/health";
import { slfState } from "./slf/slf.state";
import { startSyncWorker } from "./slf/sync.worker";

const app = express();
app.use(express.json());
app.use("/health", health);

app.get("/health/slf", (_req, res) => {
  res.json({
    status: slfState.consecutiveFailures > 3 ? "degraded" : "ok",
    lastSuccessfulSync: slfState.lastSuccessfulSync,
    lastError: slfState.lastError,
    consecutiveFailures: slfState.consecutiveFailures,
  });
});

startSyncWorker();

app.listen(env.PORT, () => {
  console.log(`SLF Server running on port ${env.PORT}`);
});
