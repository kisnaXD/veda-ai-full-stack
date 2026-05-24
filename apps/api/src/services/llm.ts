import OpenAI from "openai";
import { config } from "../config";
import { buildPrompt } from "./prompt";
import { parseLLMResponse } from "./parser";
import type { CreateAssignmentInput, QuestionPaper } from "@vedaai/shared";

const client = new OpenAI({
  apiKey: config.llm.apiKey || "missing-key",
  baseURL: config.llm.baseUrl,
});

export async function generateQuestionPaper(input: CreateAssignmentInput): Promise<QuestionPaper> {
  if (!config.llm.apiKey) {
    return mockPaper(input);
  }

  const { system, user } = buildPrompt(input);

  const completion = await client.chat.completions.create({
    model: config.llm.model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return parseLLMResponse(raw, input);
}

function mockPaper(input: CreateAssignmentInput): QuestionPaper {
  const difficulties = ["Easy", "Moderate", "Challenging"] as const;
  const sections = input.questionTypes.map((q, i) => {
    const label = String.fromCharCode(65 + i);
    return {
      label,
      title: q.type === "mcq" ? "Multiple Choice Questions" : "Short Answer Questions",
      instruction: `Attempt all questions. Each question carries ${q.marksPerQuestion} marks.`,
      questions: Array.from({ length: q.count }).map((_, idx) => ({
        number: idx + 1,
        text: `[Mock] ${input.subject} question #${idx + 1} for Section ${label}. (Set LLM_API_KEY to use a real model.)`,
        difficulty: difficulties[(idx + i) % 3],
        marks: q.marksPerQuestion,
        answer: "Sample answer.",
      })),
    };
  });

  return {
    schoolName: input.schoolName,
    subject: input.subject,
    grade: input.grade,
    timeAllowed: "45 minutes",
    totalMarks: sections.reduce((s, sec) => s + sec.questions.reduce((a, q) => a + q.marks, 0), 0),
    generalInstructions: [
      "All questions are compulsory unless stated otherwise.",
      "Write neatly and number your answers correctly.",
    ],
    sections,
  };
}
