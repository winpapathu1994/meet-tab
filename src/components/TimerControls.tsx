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
}

export default function TimerControls({
  state,
  hasRoles,
  onStart,
  onPause,
  onResume,
  onReset,
  onShare,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {state === "idle" && (
        <button
          onClick={onStart}
          disabled={!hasRoles}
          className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 text-white font-semibold text-lg transition-colors"
        >
          Start Meeting
        </button>
      )}

      {state === "running" && (
        <button
          onClick={onPause}
          className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-lg transition-colors"
        >
          Pause
        </button>
      )}

      {state === "paused" && (
        <>
          <button
            onClick={onResume}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-colors"
          >
            Resume
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-900 dark:text-white font-semibold text-lg transition-colors"
          >
            Reset
          </button>
        </>
      )}

      {state !== "idle" && (
        <button
          onClick={handleCopy}
          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
          }`}
          title="Copy shareable link"
        >
          {copied ? "✅ Copied!" : "📋 Copy Link"}
        </button>
      )}
    </div>
  );
}
