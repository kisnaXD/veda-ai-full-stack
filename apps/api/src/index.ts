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

function parseOrigins(raw: string): Array<string | RegExp> {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (!s.includes("*")) return s;
      const escaped = s.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`);
    });
}

const allowedOrigins = parseOrigins(config.corsOrigin);

async function main() {
  await connectMongo();
  await redisConnection.ping();

  const app = express();
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        for (const o of allowedOrigins) {
          if (typeof o === "string" ? o === origin : o.test(origin)) {
            return callback(null, true);
          }
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );
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
