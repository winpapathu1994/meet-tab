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
          className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-500/10 backdrop-blur-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 shadow-sm shadow-emerald-500/10 hover:shadow-md transition-all duration-200 text-sm font-medium"
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
          className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-blue-200/60 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10 backdrop-blur-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 shadow-sm shadow-blue-500/10 hover:shadow-md transition-all duration-200 text-sm font-medium"
          title={hasSavedData ? "Load saved attendees" : "No saved data"}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {loading ? "Loading…" : "Load"}
        </button>

        <button
          onClick={() => setConfirmClear(true)}
          disabled={clearing || !hasSavedData}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-red-200/60 dark:border-red-500/20 bg-red-50/80 dark:bg-red-500/10 backdrop-blur-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 shadow-sm shadow-red-500/10 hover:shadow-md transition-all duration-200 text-sm font-medium"
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
