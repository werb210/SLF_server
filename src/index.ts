import express from "express";
import { ENV } from "./config/env";
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

app.listen(ENV.PORT, () => {
  console.log(`SLF Server running on port ${ENV.PORT}`);
});
