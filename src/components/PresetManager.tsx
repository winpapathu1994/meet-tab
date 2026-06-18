"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Attendee } from "@/types/attendee";

interface PresetSummary {
  _id: string;
  name: string;
  attendees: { name: string; roleId: string }[];
  createdAt: string;
}

interface Props {
  attendees: Attendee[];
  onLoad: (entries: { name: string; roleId: string }[]) => void;
}

export default function PresetManager({ attendees, onLoad }: Props) {
  const { user } = useAuth();
  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [saving, setSaving] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    if (!presetName.trim()) return;
    setSaving(true);
    setError("");

    const entries = attendees.map((a) => ({
      name: a.name,
      roleId: a.roleId,
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
        <div className="text-center text-sm text-emerald-400 animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Save section */}
      {!showSave ? (
        <button
          onClick={() => setShowSave(true)}
          disabled={!hasAttendees}
          className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
            className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim() || saving}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-colors"
          >
            {saving ? "…" : "Save"}
          </button>
          <button
            onClick={() => setShowSave(false)}
            className="px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Load section */}
      {presets.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-300 transition-colors select-none">
            📂 Load Preset ({presets.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {presets.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-2 py-2 px-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                <button
                  onClick={() => handleLoad(p)}
                  className="flex-1 text-left"
                >
                  <div className="text-white text-sm font-medium truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.attendees.length}{" "}
                    {p.attendees.length === 1 ? "person" : "people"} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-slate-600 hover:text-red-400 text-xs px-1 transition-colors"
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
