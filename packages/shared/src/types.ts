import type { CreateAssignmentInput, QuestionPaper } from "./schemas";

export type JobStatus = "pending" | "queued" | "processing" | "ready" | "failed";

export interface Assignment {
  id: string;
  input: CreateAssignmentInput;
  status: JobStatus;
  progress: number;
  error?: string | null;
  paper?: QuestionPaper | null;
  createdAt: string;
  updatedAt: string;
}
