"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { EmptyAssignments } from "@/components/EmptyAssignments";
import { api } from "@/lib/api";
import type { Assignment } from "@vedaai/shared";

const STATUS_STYLES: Record<string, string> = {
  queued: "bg-canvas-soft text-ink-muted",
  processing: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  pending: "bg-canvas-soft text-ink-muted",
};

export default function AssignmentsListPage() {
  const [items, setItems] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listAssignments()
      .then((res) => setItems(res.assignments))
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar title="Assignments" />

        <div className="px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[22px] font-bold">Assignments</h1>
              <p className="text-ink-muted text-[14px]">
                All papers you've created, most recent first
              </p>
            </div>
            {items && items.length > 0 && (
              <Link
                href="/assignments/new"
                className="h-11 px-5 inline-flex items-center gap-2 rounded-pill bg-canvas-darker text-white font-medium"
              >
                + Create New
              </Link>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-rose-50 text-rose-700">{error}</div>
          )}

          {!error && items === null && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 shimmer rounded-card" />
              ))}
            </div>
          )}

          {items?.length === 0 && <EmptyAssignments />}

          {items && items.length > 0 && (
            <div className="space-y-3">
              {items.map((a) => (
                <Link
                  key={a.id}
                  href={`/assignments/${a.id}`}
                  className="flex items-center gap-4 bg-white rounded-card shadow-soft p-4 sm:p-5 hover:shadow-card transition-shadow"
                >
                  <div className="size-12 rounded-2xl bg-canvas-soft grid place-items-center shrink-0">
                    <FileIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{a.input.title}</div>
                    <div className="text-[13px] text-ink-muted truncate">
                      {a.input.schoolName} • {a.input.subject} • Class {a.input.grade}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end text-[12px] text-ink-muted">
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    <span>Due {new Date(a.input.dueDate).toLocaleDateString()}</span>
                  </div>
                  <span
                    className={clsx(
                      "ml-2 shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide",
                      STATUS_STYLES[a.status] ?? STATUS_STYLES.pending,
                    )}
                  >
                    {a.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E5E5E" strokeWidth="1.7">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
