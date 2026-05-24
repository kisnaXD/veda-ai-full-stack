"use client";
import { clsx } from "clsx";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
  ariaLabel?: string;
}

export function Stepper({ value, onChange, min = 1, max = 50, className, ariaLabel }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-1 h-11 w-[100px] px-2 rounded-pill bg-white border border-canvas-softer/60",
        className,
      )}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="size-7 grid place-items-center rounded-full hover:bg-canvas-soft disabled:opacity-30 transition-colors"
        aria-label="decrease"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="font-semibold text-[15px] tabular-nums">{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="size-7 grid place-items-center rounded-full hover:bg-canvas-soft disabled:opacity-30 transition-colors"
        aria-label="increase"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
