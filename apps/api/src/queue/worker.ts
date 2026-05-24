import { Worker } from "bullmq";
import { redisConnection } from "../db/redis";
import { connectMongo } from "../db/mongo";
import { GENERATION_QUEUE, PDF_QUEUE } from "./index";
import { processGeneration } from "./generationProcessor";

export function startWorkers() {
  const genWorker = new Worker(GENERATION_QUEUE, processGeneration, {
    connection: redisConnection,
    concurrency: 2,
  });

  genWorker.on("ready", () => console.log("[worker:gen] ready"));
  genWorker.on("failed", (job, err) =>
    console.error(`[worker:gen] job=${job?.id} failed permanently:`, err.message),
  );

  console.log("[workers] generation + pdf workers running");
  return { genWorker };
}

if (require.main === module) {
  (async () => {
    await connectMongo();
    startWorkers();
  })().catch((err) => {
    console.error("[worker] fatal:", err);
    process.exit(1);
  });
}
