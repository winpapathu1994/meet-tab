"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function UserMenu() {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Reset form when opening
  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setError("");
      setSuccess("");
      setAvatarPreview(null);
    }
  }, [open, user]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      setSaving(false);
      return;
    }

    try {
      // Upload avatar if changed
      if (avatarPreview && fileRef.current?.files?.[0]) {
        const formData = new FormData();
        formData.append("file", fileRef.current.files[0]);
        const res = await fetch("/api/auth/avatar", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to upload avatar");
          setSaving(false);
          return;
        }
        updateUser({ image: data.image });
      }

      // Update name + password
      const body: Record<string, string> = {};
      if (trimmed !== user.name) body.name = trimmed;
      if (showPassword && currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      if (Object.keys(body).length > 0 || avatarPreview) {
        const res = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to update profile");
          setSaving(false);
          return;
        }
        if (data.user) updateUser({ name: data.user.name });
      }

      setSuccess("Profile updated");
      setTimeout(() => {
        setOpen(false);
      }, 1000);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [user, name, avatarPreview, showPassword, currentPassword, newPassword, updateUser]);

  if (!user) return null;

  const avatarUrl = avatarPreview || user.image || null;

  return (
    <div className="relative shrink-0" ref={panelRef}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
        <span className="text-[#e5e7eb] text-sm font-medium hidden sm:inline">
          {user.name}
        </span>
      </button>

      {/* Dropdown panel — desktop: anchored dropdown; mobile: centered overlay */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:inset-x-auto sm:translate-y-0 sm:max-h-none sm:overflow-y-visible sm:w-80 z-50 rounded-xl bg-[#1e293b] border border-white/10 shadow-2xl p-5">
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-base">Profile Settings</h3>
              <button
                onClick={() => setOpen(false)}
                className="sm:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          {/* Avatar section */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => fileRef.current?.click()}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {user.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-sm text-primary hover:text-primary-hover transition-colors font-medium"
              >
                Change Photo
              </button>
              {avatarPreview && (
                <button
                  onClick={() => {
                    setAvatarPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-xs text-gray-400 hover:text-danger transition-colors ml-2"
                >
                  Remove
                </button>
              )}
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPEG, WebP · max 2 MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Name field */}
          <label className="block mb-3">
            <span className="text-xs text-gray-400 mb-1 block">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
            />
          </label>

          {/* Password section */}
          <button
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors font-medium mb-2"
          >
            <svg
              className={`h-3 w-3 transition-transform ${showPassword ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Change Password
          </button>

          {showPassword && (
            <div className="space-y-2 mb-3 pl-4 border-l-2 border-slate-700">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-xs">Passwords do not match</p>
              )}
            </div>
          )}

          {/* Messages */}
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          {success && <p className="text-accent text-sm mb-3">{success}</p>}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary/50 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                saving ||
                !name.trim() ||
                (showPassword && !!newPassword && newPassword !== confirmPassword)
              }
              className="px-4 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              {saving ? "…" : "Save"}
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
