"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  WS_EVENTS,
  type Assignment,
  type AssignmentFailedPayload,
  type AssignmentReadyPayload,
  type AssignmentStatusPayload,
} from "@vedaai/shared";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { QuestionPaper } from "@/components/QuestionPaper";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export default function AssignmentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Queued");
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getAssignment(id)
      .then((a) => {
        if (cancelled) return;
        setAssignment(a);
        setProgress(a.progress);
        if (a.error) setError(a.error);
      })
      .catch((e) => setError((e as Error).message));

    const socket = getSocket();
    socket.emit(WS_EVENTS.SUBSCRIBE, id);

    const onStatus = (p: AssignmentStatusPayload) => {
      if (p.assignmentId !== id) return;
      setProgress(p.progress);
      if (p.message) setStatusMessage(p.message);
    };
    const onReady = (p: AssignmentReadyPayload) => {
      if (p.assignmentId !== id) return;
      setAssignment((prev) => (prev ? { ...prev, status: "ready", progress: 100, paper: p.paper } : prev));
      setProgress(100);
      setStatusMessage("Ready");
    };
    const onFailed = (p: AssignmentFailedPayload) => {
      if (p.assignmentId !== id) return;
      setError(p.error);
    };

    socket.on(WS_EVENTS.STATUS, onStatus);
    socket.on(WS_EVENTS.READY, onReady);
    socket.on(WS_EVENTS.FAILED, onFailed);

    return () => {
      cancelled = true;
      socket.off(WS_EVENTS.STATUS, onStatus);
      socket.off(WS_EVENTS.READY, onReady);
      socket.off(WS_EVENTS.FAILED, onFailed);
    };
  }, [id]);

  async function regenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const a = await api.regenerate(id);
      setAssignment(a);
      setProgress(0);
      setStatusMessage("Queued");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar title={assignment?.input.title ?? "Assignment"} />

        <div className="px-3 sm:px-6 py-3">
          <div className="bg-ink-muted rounded-[32px] p-3 sm:p-5 flex flex-col gap-3">
            <div className="bg-[rgba(24,24,24,0.85)] rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 flex flex-col gap-4">
              <p className="text-white font-bold text-[16px] sm:text-[20px] leading-snug">
                {assignment?.status === "ready"
                  ? `Here's your customized question paper for ${assignment.input.subject}, Class ${assignment.input.grade}.`
                  : "Crafting your question paper. This usually takes 10 to 30 seconds."}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={api.pdfUrl(id)}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex h-11 px-6 items-center gap-2 rounded-pill bg-white text-ink font-medium ${
                    assignment?.status !== "ready" ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <DownloadIcon /> Download as PDF
                </a>
                <button
                  onClick={regenerate}
                  disabled={regenerating || assignment?.status === "processing" || assignment?.status === "queued"}
                  className="inline-flex h-11 px-5 items-center gap-2 rounded-pill bg-canvas-darker text-white border border-white/15 font-medium disabled:opacity-50"
                >
                  <RegenerateIcon /> {regenerating ? "Regenerating…" : "Regenerate"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[20px] sm:rounded-[28px] p-6 sm:p-10 min-h-[600px]">
              {error && (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-700">
                  <strong>Generation failed.</strong> {error}
                </div>
              )}

              {!error && (!assignment || assignment.status !== "ready") && (
                <LoadingState progress={progress} message={statusMessage} />
              )}

              {!error && assignment?.status === "ready" && assignment.paper && (
                <QuestionPaper paper={assignment.paper} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingState({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <div className="size-14 rounded-full bg-brand/15 grid place-items-center">
        <svg className="animate-spin text-brand" width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center max-w-md">
        <div className="text-[18px] font-semibold">{message}</div>
        <p className="text-ink-muted text-[14px] mt-1">
          We're structuring sections, balancing difficulty, and parsing the response. Never rendering raw AI output.
        </p>
      </div>
      <div className="w-full max-w-md">
        <div className="h-2 rounded-full bg-canvas-soft overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-500 ease-out"
            style={{ width: `${Math.max(8, progress)}%` }}
          />
        </div>
        <div className="text-right text-[12px] text-ink-muted mt-1">{progress}%</div>
      </div>

      <div className="w-full max-w-2xl space-y-2 mt-6">
        <div className="h-6 shimmer rounded-md" />
        <div className="h-6 shimmer rounded-md w-3/4" />
        <div className="h-6 shimmer rounded-md w-5/6" />
        <div className="h-6 shimmer rounded-md w-2/3" />
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}
function RegenerateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
    </svg>
  );
}
