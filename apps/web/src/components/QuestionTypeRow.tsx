"use client";
import { QUESTION_TYPE_LABELS, type QuestionTypeConfig, type QuestionTypeKey } from "@vedaai/shared";
import { Stepper } from "./Stepper";

interface Props {
  index: number;
  value: QuestionTypeConfig;
  available: QuestionTypeKey[];
  onChange: (patch: Partial<QuestionTypeConfig>) => void;
  onRemove: () => void;
}

export function QuestionTypeRow({ index, value, available, onChange, onRemove }: Props) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      <div className="col-span-12 sm:col-span-7 relative">
        <select
          value={value.type}
          onChange={(e) => onChange({ type: e.target.value as QuestionTypeKey })}
          className="appearance-none w-full h-11 rounded-pill bg-white border border-canvas-softer/60 px-4 pr-10 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          {available.map((opt) => (
            <option key={opt} value={opt}>
              {QUESTION_TYPE_LABELS[opt]}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          width="16" height="16" viewBox="0 0 24 24" stroke="#303030" strokeWidth="2" fill="none"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`remove question type ${index + 1}`}
        className="col-span-1 sm:col-span-1 size-8 rounded-full hover:bg-canvas-soft grid place-items-center text-ink-muted"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="col-span-5 sm:col-span-2 flex justify-end">
        <Stepper
          value={value.count}
          onChange={(n) => onChange({ count: n })}
          ariaLabel="number of questions"
          min={1}
          max={50}
        />
      </div>

      <div className="col-span-6 sm:col-span-2 flex justify-end">
        <Stepper
          value={value.marksPerQuestion}
          onChange={(n) => onChange({ marksPerQuestion: n })}
          ariaLabel="marks per question"
          min={1}
          max={50}
        />
      </div>
    </div>
  );
}
