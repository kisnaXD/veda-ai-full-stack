import Link from "next/link";

export function EmptyAssignments() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <EmptyIllustration className="w-[280px] h-[220px] sm:w-[300px] sm:h-[240px] mb-3" />
      <h2 className="text-[20px] font-bold text-ink">No assignments yet</h2>
      <p className="text-[15px] text-ink-muted/80 mt-1 max-w-md leading-relaxed">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link
        href="/assignments/new"
        className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-pill bg-canvas-darker text-white font-medium border border-white/40 shadow-soft"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create Your First Assignment
      </Link>
    </div>
  );
}

function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="ill-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F4F4F4" />
          <stop offset="100%" stopColor="#EFEFEF" />
        </radialGradient>
        <filter id="ill-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#929292" floodOpacity="0.18" />
        </filter>
      </defs>

      <circle cx="160" cy="130" r="118" fill="url(#ill-bg)" />

      <g stroke="#FFB59A" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M50 90 q14 -10 28 0 t28 0" />
        <path d="M225 60 q12 -8 22 2 t20 -2" />
        <path d="M40 195 q12 8 24 -2 t22 0" />
        <path d="M245 215 q-10 -10 -22 -2 t-18 -4" />
        <circle cx="60" cy="60" r="3" fill="#FFB59A" stroke="none" />
        <circle cx="280" cy="180" r="2.5" fill="#FFB59A" stroke="none" />
      </g>
      <g stroke="#011625" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.18">
        <path d="M70 140 q6 6 12 0" />
        <path d="M250 110 q-6 6 -12 0" />
      </g>

      <g filter="url(#ill-shadow)">
        <rect x="118" y="58" width="108" height="138" rx="14" fill="#FFFFFF" />
      </g>
      <rect x="134" y="78" width="44" height="6" rx="3" fill="#011625" />
      <rect x="134" y="96" width="76" height="5" rx="2.5" fill="#E1DCEB" />
      <rect x="134" y="110" width="76" height="5" rx="2.5" fill="#E1DCEB" />
      <rect x="134" y="124" width="68" height="5" rx="2.5" fill="#E1DCEB" />
      <rect x="134" y="138" width="76" height="5" rx="2.5" fill="#E1DCEB" />
      <rect x="134" y="152" width="60" height="5" rx="2.5" fill="#E1DCEB" />

      <g transform="translate(238 38)">
        <path
          d="M10 22 a9 9 0 0 1 0 -18 a9 9 0 0 1 17 0 a8 8 0 0 1 0 18 z"
          fill="#FFFFFF"
          stroke="#CCC6D9"
          strokeWidth="1.6"
        />
      </g>

      <g transform="translate(196 152)">
        <circle cx="32" cy="32" r="32" fill="#FFFFFF" stroke="#CCC6D9" strokeWidth="2.4" />
        <circle cx="32" cy="32" r="24" fill="#F6F6F6" />
        <g stroke="#FF4040" strokeWidth="4.2" strokeLinecap="round">
          <line x1="22" y1="22" x2="42" y2="42" />
          <line x1="42" y1="22" x2="22" y2="42" />
        </g>
        <line
          x1="55"
          y1="55"
          x2="78"
          y2="78"
          stroke="#011625"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(90 200)" fill="#417BA4" opacity="0.7">
        <path d="M0 6 L4 0 L8 6 L4 12 Z" />
      </g>
      <g transform="translate(270 90)" fill="#FF5623" opacity="0.5">
        <path d="M0 5 L3 0 L6 5 L3 10 Z" />
      </g>
    </svg>
  );
}
