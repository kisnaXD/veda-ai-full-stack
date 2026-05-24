import type { Assignment, CreateAssignmentInput } from "@vedaai/shared";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : ({} as T);
  if (!res.ok) {
    const msg = (data as any)?.error || `Request failed: ${res.status}`;
    const err = new Error(msg) as Error & { details?: unknown };
    err.details = (data as any)?.details;
    throw err;
  }
  return data as T;
}

export const api = {
  listAssignments: () =>
    jsonFetch<{ assignments: Assignment[] }>(`${BASE}/api/assignments`),
  createAssignment: (input: CreateAssignmentInput) =>
    jsonFetch<Assignment>(`${BASE}/api/assignments`, { method: "POST", body: JSON.stringify(input) }),
  getAssignment: (id: string) => jsonFetch<Assignment>(`${BASE}/api/assignments/${id}`),
  regenerate: (id: string) =>
    jsonFetch<Assignment>(`${BASE}/api/assignments/${id}/regenerate`, { method: "POST" }),
  pdfUrl: (id: string) => `${BASE}/api/assignments/${id}/pdf`,
};
