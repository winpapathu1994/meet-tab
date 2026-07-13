"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Attendee } from "@/types/attendee";
import ConfirmDialog from "@/components/ConfirmDialog";

interface PresetSummary {
  _id: string;
  name: string;
  attendees: { name: string; roleId: string; hourlyRate: number }[];
  createdAt: string;
}

interface Props {
  attendees: Attendee[];
  onLoad: (entries: { name: string; roleId: string; hourlyRate: number }[]) => void;
}

export default function PresetManager({ attendees, onLoad }: Props) {
  const { user } = useAuth();
  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [saving, setSaving] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<PresetSummary | null>(null);

  // Fetch presets when logged in
  useEffect(() => {
    if (!user) {
      setPresets([]);
      return;
    }
    fetch("/api/presets")
      .then((res) => res.json())
      .then((data) => setPresets(data.presets ?? []))
      .catch(() => setPresets([]));
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!presetName.trim() || attendees.length === 0) return;
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
      body: JSON.stringify({ name: presetName.trim(), attendees: entries }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
    } else {
      const data = await res.json();
      setPresets((prev) => [data.preset, ...prev]);
      setPresetName("");
      setShowSave(false);
      setSuccessMsg(`Saved "${data.preset.name}"`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }

    setSaving(false);
  }, [presetName, attendees]);

  const handleLoad = useCallback(
    (preset: PresetSummary) => {
      onLoad(preset.attendees);
      setSuccessMsg(`Loaded "${preset.name}"`);
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    [onLoad],
  );

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/presets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPresets((prev) => prev.filter((p) => p._id !== id));
    }
  }, []);

  if (!user) return null;

  const hasAttendees = attendees.length > 0;

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {/* Success toast */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="flex items-center gap-3 bg-accent text-white px-5 py-3 rounded-xl shadow-lg shadow-accent/25">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-sm">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Save section */}
      {!showSave ? (
        <button
          onClick={() => setShowSave(true)}
          disabled={!hasAttendees}
          className="group w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300/60 dark:hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          Save as Preset
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setShowSave(false);
            }}
            placeholder="e.g., Sprint Planning"
            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim() || saving || !hasAttendees}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {saving ? "…" : "Save"}
          </button>
          <button
            onClick={() => setShowSave(false)}
            className="px-3 py-2 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500/50 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

      {/* ── Confirm delete dialog ── */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Preset"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (confirmDelete) handleDelete(confirmDelete._id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Load section */}
      {presets.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors select-none flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            Load Preset ({presets.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {presets.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <button
                  onClick={() => handleLoad(p)}
                  className="flex-1 text-left"
                >
                  <div className="text-slate-900 dark:text-white text-sm font-medium truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {p.attendees.length}{" "}
                    {p.attendees.length === 1 ? "person" : "people"} ·{" "}
                    MMK {p.attendees.reduce((s, a) => s + (a.hourlyRate ?? 0), 0).toLocaleString("en-US")}/hr ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={() => setConfirmDelete(p)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-danger dark:text-slate-600 dark:hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 transition-colors"
                  title="Delete preset"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
