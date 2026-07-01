import { useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { ROLES, convertCurrency, CURRENCY_SYMBOLS, type Currency } from "@/data/roles";
import RoleSelect from "@/components/RoleSelect";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Attendee } from "../types/attendee";

interface Props {
  attendees: Attendee[];
  currency: Currency;
  onAdd: (name: string, roleId: string, hourlyRate?: number) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Attendee, "name" | "roleId">>,
  ) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

export default function AttendeeManager({
  attendees,
  currency,
  onAdd,
  onUpdate,
  onDelete,
  readOnly,
}: Props) {
  const { roles: apiRoles } = useRoles();

  /** Look up role label + rate by id, using stored hourlyRate first, then fall back to role lookup. */
  function roleInfo(roleId: string, storedRate?: number): { label: string; hourlyRate: number } {
    // Use stored rate if available (from saved session / preset)
    if (storedRate !== undefined && storedRate > 0) {
      // Still look up label from roles
      const api = apiRoles.find((r) => r._id === roleId);
      if (api) return { label: api.label, hourlyRate: storedRate };
      const st = ROLES.find((r) => r.id === roleId);
      if (st) return { label: st.label, hourlyRate: storedRate };
      return { label: roleId, hourlyRate: storedRate };
    }
    // Try API roles by _id (MongoDB ObjectId)
    const api = apiRoles.find((r) => r._id === roleId);
    if (api) return { label: api.label, hourlyRate: api.hourlyRate };
    // Fall back to static ROLES by short id (for URL-parsed attendees)
    const st = ROLES.find((r) => r.id === roleId);
    if (st) return { label: st.label, hourlyRate: st.hourlyRate };
    return { label: roleId, hourlyRate: 0 };
  }

  const sym = CURRENCY_SYMBOLS[currency];

  function fmtRate(mmkRate: number): string {
    if (currency === "MMK") return `${mmkRate.toLocaleString("en-US")}`;
    return `${convertCurrency(mmkRate, currency).toFixed(2)}`;
  }

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState(apiRoles[0]?._id ?? "");
  const [confirmDelete, setConfirmDelete] = useState<Attendee | null>(null);

  const totalRate = attendees.reduce(
    (sum, a) => sum + roleInfo(a.roleId, a.hourlyRate).hourlyRate,
    0,
  );

  function openAdd() {
    setFormName("");
    setFormRole(apiRoles[0]?._id ?? "");
    setEditingId(null);
    setAdding(true);
  }

  function openEdit(a: Attendee) {
    setFormName(a.name);
    setFormRole(a.roleId);
    setAdding(false);
    setEditingId(a.id);
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
  }

  function handleSave() {
    const trimmed = formName.trim();
    if (!trimmed) return;

    if (adding) {
      const rate = roleInfo(formRole).hourlyRate;
      onAdd(trimmed, formRole, rate);
      setAdding(false);
    } else if (editingId !== null) {
      onUpdate(editingId, { name: trimmed, roleId: formRole });
      setEditingId(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") cancel();
  }

  const isFormOpen = adding || editingId !== null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
        Attendees
      </h2>

      {/* ── Attendee list ── */}
      {attendees.length === 0 && !adding ? (
        <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-4">
          No attendees yet. Add one to get started.
        </p>
      ) : (
        <ul className="space-y-1">
          {attendees.map((a) =>
            editingId === a.id ? (
              /* ── Edit row ── */
              <li
                key={a.id}
                className="flex flex-col gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex gap-2 items-stretch">
                  <input
                    autoFocus
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Name"
                    className="flex-1 h-[42px] px-3 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                  <RoleSelect
                    roles={apiRoles}
                    value={formRole}
                    onChange={setFormRole}
                    onKeyDown={handleKeyDown}
                    fmtRate={fmtRate}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={cancel}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500/50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formName.trim()}
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 transition-all duration-200"
                  >
                    Save
                  </button>
                </div>
              </li>
            ) : (
              /* ── Display row ── */
              <li
                key={a.id}
                className="group flex items-center justify-between gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 dark:text-white font-medium truncate">
                    {a.name || (
                      <span className="text-gray-400 dark:text-slate-500 italic">Unnamed</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    {roleInfo(a.roleId, a.hourlyRate).label} · {sym}{" "}
                    {fmtRate(roleInfo(a.roleId, a.hourlyRate).hourlyRate)}/hr
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                    <button
                      onClick={() => openEdit(a)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 transition-all duration-200"
                      aria-label={`Edit ${a.name || "unnamed attendee"}`}
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmDelete(a)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 transition-all duration-200"
                      aria-label={`Remove ${a.name || "unnamed attendee"}`}
                      title="Remove"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      {/* ── Add form ── */}
      {adding && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex gap-2 items-stretch">
            <input
              autoFocus
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Name"
              className="flex-1 h-[42px] px-3 rounded-md bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-primary"
            />
            <RoleSelect
              roles={apiRoles}
              value={formRole}
              onChange={setFormRole}
              onKeyDown={handleKeyDown}
              fmtRate={fmtRate}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancel}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500/50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 transition-all duration-200"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Add button ── */}
      {!readOnly && !isFormOpen && (
        <button
          onClick={openAdd}
          className="group w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-primary hover:border-primary/40 dark:hover:text-primary dark:hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Attendee
        </button>
      )}

      {/* ── Footer ── */}
      {attendees.length > 0 && (
        <div className="pt-3 text-right text-gray-500 dark:text-slate-400 text-sm border-t border-gray-100 dark:border-slate-800/50">
          {attendees.length}{" "}
          {attendees.length === 1 ? "person" : "people"} ·{" "}
          <span className="text-gray-900 dark:text-white font-semibold">
            {sym} {fmtRate(totalRate)}/hr
          </span>
        </div>
      )}

      {/* ── Confirm delete dialog ── */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove Attendee"
        message={`Remove "${confirmDelete?.name || "unnamed attendee"}" from the meeting?`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (confirmDelete) onDelete(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
