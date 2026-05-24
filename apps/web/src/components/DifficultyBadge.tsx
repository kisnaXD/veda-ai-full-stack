import { clsx } from "clsx";
import type { Difficulty } from "@vedaai/shared";

const STYLES: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Moderate: "bg-amber-100 text-amber-800 ring-amber-200",
  Challenging: "bg-rose-100 text-rose-800 ring-rose-200",
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide ring-1 ring-inset",
        STYLES[level],
      )}
    >
      {level}
    </span>
  );
}
