"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toRoleCounts } from "@/types/attendee";
import ConfirmDialog from "@/components/ConfirmDialog";

function getTotalRate(attendees: { hourlyRate?: number }[]): number {
  return attendees.reduce((sum, a) => sum + (a.hourlyRate ?? 0), 0);
}

function formatRate(amount: number): string {
  return `${amount.toLocaleString("en-US")} MMK/hr`;
}

interface PresetEntry {
  name: string;
  roleId: string;
  hourlyRate: number;
}

interface PresetSummary {
  _id: string;
  name: string;
  attendees: PresetEntry[];
  createdAt: string;
}

export default function PresetsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<PresetSummary | null>(null);

  // Fetch presets
  const fetchPresets = useCallback(() => {
    setFetching(true);
    fetch("/api/presets")
      .then((res) => res.json())
      .then((data) => setPresets(data.presets ?? []))
      .catch(() => setPresets([]))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (user) fetchPresets();
  }, [user, fetchPresets]);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleLoad = useCallback(
    (preset: PresetSummary) => {
      const entries = preset.attendees.map((a) => ({
        id: crypto.randomUUID(),
        name: a.name,
        roleId: a.roleId,
        hourlyRate: a.hourlyRate ?? 0,
      }));
      const counts = toRoleCounts(entries);
      const segments = Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([id, count]) => `${id}:${count}`)
        .join(",");
      const names = entries.map((e) => e.name).join(",");
      const params = new URLSearchParams();
      if (segments) params.set("r", segments);
      if (names) params.set("n", names);
      params.set("name", preset.name);
      router.push(`/meet?${params.toString()}`);
    },
    [router],
  );

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/presets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPresets((prev) => prev.filter((p) => p._id !== id));
    }
  }, []);

  // Loading spinner while auth resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 dark:border-slate-600 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — guard will redirect, show nothing
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center p-6 pt-8 gap-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Preset Sessions
      </h1>

      <div className="w-full max-w-lg mx-auto space-y-3">
        {fetching ? (
          <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-8">Loading…</p>
        ) : presets.length === 0 ? (
          <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-8">
            No saved sessions yet. Create one from the MeetTab.
          </p>
        ) : (
          <ul className="space-y-1">
            {presets.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 py-3 px-1 border-b border-gray-200 dark:border-slate-800"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 dark:text-white font-medium truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {p.attendees.length}{" "}
                    {p.attendees.length === 1 ? "person" : "people"} ·{" "}
                    {formatRate(getTotalRate(p.attendees))} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleLoad(p)}
                    className="w-8 h-8 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 transition-colors text-sm"
                    aria-label={`Reuse ${p.name}`}
                    title="Reuse"
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    className="w-8 h-8 rounded-md text-gray-500 hover:text-danger hover:bg-gray-100 dark:text-slate-400 dark:hover:text-danger dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 transition-colors text-sm"
                    aria-label={`Delete ${p.name}`}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Confirm delete dialog ── */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Session"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (confirmDelete) handleDelete(confirmDelete._id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
