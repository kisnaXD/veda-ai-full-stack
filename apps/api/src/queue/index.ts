import { Queue, QueueEvents } from "bullmq";
import { redisConnection } from "../db/redis";

export const GENERATION_QUEUE = "assignment-generation";
export const PDF_QUEUE = "assignment-pdf";

export interface GenerationJobData {
  assignmentId: string;
}

export interface PdfJobData {
  assignmentId: string;
}

export const generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { age: 3600, count: 100 },
    removeOnFail: { age: 24 * 3600 },
  },
});

export const pdfQueue = new Queue<PdfJobData>(PDF_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { age: 3600, count: 50 },
    removeOnFail: { age: 24 * 3600 },
  },
});

export const generationQueueEvents = new QueueEvents(GENERATION_QUEUE, { connection: redisConnection });
