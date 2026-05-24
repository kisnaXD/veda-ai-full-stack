import { QuestionPaperSchema, type CreateAssignmentInput, type QuestionPaper } from "@vedaai/shared";

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function extractFirstJsonObject(text: string): string {
  const cleaned = stripFences(text);
  if (cleaned.startsWith("{")) return cleaned;
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("LLM response did not contain a JSON object");
  }
  return cleaned.slice(start, end + 1);
}

export function parseLLMResponse(raw: string, input: CreateAssignmentInput): QuestionPaper {
  const jsonText = extractFirstJsonObject(raw);

  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`Failed to parse LLM JSON: ${(e as Error).message}`);
  }

  const parsed = QuestionPaperSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`LLM response failed schema validation: ${parsed.error.message}`);
  }

  const paper = parsed.data;

  paper.schoolName ||= input.schoolName;
  paper.subject ||= input.subject;
  paper.grade ||= input.grade;
  if (!paper.totalMarks || paper.totalMarks <= 0) {
    paper.totalMarks = paper.sections.reduce(
      (sum, s) => sum + s.questions.reduce((sub, q) => sub + q.marks, 0),
      0,
    );
  }
  if (!paper.generalInstructions?.length) {
    paper.generalInstructions = ["All questions are compulsory unless stated otherwise."];
  }

  paper.sections.forEach((sec) => {
    sec.questions = sec.questions
      .sort((a, b) => a.number - b.number)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
  });

  return paper;
}
