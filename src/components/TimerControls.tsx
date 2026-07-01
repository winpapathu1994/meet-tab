"use client";

import { useState } from "react";
import type { TimerState } from "../hooks/useTimer";

interface Props {
  state: TimerState;
  hasRoles: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onShare: () => void;
  onEndMeeting: () => void;
  readOnly?: boolean;
}

export default function TimerControls({
  state,
  hasRoles,
  onStart,
  onPause,
  onResume,
  onReset,
  onShare,
  onEndMeeting,
  readOnly,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 justify-center">
      {!readOnly && state === "idle" && (
        <button
          onClick={onStart}
          disabled={!hasRoles}
          className="group relative px-10 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 hover:from-indigo-700 hover:via-blue-600 hover:to-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 text-white font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
        >
          {/* Subtle glow effect */}
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
              <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Start Meeting
          </span>
        </button>
      )}

      {!readOnly && state === "running" && (
        <div className="flex items-center gap-3">
          <button
            onClick={onPause}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-500/10 backdrop-blur-sm text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500/50 font-medium text-sm shadow-sm shadow-amber-500/10 hover:shadow-md transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause
          </button>
          <button
            onClick={onEndMeeting}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl border border-red-200/60 dark:border-red-500/20 bg-red-50/80 dark:bg-red-500/10 backdrop-blur-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 font-medium text-sm shadow-sm shadow-red-500/10 hover:shadow-md transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            End
          </button>
        </div>
      )}

      {!readOnly && state === "paused" && (
        <div className="flex items-center gap-3">
          <button
            onClick={onResume}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 text-white font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Resume
          </button>
          <button
            onClick={onReset}
            className="group flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-600/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500/50 font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <button
            onClick={onEndMeeting}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl border border-red-200/60 dark:border-red-500/20 bg-red-50/80 dark:bg-red-500/10 backdrop-blur-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 font-medium text-sm shadow-sm shadow-red-500/10 hover:shadow-md transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            End
          </button>
        </div>
      )}

      {/* Copy Link — always available in read-only, else only when running/paused */}
      {(readOnly || state !== "idle") && (
        <button
          onClick={handleCopy}
          className={`group flex items-center gap-1.5 px-6 py-3 rounded-2xl text-sm font-medium backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            copied
              ? "border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10"
              : "border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md"
          }`}
          title="Copy shareable link"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      )}
    </div>
  );
}
