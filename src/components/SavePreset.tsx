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
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    const entries = attendees.map((a) => ({
      name: a.name,
      roleId: a.roleId,
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
    <div className="w-full max-w-lg mx-auto space-y-2">
      {/* Success toast */}
      {ok && (
        <div className="text-center text-sm text-accent animate-pulse">
          {ok}
        </div>
      )}

      {/* Save toggle */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          disabled={!hasAttendees}
          className="w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-900 hover:border-gray-400 dark:hover:text-white dark:hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          💾 Save Session
        </button>
      ) : (
        <div className="flex gap-2">
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
            placeholder="e.g., Sprint Planning"
            className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {saving ? "…" : "Save"}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setName("");
            }}
            className="px-3 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
    </div>
  );
}
