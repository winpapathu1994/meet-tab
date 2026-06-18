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
        <div className="text-center text-sm text-emerald-400 animate-pulse">
          {ok}
        </div>
      )}

      {/* Save toggle */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          disabled={!hasAttendees}
          className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
            className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-colors"
          >
            {saving ? "…" : "Save"}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setName("");
            }}
            className="px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
