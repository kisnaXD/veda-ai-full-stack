"use client";
import { create } from "zustand";
import type { CreateAssignmentInput, QuestionTypeConfig, QuestionTypeKey } from "@vedaai/shared";

export interface FormState {
  title: string;
  schoolName: string;
  subject: string;
  grade: string;
  dueDate: string;
  additionalInstructions: string;
  sourceMaterial: string;
  questionTypes: QuestionTypeConfig[];
}

interface Store {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  addQuestionType: (type: QuestionTypeKey) => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, patch: Partial<QuestionTypeConfig>) => void;
  reset: () => void;
  toInput: () => CreateAssignmentInput;
}

const emptyForm = (): FormState => ({
  title: "",
  schoolName: "",
  subject: "",
  grade: "",
  dueDate: "",
  additionalInstructions: "",
  sourceMaterial: "",
  questionTypes: [],
});

export const useAssignmentStore = create<Store>((set, get) => ({
  form: emptyForm(),

  setField: (key, value) => set((s) => ({ form: { ...s.form, [key]: value } })),

  addQuestionType: (type) =>
    set((s) => {
      if (s.form.questionTypes.some((q) => q.type === type)) return s;
      return {
        form: {
          ...s.form,
          questionTypes: [...s.form.questionTypes, { type, count: 5, marksPerQuestion: 2 }],
        },
      };
    }),

  removeQuestionType: (index) =>
    set((s) => ({
      form: { ...s.form, questionTypes: s.form.questionTypes.filter((_, i) => i !== index) },
    })),

  updateQuestionType: (index, patch) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.map((q, i) => (i === index ? { ...q, ...patch } : q)),
      },
    })),

  reset: () => set({ form: emptyForm() }),

  toInput: (): CreateAssignmentInput => {
    const f = get().form;
    return {
      title: f.title.trim(),
      schoolName: f.schoolName.trim(),
      subject: f.subject.trim(),
      grade: f.grade.trim(),
      dueDate: f.dueDate ? new Date(f.dueDate).toISOString() : "",
      additionalInstructions: f.additionalInstructions.trim(),
      sourceMaterial: f.sourceMaterial.trim(),
      questionTypes: f.questionTypes,
    };
  },
}));
