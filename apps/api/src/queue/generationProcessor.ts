import type { Job } from "bullmq";
import { AssignmentModel } from "../models/Assignment";
import { generateQuestionPaper } from "../services/llm";
import { emitFailed, emitReady, emitStatus } from "../sockets";
import type { GenerationJobData } from "./index";
import type { CreateAssignmentInput } from "@vedaai/shared";

export async function processGeneration(job: Job<GenerationJobData>) {
  const { assignmentId } = job.data;
  console.log(`[worker:gen] job=${job.id} assignment=${assignmentId} start`);

  const doc = await AssignmentModel.findById(assignmentId);
  if (!doc) throw new Error(`Assignment ${assignmentId} not found`);

  doc.status = "processing";
  doc.progress = 10;
  await doc.save();
  emitStatus({ assignmentId, status: "processing", progress: 10, message: "Designing your paper…" });

  const input: CreateAssignmentInput = {
    title: doc.title,
    schoolName: doc.schoolName,
    subject: doc.subject,
    grade: doc.grade,
    dueDate: doc.dueDate.toISOString(),
    additionalInstructions: doc.additionalInstructions ?? "",
    sourceMaterial: doc.sourceMaterial ?? "",
    questionTypes: doc.questionTypes.map((q) => ({
      type: q.type as CreateAssignmentInput["questionTypes"][number]["type"],
      count: q.count,
      marksPerQuestion: q.marksPerQuestion,
    })),
  };

  try {
    emitStatus({ assignmentId, status: "processing", progress: 40, message: "Asking the AI…" });
    const paper = await generateQuestionPaper(input);

    emitStatus({ assignmentId, status: "processing", progress: 85, message: "Polishing layout…" });
    doc.paper = paper as never;
    doc.status = "ready";
    doc.progress = 100;
    doc.error = null;
    await doc.save();

    emitReady({ assignmentId, paper });
    console.log(`[worker:gen] job=${job.id} done`);
    return { ok: true };
  } catch (err) {
    const message = (err as Error).message || "Unknown error";
    console.error(`[worker:gen] job=${job.id} failed:`, message);
    doc.status = "failed";
    doc.error = message;
    await doc.save();
    emitFailed({ assignmentId, error: message });
    throw err;
  }
}
