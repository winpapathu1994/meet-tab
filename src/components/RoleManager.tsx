"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles, type RoleData } from "@/hooks/useRoles";
import ConfirmDialog from "@/components/ConfirmDialog";

// ── Role visual mapping (same palette as RoleSelect) ──

const ROLE_ICONS: Record<string, string> = {
  Junior: "🌱",
  Senior: "⚡",
  Manager: "🧭",
  Designer: "🎨",
  QA: "🔍",
  DevOps: "⚙️",
};

const ACCENT_COLORS: Record<string, string> = {
  "🌱": "border-t-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5",
  "⚡": "border-t-amber-400 bg-amber-50/50 dark:bg-amber-500/5",
  "🧭": "border-t-violet-400 bg-violet-50/50 dark:bg-violet-500/5",
  "🎨": "border-t-pink-400 bg-pink-50/50 dark:bg-pink-500/5",
  "🔍": "border-t-cyan-400 bg-cyan-50/50 dark:bg-cyan-500/5",
  "⚙️": "border-t-orange-400 bg-orange-50/50 dark:bg-orange-500/5",
};

const BADGE_COLORS: Record<string, string> = {
  "🌱": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "⚡": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "🧭": "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "🎨": "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  "🔍": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "⚙️": "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
};

const ICON_BG_COLORS: Record<string, string> = {
  "🌱": "bg-emerald-100 dark:bg-emerald-500/15",
  "⚡": "bg-amber-100 dark:bg-amber-500/15",
  "🧭": "bg-violet-100 dark:bg-violet-500/15",
  "🎨": "bg-pink-100 dark:bg-pink-500/15",
  "🔍": "bg-cyan-100 dark:bg-cyan-500/15",
  "⚙️": "bg-orange-100 dark:bg-orange-500/15",
};

const DEFAULT_ICON = "👤";
const DEFAULT_ACCENT = "border-t-slate-300 dark:border-t-slate-600 bg-white dark:bg-slate-800";
const DEFAULT_BADGE = "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300";
const DEFAULT_ICON_BG = "bg-gray-100 dark:bg-slate-700";

function roleIcon(label: string): string {
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return DEFAULT_ICON;
}

export default function RoleManager() {
  const { user } = useAuth();
  const { roles, loading, refresh } = useRoles();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formRate, setFormRate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<RoleData | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // ── Form helpers ──

  function openAdd() {
    setFormLabel("");
    setFormRate("");
    setEditingId(null);
    setError("");
    setAdding(true);
  }

  function openEdit(role: RoleData) {
    setFormLabel(role.label);
    setFormRate(String(role.hourlyRate));
    setAdding(false);
    setError("");
    setEditingId(role._id);
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setError("");
  }

  // ── CRUD handlers ──

  const handleSave = useCallback(async () => {
    const label = formLabel.trim();
    const rate = parseInt(formRate, 10);
    if (!label || isNaN(rate) || rate < 0) {
      setError("Label and a valid hourly rate (≥ 0) are required.");
      return;
    }
    setSaving(true);
    setError("");

    if (adding) {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, hourlyRate: rate }),
      });
      if (res.ok) {
        setAdding(false);
        setSuccessMsg(`"${label}" created`);
        setTimeout(() => setSuccessMsg(""), 2500);
        refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to create role");
      }
    } else if (editingId) {
      const res = await fetch(`/api/roles/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, hourlyRate: rate }),
      });
      if (res.ok) {
        setEditingId(null);
        setSuccessMsg(`"${label}" updated`);
        setTimeout(() => setSuccessMsg(""), 2500);
        refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to update role");
      }
    }

    setSaving(false);
  }, [adding, editingId, formLabel, formRate, refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Role deleted");
        setTimeout(() => setSuccessMsg(""), 2500);
        refresh();
      }
    },
    [refresh],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") cancel();
  }

  const isFormOpen = adding || editingId !== null;

  // ── Render ──

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ── Success toast ── */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="flex items-center gap-3 bg-accent text-white px-5 py-3 rounded-xl shadow-lg shadow-accent/25 text-sm font-medium">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        </div>
      )}

      {/* ── Loading state ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Role card grid ── */}
          {roles.length === 0 && !adding ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                No custom roles defined. Add one or use the built-in defaults.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const isEditing = editingId === role._id;
                const icon = roleIcon(role.label);
                const accent = ACCENT_COLORS[icon] ?? DEFAULT_ACCENT;
                const badge = BADGE_COLORS[icon] ?? DEFAULT_BADGE;
                const iconBg = ICON_BG_COLORS[icon] ?? DEFAULT_ICON_BG;

                if (isEditing) {
                  return (
                    <div
                      key={role._id}
                      className="rounded-2xl bg-white dark:bg-slate-800 border-2 border-primary/30 shadow-lg shadow-primary/5 overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        <input
                          autoFocus
                          type="text"
                          value={formLabel}
                          onChange={(e) => setFormLabel(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Role label"
                          className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">MMK</span>
                          <input
                            type="number"
                            value={formRate}
                            onChange={(e) => setFormRate(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Hourly rate"
                            min={0}
                            className="flex-1 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                          />
                          <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">/hr</span>
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={cancel}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={!formLabel.trim() || saving}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                          >
                            {saving ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {saving ? "Saving" : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={role._id}
                    className={`group relative rounded-2xl border-t-[3px] border border-gray-200 dark:border-slate-700 ${accent} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${iconBg}`}
                        >
                          {icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {role.label}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${badge}`}>
                              MMK {role.hourlyRate.toLocaleString("en-US")}/hr
                            </span>
                          </div>
                        </div>

                        {/* Action buttons — appear on hover */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                          <button
                            onClick={() => openEdit(role)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            aria-label={`Edit ${role.label}`}
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(role)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                            aria-label={`Delete ${role.label}`}
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── Add Role form ── */}
              {adding && (
                <div className="rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-primary/40 overflow-hidden">
                  <div className="p-4 space-y-3">
                    <input
                      autoFocus
                      type="text"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Role label"
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">MMK</span>
                      <input
                        type="number"
                        value={formRate}
                        onChange={(e) => setFormRate(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Hourly rate"
                        min={0}
                        className="flex-1 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                      />
                      <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">/hr</span>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={cancel}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!formLabel.trim() || saving}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                        {saving ? "Creating" : "Create"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Add button ── */}
          {user && !isFormOpen && (
            <button
              onClick={openAdd}
              className="group w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-primary hover:border-primary/40 dark:hover:text-primary dark:hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Custom Role
            </button>
          )}
        </>
      )}

      {/* ── Confirm delete dialog ── */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Role"
        message={`Are you sure you want to delete "${confirmDelete?.label}"? This action cannot be undone.`}
        onConfirm={() => {
          if (confirmDelete) handleDelete(confirmDelete._id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
