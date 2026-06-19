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
    <div className="space-y-2">
      {/* Toast */}
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
              message.kind === "success"
                ? "bg-accent shadow-accent/25"
                : "bg-danger shadow-danger/25"
            }`}
          >
            {message.kind === "success" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {message.text}
          </div>
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

      {/* Pill-style button row */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleSave}
          disabled={saving || !hasAttendees}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary/40 hover:text-primary dark:hover:text-primary text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
          title={hasAttendees ? "Save attendees to database" : "No attendees to save"}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          )}
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          onClick={handleLoad}
          disabled={loading || !hasSavedData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary/40 hover:text-primary dark:hover:text-primary text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
          title={hasSavedData ? "Load saved attendees" : "No saved data"}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {loading ? "Loading…" : "Load"}
        </button>

        <button
          onClick={() => setConfirmClear(true)}
          disabled={clearing || !hasSavedData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-danger/40 dark:hover:border-danger/40 hover:text-danger dark:hover:text-danger text-gray-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
          title={hasSavedData ? "Delete saved data" : "Nothing to clear"}
        >
          {clearing ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-danger rounded-full animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          {clearing ? "Clearing…" : "Clear"}
        </button>
      </div>
    </div>
  );
}
