"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles, type RoleData } from "@/hooks/useRoles";
import ConfirmDialog from "@/components/ConfirmDialog";

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

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {loading ? (
        /* ── Loading ── */
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-gray-200 dark:border-slate-600 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Error ── */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* ── Role list ── */}
          {roles.length === 0 ? (
            <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-4">
              No roles defined yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {roles.map((role) =>
                editingId === role._id ? (
                  /* ── Edit row ── */
                  <li
                    key={role._id}
                    className="flex flex-col gap-2 p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600"
                  >
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={formLabel}
                        onChange={(e) => setFormLabel(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Role label"
                        className="flex-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        value={formRate}
                        onChange={(e) => setFormRate(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Rate"
                        min={0}
                        className="w-28 px-3 py-2 rounded-md bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancel}
                        className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!formLabel.trim() || saving}
                        className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                      >
                        {saving ? "…" : "Save"}
                      </button>
                    </div>
                  </li>
                ) : (
                  /* ── Display row ── */
                  <li
                    key={role._id}
                    className="flex items-center justify-between gap-3 py-2.5 px-1 border-b border-gray-200 dark:border-slate-800"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 dark:text-white font-medium truncate">
                        {role.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        MMK {role.hourlyRate.toLocaleString("en-US")}/hr
                      </div>
                    </div>
                    {user && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(role)}
                          className="w-8 h-8 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-colors text-sm"
                          aria-label={`Edit ${role.label}`}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setConfirmDelete(role)}
                          className="w-8 h-8 rounded-md text-gray-500 hover:text-danger hover:bg-gray-100 dark:text-slate-400 dark:hover:text-danger dark:hover:bg-slate-700 transition-colors text-sm"
                          aria-label={`Delete ${role.label}`}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </li>
                ),
              )}
            </ul>
          )}

          {/* ── Add form ── */}
          {user && adding && (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Role label"
                  className="flex-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rate"
                  min={0}
                  className="w-28 px-3 py-2 rounded-md bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={cancel}
                  className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formLabel.trim() || saving}
                  className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {saving ? "…" : "Create"}
                </button>
              </div>
            </div>
          )}

          {/* ── Add button ── */}
          {user && !isFormOpen && (
            <button
              onClick={openAdd}
              className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-900 hover:border-gray-400 dark:hover:text-white dark:hover:border-slate-500 transition-colors text-sm font-medium"
            >
              + Add Role
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
