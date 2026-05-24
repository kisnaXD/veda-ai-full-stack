"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { clsx } from "clsx";

type Predicate = (pathname: string, search: URLSearchParams) => boolean;

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: Predicate;
}

const matchSlug = (slug: string): Predicate => (p, s) =>
  p === "/coming-soon" && s.get("page") === slug;

const NAV: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon, isActive: (p) => p === "/" },
  { label: "My Groups", href: "/coming-soon?page=groups", icon: GroupsIcon, isActive: matchSlug("groups") },
  {
    label: "Assignments",
    href: "/assignments",
    icon: FileIcon,
    isActive: (p) => p === "/assignments" || p.startsWith("/assignments/"),
  },
  { label: "AI Teacher's Toolkit", href: "/coming-soon?page=toolkit", icon: BookIcon, isActive: matchSlug("toolkit") },
  { label: "My Library", href: "/coming-soon?page=library", icon: LibraryIcon, isActive: matchSlug("library") },
];

const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/coming-soon?page=settings",
  icon: SettingsIcon,
  isActive: matchSlug("settings"),
};

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarBody />
    </Suspense>
  );
}

function SidebarBody() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 size-11 rounded-full bg-white shadow-card grid place-items-center"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={clsx(
          "z-50 flex-col w-[280px] shrink-0 bg-white p-6 justify-between",
          "lg:flex lg:sticky lg:top-3 lg:h-[calc(100vh-24px)] lg:ml-3 lg:rounded-card lg:shadow-card",
          "fixed inset-y-0 left-0 h-full transform transition-transform duration-200 ease-out shadow-card",
          open ? "flex translate-x-0" : "hidden lg:flex lg:translate-x-0 -translate-x-full",
        )}
      >
        <div className="flex flex-col gap-12">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <BrandMark />
              <span className="text-[24px] font-bold tracking-tight2">VedaAI</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="lg:hidden size-9 rounded-full hover:bg-canvas-soft grid place-items-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2.2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <Link
            href="/assignments/new"
            className="flex items-center justify-center gap-2 h-[44px] rounded-pill bg-canvas-dark text-white border-[3px] border-brand-soft shadow-soft px-6 font-medium"
            onClick={() => setOpen(false)}
          >
            <SparkleIcon />
            <span>Create Assignment</span>
          </Link>

          <nav className="flex flex-col gap-2">
            {NAV.map((item) => (
              <SidebarLink key={item.label} item={item} pathname={pathname} search={search} />
            ))}
          </nav>
        </div>

        <div>
          <SidebarLink item={SETTINGS_ITEM} pathname={pathname} search={search} />
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  pathname,
  search,
}: {
  item: NavItem;
  pathname: string;
  search: URLSearchParams;
}) {
  const active = item.isActive(pathname, search);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex items-center gap-2 h-10 px-3 rounded-lg text-[15px] transition-colors",
        active
          ? "bg-canvas-soft text-ink font-medium"
          : "text-ink-muted/80 hover:bg-canvas-soft/60",
      )}
    >
      <item.icon />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function BrandMark() {
  return (
    <span className="size-9 rounded-lg bg-gradient-to-br from-brand to-brand-soft grid place-items-center text-white font-bold text-xl shadow-soft">
      V
    </span>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" fill="currentColor" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z" fill="currentColor" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function GroupsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z" />
      <path d="M4 4v12a4 4 0 0 0 4 4" />
    </svg>
  );
}
function LibraryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6 4" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.14 16.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.08 4.14l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z" />
    </svg>
  );
}
