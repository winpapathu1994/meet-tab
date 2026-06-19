import { useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { ROLES, convertCurrency, CURRENCY_SYMBOLS, type Currency } from "@/data/roles";
import RoleSelect from "@/components/RoleSelect";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Attendee } from "../types/attendee";

interface Props {
  attendees: Attendee[];
  currency: Currency;
  onAdd: (name: string, roleId: string) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Attendee, "name" | "roleId">>,
  ) => void;
  onDelete: (id: string) => void;
}

export default function AttendeeManager({
  attendees,
  currency,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const { roles: apiRoles } = useRoles();

  /** Look up role label + rate by id. Matches MongoDB _id first, then static short id, then fallback. */
  function roleInfo(roleId: string): { label: string; hourlyRate: number } {
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
    (sum, a) => sum + roleInfo(a.roleId).hourlyRate,
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
      onAdd(trimmed, formRole);
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
    <div className="w-full max-w-lg mx-auto space-y-4">
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
                className="flex flex-col gap-2 p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600"
              >
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
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formName.trim()}
                    className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    Save
                  </button>
                </div>
              </li>
            ) : (
              /* ── Display row ── */
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-2.5 px-1 border-b border-gray-200 dark:border-slate-800"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 dark:text-white font-medium truncate">
                    {a.name || (
                      <span className="text-gray-400 dark:text-slate-500 italic">Unnamed</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    {roleInfo(a.roleId).label} · {sym}{" "}
                    {fmtRate(roleInfo(a.roleId).hourlyRate)}/hr
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(a)}
                    className="w-8 h-8 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 transition-colors text-sm"
                    aria-label={`Edit ${a.name || "unnamed attendee"}`}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDelete(a)}
                    className="w-8 h-8 rounded-md text-gray-500 hover:text-danger hover:bg-gray-100 dark:text-slate-400 dark:hover:text-danger dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 transition-colors text-sm"
                    aria-label={`Remove ${a.name || "unnamed attendee"}`}
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {/* ── Add form ── */}
      {adding && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600">
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
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Add button ── */}
      {!isFormOpen && (
        <button
          onClick={openAdd}
          className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-900 hover:border-gray-400 dark:hover:text-white dark:hover:border-slate-500 transition-colors text-sm font-medium"
        >
          + Add Attendee
        </button>
      )}

      {/* ── Footer ── */}
      {attendees.length > 0 && (
        <div className="pt-3 text-right text-gray-500 dark:text-slate-400 text-sm border-t border-gray-300 dark:border-slate-700">
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
