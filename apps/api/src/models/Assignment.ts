import { Schema, model, type InferSchemaType } from "mongoose";

const QuestionTypeConfigSchema = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const GeneratedQuestionSchema = new Schema(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Challenging"], required: true },
    marks: { type: Number, required: true },
    answer: { type: String },
  },
  { _id: false },
);

const GeneratedSectionSchema = new Schema(
  {
    label: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [GeneratedQuestionSchema], required: true },
  },
  { _id: false },
);

const QuestionPaperSchema = new Schema(
  {
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    generalInstructions: { type: [String], default: [] },
    sections: { type: [GeneratedSectionSchema], required: true },
  },
  { _id: false },
);

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: Date, required: true },
    additionalInstructions: { type: String, default: "" },
    sourceMaterial: { type: String, default: "" },
    questionTypes: { type: [QuestionTypeConfigSchema], required: true },
    status: {
      type: String,
      enum: ["pending", "queued", "processing", "ready", "failed"],
      default: "pending",
      index: true,
    },
    progress: { type: Number, default: 0 },
    error: { type: String, default: null },
    paper: { type: QuestionPaperSchema, default: null },
  },
  { timestamps: true },
);

export type AssignmentDoc = InferSchemaType<typeof AssignmentSchema> & { _id: unknown };

export const AssignmentModel = model("Assignment", AssignmentSchema);
