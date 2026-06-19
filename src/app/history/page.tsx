"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/useRoles";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatCost, type Currency, CURRENCY_SYMBOLS, ROLES } from "@/data/roles";

interface SessionAttendee {
  name: string;
  roleId: string;
  hourlyRate: number;
}

interface SessionRecord {
  _id: string;
  sessionName: string;
  attendees: SessionAttendee[];
  totalCostMMK: number;
  elapsedSeconds: number;
  currency: Currency;
  createdAt: string;
}

/** Format seconds into a human-readable duration */
function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

/** Format a date for display */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { roles: apiRoles } = useRoles();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** Look up role label by id, checking API roles first then static ROLES */
  const roleLabel = useCallback(
    (roleId: string): string => {
      const api = apiRoles.find((r) => r._id === roleId);
      if (api) return api.label;
      const st = ROLES.find((r) => r.id === roleId);
      if (st) return st.label;
      return roleId;
    },
    [apiRoles],
  );

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Fetch sessions
  useEffect(() => {
    if (!user) return;
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setFetching(false));
  }, [user]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/sessions/${deleteId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s._id !== deleteId));
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-12 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Session History
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        {/* ── Loading skeleton ── */}
        {fetching && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 animate-pulse"
              >
                <div className="h-5 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 w-32 bg-gray-100 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!fetching && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-6">
              <svg
                className="h-10 w-10 text-gray-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">
              No sessions yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">
              Start a meeting and end it to save your first session history record.
            </p>
            <button
              onClick={() => router.push("/meet")}
              className="mt-6 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50"
            >
              Go to Meet
            </button>
          </div>
        )}

        {/* ── Session cards ── */}
        {!fetching && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isOpen = expanded.has(session._id);
              const perAttendeeCost =
                session.attendees.length > 0 && session.elapsedSeconds > 0
                  ? session.totalCostMMK / session.attendees.length
                  : 0;

              return (
                <div
                  key={session._id}
                  className="group rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md"
                >
                  {/* ── Card header (always visible) ── */}
                  <button
                    onClick={() => toggleExpand(session._id)}
                    className="w-full text-left p-5 flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 rounded-2xl"
                  >
                    {/* Date badge */}
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-gray-100 dark:bg-slate-700/50 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-slate-400 leading-none">
                        {new Date(session.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short" },
                        )}
                      </span>
                      <span className="text-xl font-bold text-gray-800 dark:text-white leading-none mt-0.5">
                        {new Date(session.createdAt).getDate()}
                      </span>
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {session.sessionName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                        <span>{formatTime(session.createdAt)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                        <span>{formatDuration(session.elapsedSeconds)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                        <span>
                          {session.attendees.length} attendee
                          {session.attendees.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                        {formatCost(session.totalCostMMK, session.currency)}
                      </div>
                    </div>

                    {/* Expand chevron */}
                    <div className="shrink-0">
                      <svg
                        className={`h-5 w-5 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* ── Expanded detail ── */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-100 dark:border-slate-700/50">
                      {/* Attendee breakdown */}
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
                          Attendees
                        </h4>
                        <div className="space-y-2">
                          {session.attendees.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/50"
                            >
                              {/* Avatar */}
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                {(a.name || "?")[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                                  {a.name || "Unnamed"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {roleLabel(a.roleId)} · {CURRENCY_SYMBOLS["MMK"]}{" "}
                                  {a.hourlyRate.toLocaleString("en-US")}/hr
                                </p>
                              </div>
                              {session.elapsedSeconds > 0 && (
                                <div className="text-xs text-gray-500 dark:text-slate-400 tabular-nums">
                                  ~{formatCost(a.hourlyRate * (session.elapsedSeconds / 3600), session.currency)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary row */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                          <span>{formatDate(session.createdAt)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                          <span>{formatDuration(session.elapsedSeconds)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                          <span>
                            Avg{" "}
                            {session.attendees.length > 0 && session.elapsedSeconds > 0
                              ? formatCost(
                                  perAttendeeCost,
                                  session.currency,
                                )
                              : "—"}
                            /person
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(session._id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 dark:text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete confirm dialog ── */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
