import http from "http";
import express from "express";
import cors from "cors";
import { config } from "./config";
import { connectMongo } from "./db/mongo";
import { redisConnection } from "./db/redis";
import { initSocketServer } from "./sockets";
import { assignmentsRouter } from "./routes/assignments";
import { pdfRouter } from "./routes/pdf";
import { errorHandler } from "./middleware/error";
import { startWorkers } from "./queue/worker";

async function main() {
  await connectMongo();
  await redisConnection.ping();

  const app = express();
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/healthz", (_req, res) => res.json({ ok: true, ts: Date.now() }));
  app.use("/api/assignments", assignmentsRouter);
  app.use("/api/assignments", pdfRouter);

  app.use(errorHandler);

  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  startWorkers();

  httpServer.listen(config.port, () => {
    console.log(`[api] http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("[api] fatal:", err);
  process.exit(1);
});
