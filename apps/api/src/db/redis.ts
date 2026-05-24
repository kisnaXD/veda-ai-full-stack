import IORedis from "ioredis";
import { config } from "../config";

export const redisConnection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redisConnection.on("connect", () => console.log("[redis] connected →", config.redisUrl));
redisConnection.on("error", (err) => console.error("[redis] error:", err.message));
