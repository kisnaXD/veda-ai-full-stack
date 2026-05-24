"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { EmptyAssignments } from "@/components/EmptyAssignments";
import { api } from "@/lib/api";
import type { Assignment } from "@vedaai/shared";

export default function HomePage() {
  const [items, setItems] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listAssignments()
      .then((res) => setItems(res.assignments))
      .catch((e) => setError((e as Error).message));
  }, []);

  const stats = {
    total: items?.length ?? 0,
    ready: items?.filter((a) => a.status === "ready").length ?? 0,
    inFlight: items?.filter((a) => a.status === "queued" || a.status === "processing").length ?? 0,
  };
  const recent = items?.slice(0, 3) ?? [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar title="Home" />

        <div className="px-4 sm:px-8 py-6 space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight2">
                Welcome back
              </h1>
              <p className="text-ink-muted text-[14px] mt-1">
                Design AI-generated question papers in minutes.
              </p>
            </div>
            <Link
              href="/assignments/new"
              className="self-start sm:self-auto h-11 px-5 inline-flex items-center gap-2 rounded-pill bg-canvas-darker text-white font-medium shadow-soft"
            >
              + Create Assignment
            </Link>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total assignments" value={stats.total} />
            <StatCard label="Ready to share" value={stats.ready} accent="emerald" />
            <StatCard label="In progress" value={stats.inFlight} accent="amber" />
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[18px] font-bold">Recent assignments</h2>
              <Link href="/assignments" className="text-[13px] font-medium text-ink-muted hover:text-ink">
                View all →
              </Link>
            </div>

            {error && <div className="p-4 rounded-lg bg-rose-50 text-rose-700">{error}</div>}

            {!error && items === null && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 shimmer rounded-card" />)}
              </div>
            )}

            {items && recent.length === 0 && (
              <div className="bg-white rounded-card shadow-soft py-6">
                <EmptyAssignments />
              </div>
            )}

            {recent.length > 0 && (
              <div className="space-y-3">
                {recent.map((a) => (
                  <Link
                    key={a.id}
                    href={`/assignments/${a.id}`}
                    className="flex items-center gap-4 bg-white rounded-card shadow-soft p-4 hover:shadow-card transition-shadow"
                  >
                    <div className="size-11 rounded-2xl bg-canvas-soft grid place-items-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5E5E5E" strokeWidth="1.7">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{a.input.title}</div>
                      <div className="text-[13px] text-ink-muted truncate">
                        {a.input.schoolName} • {a.input.subject} • Class {a.input.grade}
                      </div>
                    </div>
                    <StatusPill status={a.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "ink",
}: {
  label: string;
  value: number;
  accent?: "ink" | "emerald" | "amber";
}) {
  const accentCls =
    accent === "emerald"
      ? "text-emerald-700"
      : accent === "amber"
      ? "text-amber-700"
      : "text-ink";
  return (
    <div className="bg-white rounded-card shadow-soft p-5">
      <div className="text-[13px] text-ink-muted">{label}</div>
      <div className={`mt-1 text-[32px] font-bold tracking-tight2 ${accentCls}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: Assignment["status"] }) {
  const styles: Record<string, string> = {
    queued: "bg-canvas-soft text-ink-muted",
    processing: "bg-amber-100 text-amber-800",
    ready: "bg-emerald-100 text-emerald-800",
    failed: "bg-rose-100 text-rose-800",
    pending: "bg-canvas-soft text-ink-muted",
  };
  return (
    <span
      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}
