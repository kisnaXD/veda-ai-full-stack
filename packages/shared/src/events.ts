import type { JobStatus } from "./types";
import type { QuestionPaper } from "./schemas";

export const WS_EVENTS = {
  SUBSCRIBE: "assignment:subscribe",
  STATUS: "assignment:status",
  READY: "assignment:ready",
  FAILED: "assignment:failed",
} as const;

export interface AssignmentStatusPayload {
  assignmentId: string;
  status: JobStatus;
  progress: number;
  message?: string;
}

export interface AssignmentReadyPayload {
  assignmentId: string;
  paper: QuestionPaper;
}

export interface AssignmentFailedPayload {
  assignmentId: string;
  error: string;
}
