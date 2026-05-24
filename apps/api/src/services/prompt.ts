import { QUESTION_TYPE_LABELS, type CreateAssignmentInput } from "@vedaai/shared";

const SYSTEM_PROMPT = `You are an expert exam paper setter for school teachers.
You will design clean, exam-quality question papers organized into sections.
You must respond with STRICT, MINIFIED JSON only. No markdown fences, no commentary, no preamble.
The JSON must conform exactly to the schema described in the user message.`;

export function buildPrompt(input: CreateAssignmentInput) {
  const totalQuestions = input.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = input.questionTypes.reduce((s, q) => s + q.count * q.marksPerQuestion, 0);

  const sectionPlan = input.questionTypes
    .map((q, i) => {
      const label = String.fromCharCode(65 + i);
      return `- Section ${label}: ${QUESTION_TYPE_LABELS[q.type]}, ${q.count} questions × ${q.marksPerQuestion} marks each (= ${
        q.count * q.marksPerQuestion
      } marks)`;
    })
    .join("\n");

  const user = `Generate a question paper with the following requirements.

TITLE: ${input.title}
SCHOOL: ${input.schoolName}
SUBJECT: ${input.subject}
CLASS / GRADE: ${input.grade}
TOTAL QUESTIONS: ${totalQuestions}
TOTAL MARKS: ${totalMarks}

SECTION PLAN (one section per question type, labelled A, B, C, ...):
${sectionPlan}

ADDITIONAL INSTRUCTIONS (from teacher):
${input.additionalInstructions || "(none)"}

SOURCE MATERIAL / SYLLABUS NOTES (optional context to ground the questions):
${input.sourceMaterial?.slice(0, 8000) || "(none. base questions on standard curriculum for the subject and grade)"}

DIFFICULTY DISTRIBUTION:
- Mix Easy / Moderate / Challenging across each section (roughly 40 / 40 / 20)
- Tag each question with its difficulty

OUTPUT JSON SCHEMA (respond with exactly this shape, nothing else):
{
  "schoolName": "${input.schoolName}",
  "subject": "<subject>",
  "grade": "<grade>",
  "timeAllowed": "<e.g. 45 minutes>",
  "totalMarks": <number>,
  "generalInstructions": [
    "All questions are compulsory unless stated otherwise.",
    "...(2-4 short, clear instructions)..."
  ],
  "sections": [
    {
      "label": "A",
      "title": "<e.g. Multiple Choice Questions>",
      "instruction": "<e.g. Attempt all questions. Each question carries 1 mark.>",
      "questions": [
        {
          "number": 1,
          "text": "<question text. for MCQs include options inline as (a)/(b)/(c)/(d)>",
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "marks": <number>,
          "answer": "<concise answer or solution sketch>"
        }
      ]
    }
  ]
}

RULES:
- Respond with ONLY the JSON, no \`\`\`json fences, no commentary before or after.
- Number questions starting at 1 within each section.
- Marks per question must match the section plan exactly.
- Question count per section must match the section plan exactly.
- Keep "answer" concise (1-3 lines).
- Do NOT use em dashes (—) or en dashes (–) anywhere in the output. Use regular punctuation: commas, colons, periods, or hyphens.`;

  return {
    system: SYSTEM_PROMPT,
    user,
  };
}
