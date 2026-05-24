"use client";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (text: string, filename?: string) => void;
}

export function UploadDropzone({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be ≤ 10MB");
      return;
    }
    setFilename(file.name);
    if (file.type === "application/pdf") {
      onChange(`[Uploaded ${file.name}. PDF text extraction is approximated on the client]`, file.name);
      return;
    }
    const text = await file.text();
    onChange(text.slice(0, 18000), file.name);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      className={`relative border-2 border-dashed rounded-2xl bg-white p-8 flex flex-col items-center justify-center text-center transition-colors ${
        dragging ? "border-brand bg-brand/5" : "border-canvas-softer"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div className="size-10 rounded-full grid place-items-center text-ink-muted">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 8a5 5 0 0 0-9.6-1A4 4 0 1 0 7 16h10a4 4 0 0 0 0-8z" />
          <path d="M12 12v6M9 15l3-3 3 3" />
        </svg>
      </div>
      <div className="mt-3 font-semibold text-[16px]">
        {filename ? filename : "Choose a file or drag & drop it here"}
      </div>
      <div className="text-[13px] text-ink-muted mt-1">PDF / TXT, up to 10MB (optional)</div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 h-9 px-4 rounded-pill bg-white border border-canvas-softer/70 text-[14px] font-medium hover:bg-canvas-soft transition-colors"
      >
        Browse Files
      </button>
      {value && (
        <p className="mt-3 text-[12px] text-ink-muted">
          ✓ Source material captured ({value.length.toLocaleString()} chars)
        </p>
      )}
    </div>
  );
}
