"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/useRoles";
import { toRoleCounts } from "@/types/attendee";
import { ROLES } from "@/data/roles";
import ConfirmDialog from "@/components/ConfirmDialog";

/** Resolve hourlyRate: stored value first, then API roles, then static ROLES */
function resolveRate(a: { roleId: string; hourlyRate?: number }, apiRoles: { _id: string; hourlyRate: number }[]): number {
  if (a.hourlyRate && a.hourlyRate > 0) return a.hourlyRate;
  const apiRole = apiRoles.find((r) => r._id === a.roleId);
  if (apiRole) return apiRole.hourlyRate;
  const stRole = ROLES.find((r) => r.id === a.roleId);
  return stRole?.hourlyRate ?? 0;
}

function getTotalRate(attendees: { roleId: string; hourlyRate?: number }[], apiRoles: { _id: string; hourlyRate: number }[]): number {
  return attendees.reduce((sum, a) => sum + resolveRate(a, apiRoles), 0);
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
  const { roles: apiRoles } = useRoles();

  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<PresetSummary | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 dark:border-slate-600 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — guard will redirect, show nothing
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Preset Sessions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {presets.length} preset{presets.length !== 1 ? "s" : ""} saved
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
        {!fetching && presets.length === 0 && (
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
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">
              No saved presets
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">
              Save a session as a preset from the MeetTab to quickly reuse attendee configurations.
            </p>
            <button
              onClick={() => router.push("/meet")}
              className="mt-6 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50"
            >
              Go to Meet
            </button>
          </div>
        )}

        {/* ── Preset cards ── */}
        {!fetching && presets.length > 0 && (
          <div className="space-y-4">
            {presets.map((preset) => {
              const isOpen = expanded.has(preset._id);
              const totalRate = getTotalRate(preset.attendees, apiRoles);
              const roleCounts = new Map<string, number>();
              preset.attendees.forEach((a) => {
                roleCounts.set(a.roleId, (roleCounts.get(a.roleId) ?? 0) + 1);
              });

              return (
                <div
                  key={preset._id}
                  className="group rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md"
                >
                  {/* ── Card header ── */}
                  <button
                    onClick={() => toggleExpand(preset._id)}
                    className="w-full text-left p-5 flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 rounded-2xl"
                  >
                    {/* Date badge */}
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 leading-none">
                        {new Date(preset.createdAt).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold text-amber-700 dark:text-amber-300 leading-none mt-0.5">
                        {new Date(preset.createdAt).getDate()}
                      </span>
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {preset.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                        <span>
                          {preset.attendees.length} attendee{preset.attendees.length !== 1 ? "s" : ""}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                        <span>{formatRate(totalRate)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                        <span>
                          {new Date(preset.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
                          {preset.attendees.map((a, i) => (
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
                                    {roleLabel(a.roleId)} · {resolveRate(a, apiRoles).toLocaleString("en-US")} MMK/hr
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Role summary chips */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Array.from(roleCounts.entries()).map(([roleId, count]) => (
                            <span
                              key={roleId}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-700/50 text-xs text-gray-600 dark:text-slate-300"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {roleLabel(roleId)}
                              <span className="text-gray-400 dark:text-slate-500">×{count}</span>
                            </span>
                          ))}
                      </div>

                      {/* Actions row */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          Created {new Date(preset.createdAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoad(preset);
                            }}
                            className="group flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-blue-200/60 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10 backdrop-blur-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-blue-500/10 hover:shadow-md transition-all duration-200 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50"
                          >
                            {/* Reuse icon */}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reuse
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(preset);
                            }}
                            className="group flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-red-200/60 dark:border-red-500/20 bg-red-50/80 dark:bg-red-500/10 backdrop-blur-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-red-500/10 hover:shadow-md transition-all duration-200 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    </div>
  );
}
