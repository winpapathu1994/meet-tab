"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Attendee } from "@/types/attendee";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Props {
  attendees: Attendee[];
  onLoad: (entries: { name: string; roleId: string; hourlyRate: number }[]) => void;
}

export default function AttendeePersistence({ attendees, onLoad }: Props) {
  const { user } = useAuth();
  const [message, setMessage] = useState<{
    text: string;
    kind: "success" | "error";
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Check if there's saved data in MongoDB
  useEffect(() => {
    if (!user) {
      setHasSavedData(false);
      return;
    }
    fetch("/api/attendees")
      .then((res) => res.json())
      .then((data) => {
        setHasSavedData(
          Array.isArray(data.attendees) && data.attendees.length > 0,
        );
      })
      .catch(() => setHasSavedData(false));
  }, [user]);

  const toast = useCallback((text: string, kind: "success" | "error") => {
    setMessage({ text, kind });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleSave = useCallback(async () => {
    if (attendees.length === 0) return;
    setSaving(true);
    try {
      const entries = attendees.map((a) => ({ name: a.name, roleId: a.roleId, hourlyRate: a.hourlyRate }));
      const res = await fetch("/api/attendees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees: entries }),
      });
      if (!res.ok) throw new Error();
      setHasSavedData(entries.length > 0);
      toast(
        entries.length > 0
          ? `Saved ${entries.length} attendee${entries.length === 1 ? "" : "s"}`
          : "Cleared saved attendees",
        "success",
      );
    } catch {
      toast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }, [attendees, toast]);

  const handleLoad = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendees");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data.attendees) ? data.attendees : [];
      onLoad(list);
      toast(
        list.length > 0
          ? `Loaded ${list.length} attendee${list.length === 1 ? "" : "s"}`
          : "No saved attendees found",
        "success",
      );
    } catch {
      toast("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [onLoad, toast]);

  const handleClear = useCallback(async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/attendees", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setHasSavedData(false);
      toast("Cleared saved data", "success");
    } catch {
      toast("Failed to clear", "error");
    } finally {
      setClearing(false);
    }
  }, [toast]);

  if (!user) return null;

  const hasAttendees = attendees.length > 0;

  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      {/* Toast */}
      {message && (
        <div
          className={`text-center text-sm ${
            message.kind === "success"
              ? "text-accent"
              : "text-danger dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ── Confirm clear dialog ── */}
      <ConfirmDialog
        open={confirmClear}
        title="Clear Saved Data"
        message="Are you sure you want to clear all saved attendee data? This action cannot be undone."
        confirmLabel="Clear"
        onConfirm={() => {
          handleClear();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />

      {/* Buttons row */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleSave}
          disabled={saving || !hasAttendees}
          className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          title={hasAttendees ? "Save attendees to database" : "No attendees to save"}
        >
          {saving ? "…" : "💾 Save"}
        </button>
        <button
          onClick={handleLoad}
          disabled={loading || !hasSavedData}
          className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          title={hasSavedData ? "Load saved attendees" : "No saved data"}
        >
          {loading ? "…" : "📂 Load"}
        </button>
        <button
          onClick={() => setConfirmClear(true)}
          disabled={clearing || !hasSavedData}
          className="px-4 py-2 rounded-md bg-danger hover:bg-danger-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          title={hasSavedData ? "Delete saved data" : "Nothing to clear"}
        >
          {clearing ? "…" : "🗑️ Clear"}
        </button>
      </div>
    </div>
  );
}
