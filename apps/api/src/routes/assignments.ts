import { Router } from "express";
import { AssignmentModel } from "../models/Assignment";
import { generationQueue } from "../queue";
import { CreateAssignmentSchema, type Assignment } from "@vedaai/shared";

export const assignmentsRouter = Router();

function toApi(doc: any): Assignment {
  return {
    id: String(doc._id),
    input: {
      title: doc.title,
      schoolName: doc.schoolName,
      subject: doc.subject,
      grade: doc.grade,
      dueDate: new Date(doc.dueDate).toISOString(),
      additionalInstructions: doc.additionalInstructions ?? "",
      sourceMaterial: doc.sourceMaterial ?? "",
      questionTypes: doc.questionTypes.map((q: any) => ({
        type: q.type,
        count: q.count,
        marksPerQuestion: q.marksPerQuestion,
      })),
    },
    status: doc.status,
    progress: doc.progress,
    error: doc.error,
    paper: doc.paper ?? null,
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

assignmentsRouter.get("/", async (_req, res, next) => {
  try {
    const docs = await AssignmentModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ assignments: docs.map(toApi) });
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = CreateAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const input = parsed.data;
    const doc = await AssignmentModel.create({
      title: input.title,
      schoolName: input.schoolName,
      subject: input.subject,
      grade: input.grade,
      dueDate: new Date(input.dueDate),
      additionalInstructions: input.additionalInstructions ?? "",
      sourceMaterial: input.sourceMaterial ?? "",
      questionTypes: input.questionTypes,
      status: "queued",
      progress: 0,
    });

    await generationQueue.add(
      "generate",
      { assignmentId: String(doc._id) },
      { jobId: `assignment-${String(doc._id)}-${Date.now()}` },
    );

    res.status(201).json(toApi(doc));
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.get("/:id", async (req, res, next) => {
  try {
    const doc = await AssignmentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(toApi(doc));
  } catch (err) {
    next(err);
  }
});

assignmentsRouter.post("/:id/regenerate", async (req, res, next) => {
  try {
    const doc = await AssignmentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    doc.status = "queued";
    doc.progress = 0;
    doc.error = null;
    doc.paper = null;
    await doc.save();

    await generationQueue.add(
      "generate",
      { assignmentId: String(doc._id) },
      { jobId: `assignment-${String(doc._id)}-regen-${Date.now()}` },
    );

    res.json(toApi(doc));
  } catch (err) {
    next(err);
  }
});
