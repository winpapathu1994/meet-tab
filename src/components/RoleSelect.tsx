"use client";

import { useEffect, useRef, useState } from "react";
import type { RoleData } from "@/hooks/useRoles";

interface Props {
  roles: RoleData[];
  value: string;
  onChange: (roleId: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Formatter for the rate display, e.g. "$ 2.18" */
  fmtRate: (mmkRate: number) => string;
}

const ROLE_ICONS: Record<string, string> = {
  Junior: "🌱",
  Senior: "⚡",
  Manager: "🧭",
  Designer: "🎨",
  QA: "🔍",
  DevOps: "⚙️",
};

function roleIcon(label: string): string {
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "👤";
}

const ROLE_COLORS: Record<string, string> = {
  "🌱": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "⚡": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "🧭": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "🎨": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "🔍": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "⚙️": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "👤": "bg-gray-100 text-gray-500 border-gray-300 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
};

export default function RoleSelect({ roles, value, onChange, onKeyDown, fmtRate }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = roles.find((r) => r._id === value);
  const icon = roleIcon(selected?.label ?? "");
  const color = ROLE_COLORS[icon] ?? ROLE_COLORS["👤"];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Scroll selected into view on open
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-role-id="${value}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [open, value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" && open && listRef.current) {
      e.preventDefault();
      const items = listRef.current.querySelectorAll("[data-role-id]");
      if (items.length > 0) (items[0] as HTMLElement).focus();
    }
    onKeyDown?.(e);
  }

  function select(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className="w-full h-[42px] flex items-center gap-2.5 px-3 rounded-md bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-left text-sm transition-colors focus:outline-none focus:border-primary"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base shrink-0">{icon}</span>
        <span className="flex-1 min-w-0 text-gray-900 dark:text-white truncate">
          {selected?.label ?? "Select role"}
        </span>
        {selected && (
          <span className="text-gray-500 dark:text-slate-400 text-xs shrink-0 tabular-nums">
            {fmtRate(selected.hourlyRate)}/hr
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-2xl shadow-gray-200/50 dark:shadow-black/40 origin-top"
          style={{ animation: "roleDropIn 0.15s ease-out" }}
        >
          {roles.map((r) => {
            const ri = roleIcon(r.label);
            const rc = ROLE_COLORS[ri] ?? ROLE_COLORS["👤"];
            const isSel = r._id === value;
            return (
              <button
                key={r._id}
                data-role-id={r._id}
                type="button"
                onClick={() => select(r._id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                  isSel
                    ? "bg-gray-100 text-gray-900 dark:bg-slate-700 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
                }`}
              >
                {/* Colored dot + icon */}
                <span className={`flex items-center justify-center w-7 h-7 rounded-md border text-sm shrink-0 ${rc}`}>
                  {ri}
                </span>
                <span className="flex-1 truncate font-medium">{r.label}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400 tabular-nums shrink-0">
                  {fmtRate(r.hourlyRate)}/hr
                </span>
                {isSel && (
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Drop animation */}
      <style jsx>{`
        @keyframes roleDropIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
