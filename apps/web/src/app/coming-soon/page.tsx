"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

const LABELS: Record<string, string> = {
  groups: "My Groups",
  toolkit: "AI Teacher's Toolkit",
  library: "My Library",
  settings: "Settings",
};

function Inner() {
  const params = useSearchParams();
  const slug = params.get("page") ?? "";
  const label = LABELS[slug] ?? "";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar title={label} />
        <div className="px-4 sm:px-8 py-6" />
      </main>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
