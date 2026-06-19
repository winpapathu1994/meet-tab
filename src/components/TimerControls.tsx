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
          className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg transition-colors"
        >
          Start Meeting
        </button>
      )}

      {state === "running" && (
        <button
          onClick={onPause}
          className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500/50 text-white font-semibold text-lg transition-colors"
        >
          Pause
        </button>
      )}

      {state === "paused" && (
        <>
          <button
            onClick={onResume}
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 text-white font-semibold text-lg transition-colors"
          >
            Resume
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 rounded-lg bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 text-white font-semibold text-lg transition-colors"
          >
            Reset
          </button>
        </>
      )}

      {state !== "idle" && (
        <button
          onClick={handleCopy}
          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            copied
              ? "bg-accent hover:bg-accent-hover focus-visible:ring-accent/50 text-white"
              : "bg-secondary hover:bg-secondary-hover focus-visible:ring-secondary/50 text-white"
          }`}
          title="Copy shareable link"
        >
          {copied ? "✅ Copied!" : "📋 Copy Link"}
        </button>
      )}
    </div>
  );
}
