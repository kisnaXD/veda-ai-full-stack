import { z } from "zod";

export const QuestionTypeEnum = z.enum([
  "mcq",
  "short",
  "long",
  "diagram",
  "numerical",
  "true_false",
  "fill_blank",
]);
export type QuestionTypeKey = z.infer<typeof QuestionTypeEnum>;

export const QUESTION_TYPE_LABELS: Record<QuestionTypeKey, string> = {
  mcq: "Multiple Choice Questions",
  short: "Short Questions",
  long: "Long Questions",
  diagram: "Diagram/Graph-Based Questions",
  numerical: "Numerical Problems",
  true_false: "True / False",
  fill_blank: "Fill in the Blanks",
};

export const QuestionTypeConfigSchema = z.object({
  type: QuestionTypeEnum,
  count: z.number().int().min(1, "At least 1 question").max(50, "Max 50 per type"),
  marksPerQuestion: z.number().int().min(1, "Marks must be ≥ 1").max(50, "Max 50 marks each"),
});
export type QuestionTypeConfig = z.infer<typeof QuestionTypeConfigSchema>;

export const CreateAssignmentSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    schoolName: z.string().trim().min(1, "School name is required").max(200),
    subject: z.string().trim().min(1, "Subject is required").max(80),
    grade: z.string().trim().min(1, "Class / Grade is required").max(40),
    dueDate: z
      .string()
      .refine((s) => !isNaN(Date.parse(s)), "Invalid date")
      .refine((s) => new Date(s).getTime() >= Date.now() - 86400000, "Due date must be in the future"),
    questionTypes: z
      .array(QuestionTypeConfigSchema)
      .min(1, "Add at least one question type")
      .refine(
        (arr) => new Set(arr.map((q) => q.type)).size === arr.length,
        "Duplicate question types are not allowed",
      ),
    additionalInstructions: z.string().trim().max(2000).optional().default(""),
    sourceMaterial: z.string().trim().max(20000).optional().default(""),
  })
  .strict();

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;

export const DifficultyEnum = z.enum(["Easy", "Moderate", "Challenging"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const GeneratedQuestionSchema = z.object({
  number: z.number().int().min(1),
  text: z.string().min(1),
  difficulty: DifficultyEnum,
  marks: z.number().int().min(1),
  answer: z.string().optional(),
});
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export const GeneratedSectionSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(GeneratedQuestionSchema).min(1),
});
export type GeneratedSection = z.infer<typeof GeneratedSectionSchema>;

export const QuestionPaperSchema = z.object({
  schoolName: z.string().min(1),
  subject: z.string(),
  grade: z.string(),
  timeAllowed: z.string().default("45 minutes"),
  totalMarks: z.number().int().positive(),
  generalInstructions: z.array(z.string()).default([]),
  sections: z.array(GeneratedSectionSchema).min(1),
});
export type QuestionPaper = z.infer<typeof QuestionPaperSchema>;
