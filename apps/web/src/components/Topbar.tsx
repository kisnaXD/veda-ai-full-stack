"use client";
import { useRouter } from "next/navigation";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 h-14 px-4 sm:px-6 mx-3 mt-3 rounded-card bg-white/70 backdrop-blur">
      <div className="size-10 lg:hidden shrink-0" aria-hidden />
      <button
        onClick={() => router.back()}
        className="hidden sm:grid size-10 rounded-full bg-white place-items-center hover:bg-canvas-soft transition-colors"
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="flex-1 font-semibold text-ink truncate">{title}</span>
    </div>
  );
}
