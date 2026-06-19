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
        <div className="text-center text-sm text-accent animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Save section */}
      {!showSave ? (
        <button
          onClick={() => setShowSave(true)}
          disabled={!hasAttendees}
          className="w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-900 hover:border-gray-400 dark:hover:text-white dark:hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          💾 Save as Preset
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
            className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim() || saving || !hasAttendees}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {saving ? "…" : "Save"}
          </button>
          <button
            onClick={() => setShowSave(false)}
            className="px-3 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 text-white transition-colors"
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
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors select-none">
            📂 Load Preset ({presets.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {presets.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-2 py-2 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <button
                  onClick={() => handleLoad(p)}
                  className="flex-1 text-left"
                >
                  <div className="text-gray-900 dark:text-white text-sm font-medium truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500">
                    {p.attendees.length}{" "}
                    {p.attendees.length === 1 ? "person" : "people"} ·{" "}
                    MMK {p.attendees.reduce((s, a) => s + (a.hourlyRate ?? 0), 0).toLocaleString("en-US")}/hr ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={() => setConfirmDelete(p)}
                  className="text-gray-300 hover:text-danger dark:text-slate-600 dark:hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 text-xs px-1 transition-colors"
                  title="Delete preset"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
