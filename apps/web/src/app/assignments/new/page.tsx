"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreateAssignmentSchema,
  QUESTION_TYPE_LABELS,
  type QuestionTypeKey,
} from "@vedaai/shared";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { UploadDropzone } from "@/components/UploadDropzone";
import { QuestionTypeRow } from "@/components/QuestionTypeRow";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { api } from "@/lib/api";

const ALL_TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionTypeKey[];

export default function NewAssignmentPage() {
  const router = useRouter();
  const { form, setField, addQuestionType, updateQuestionType, removeQuestionType, toInput } =
    useAssignmentStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const usedTypes = new Set(form.questionTypes.map((q) => q.type));
  const remainingTypes = ALL_TYPES.filter((t) => !usedTypes.has(t));

  const totals = useMemo(() => {
    const q = form.questionTypes.reduce((s, x) => s + x.count, 0);
    const m = form.questionTypes.reduce((s, x) => s + x.count * x.marksPerQuestion, 0);
    return { q, m };
  }, [form.questionTypes]);

  async function onSubmit() {
    setErrors({});
    const input = toInput();
    const parsed = CreateAssignmentSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "_form";
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    try {
      setSubmitting(true);
      const created = await api.createAssignment(parsed.data);
      router.push(`/assignments/${created.id}`);
    } catch (e) {
      setErrors({ _form: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar title="Create Assignment" />

        <div className="px-4 sm:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-[20px] sm:text-[22px] font-bold">Create Assignment</h1>
          </div>
          <p className="text-ink-muted text-[14px] mb-6">
            Set up a new assignment for your students
          </p>

          <div className="h-1 bg-canvas-softer rounded-full mb-6 max-w-3xl">
            <div className="h-full w-1/2 bg-ink rounded-full" />
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-card shadow-card p-6 sm:p-8">
            <h2 className="text-[18px] font-bold">Assignment Details</h2>
            <p className="text-ink-muted text-[13px] mb-6">Basic information about your assignment</p>

            <Field label="Title" error={errors.title} className="mb-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Mid-term: Chemical Effects of Electric Current"
                className={inputCls}
              />
            </Field>

            <Field label="School Name" error={errors.schoolName} className="mb-4">
              <input
                type="text"
                value={form.schoolName}
                onChange={(e) => setField("schoolName", e.target.value)}
                placeholder="e.g. Delhi Public School, Sector-4, Bokaro"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Field label="Subject" error={errors.subject}>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setField("subject", e.target.value)}
                  placeholder="e.g. Science"
                  className={inputCls}
                />
              </Field>
              <Field label="Class / Grade" error={errors.grade}>
                <input
                  type="text"
                  value={form.grade}
                  onChange={(e) => setField("grade", e.target.value)}
                  placeholder="e.g. 8th"
                  className={inputCls}
                />
              </Field>
              <Field label="Due Date" error={errors.dueDate}>
                <input
                  type="date"
                  value={form.dueDate ? form.dueDate.split("T")[0] : ""}
                  onChange={(e) => setField("dueDate", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Source Material (optional)">
              <UploadDropzone
                value={form.sourceMaterial}
                onChange={(text) => setField("sourceMaterial", text)}
              />
            </Field>

            <div className="mt-6">
              <div className="flex items-end justify-between mb-3">
                <label className="font-semibold text-[14px]">Question Types</label>
                {form.questionTypes.length > 0 && (
                  <div className="flex gap-12 text-[13px] font-semibold text-ink-muted pr-2">
                    <span>No. of Questions</span>
                    <span>Marks</span>
                  </div>
                )}
              </div>

              {form.questionTypes.length === 0 ? (
                <div className="border border-dashed border-canvas-softer rounded-2xl p-6 text-center text-ink-muted text-[14px]">
                  No question types yet. Add one to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.questionTypes.map((q, i) => (
                    <QuestionTypeRow
                      key={`${q.type}-${i}`}
                      index={i}
                      value={q}
                      available={[q.type, ...remainingTypes]}
                      onChange={(patch) => updateQuestionType(i, patch)}
                      onRemove={() => removeQuestionType(i)}
                    />
                  ))}
                </div>
              )}

              {errors.questionTypes && (
                <p className="text-[12px] text-rose-600 mt-2">{errors.questionTypes}</p>
              )}

              {remainingTypes.length > 0 && (
                <button
                  type="button"
                  onClick={() => addQuestionType(remainingTypes[0])}
                  className="mt-4 flex items-center gap-2 text-[14px] font-semibold"
                >
                  <span className="size-8 rounded-full bg-canvas-darker text-white grid place-items-center">
                    +
                  </span>
                  Add Question Type
                </button>
              )}

              {form.questionTypes.length > 0 && (
                <div className="text-right mt-4 text-[14px] text-ink-muted font-semibold space-y-0.5">
                  <div>Total Questions : <span className="text-ink">{totals.q}</span></div>
                  <div>Total Marks : <span className="text-ink">{totals.m}</span></div>
                </div>
              )}
            </div>

            <Field label="Additional Information (For better output)" className="mt-6">
              <textarea
                rows={4}
                value={form.additionalInstructions}
                onChange={(e) => setField("additionalInstructions", e.target.value)}
                placeholder="e.g. Generate a question paper for a 3 hour exam duration…"
                className={`${inputCls} h-auto py-3 resize-none`}
              />
            </Field>

            {errors._form && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
                {errors._form}
              </div>
            )}
          </div>

          <div className="max-w-3xl mx-auto flex justify-between mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-11 px-6 rounded-pill bg-white shadow-soft font-medium flex items-center gap-2"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="h-11 px-7 rounded-pill bg-canvas-darker text-white font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Generate →"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full h-11 rounded-pill bg-white border border-canvas-softer/60 px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block font-semibold text-[14px] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[12px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
