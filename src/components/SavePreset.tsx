"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Attendee } from "@/types/attendee";

interface Props {
  attendees: Attendee[];
}

export default function SavePreset({ attendees }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const handleSave = useCallback(async () => {
    if (!name.trim() || attendees.length === 0) return;
    setSaving(true);
    setError("");

    const entries = attendees.map((a) => ({
      name: a.name,
      roleId: a.roleId,
      hourlyRate: a.hourlyRate,
    }));

    const res = await fetch("/api/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), attendees: entries }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
    } else {
      const data = await res.json();
      setName("");
      setOpen(false);
      setOk(`Saved "${data.preset.name}"`);
      setTimeout(() => setOk(""), 3000);
    }

    setSaving(false);
  }, [name, attendees]);

  if (!user) return null;

  const hasAttendees = attendees.length > 0;

  return (
    <div className="space-y-2">
      {/* Success toast */}
      {ok && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="flex items-center gap-3 bg-accent text-white px-5 py-3 rounded-xl shadow-lg shadow-accent/25">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-sm">{ok}</span>
          </div>
        </div>
      )}

      {/* Save toggle */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          disabled={!hasAttendees}
          className="group w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300/60 dark:hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          Save as Preset
        </button>
      ) : (
        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setOpen(false);
                setName("");
              }
            }}
            placeholder="Preset name (e.g. Sprint Planning)"
            className="flex-1 px-3 py-2 bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving || !hasAttendees}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500/50 transition-all duration-200 flex items-center gap-1.5"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saving ? "Saving" : "Save"}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setName("");
            }}
            className="px-3 py-2 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500/50 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p className="text-danger text-xs text-center">{error}</p>
      )}
    </div>
  );
}
