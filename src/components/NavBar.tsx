"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmDialog from "@/components/ConfirmDialog";
import logo from "@/app/logo.png";

interface Tab {
  label: string;
  href: string;
}

const TABS: Tab[] = [
  { label: "Meet", href: "/meet" },
  { label: "Roles", href: "/roles" },
  { label: "Preset Sessions", href: "/presets" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  // Don't show on API docs page, while loading, or when logged out
  if (pathname.startsWith("/api-docs") || loading || !user) return null;

  return (
    <nav className="w-full bg-[#1f2937] border-b border-white/10 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-12">
        {/* ── Left: Logo + Brand ── */}
        <Link
          href="/meet"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <Image
            src={logo}
            alt="MeetTab"
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="text-white font-bold text-base tracking-tight hidden sm:inline">
            MeetTab
          </span>
        </Link>

        {/* ── Center: Nav tabs (desktop) ── */}
        <div className="hidden md:flex items-center h-full absolute left-1/2 -translate-x-1/2">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex items-center h-full px-4 text-sm font-medium transition-colors ${
                  active
                    ? "text-white bg-white/10"
                    : "text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-white/5"
                }`}
              >
                {tab.label}
                {/* Blue bottom border for active tab */}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-t-sm" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right: User actions (desktop) + hamburger (mobile) ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop user area */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              {/* Avatar circle */}
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <span className="text-[#e5e7eb] text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => setConfirmLogout(true)}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all"
              aria-label="Logout"
              title="Logout"
            >
              {/* Logout icon */}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>

          {/* Mobile theme toggle (always visible on small screens) */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-1.5 rounded-md text-[#9ca3af] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              /* X icon */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1f2937]">
          {/* Nav links */}
          <div className="px-2 py-1">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "text-white bg-white/10 border-l-[3px] border-primary"
                      : "text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-white/5 border-l-[3px] border-transparent"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* User info + logout */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <span className="text-[#e5e7eb] text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => {
                setMobileOpen(false);
                setConfirmLogout(true);
              }}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all"
              aria-label="Logout"
              title="Logout"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm logout dialog ── */}
      <ConfirmDialog
        open={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        onConfirm={() => {
          setConfirmLogout(false);
          handleLogout();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </nav>
  );
}
