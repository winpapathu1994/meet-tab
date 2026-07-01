"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmDialog from "@/components/ConfirmDialog";
import UserMenu from "@/components/UserMenu";

interface Tab {
  label: string;
  href: string;
}

const TABS: Tab[] = [
  { label: "Meet", href: "/meet" },
  { label: "Roles", href: "/roles" },
  { label: "Preset", href: "/presets" },
  { label: "History", href: "/history" },
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

  // Don't show on API docs, login, register pages, while loading, or when logged out
  if (pathname.startsWith("/api-docs") || pathname === "/" || pathname === "/register" || loading || !user) return null;

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 z-30 shadow-sm dark:shadow-none">
      <div className="max-w-3xl mx-auto flex items-center px-4 h-14">
        {/* ── Left: Brand ── */}
        <Link
          href="/meet"
          className="hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">Meet</span>
            <span className="font-light tracking-tighter">Tab</span>
          </span>
        </Link>

        {/* ── Center: Nav tabs (desktop) ── */}
        <div className="hidden md:flex items-center h-full flex-1 justify-center">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex items-center h-full px-4 text-base font-medium transition-colors ${
                  active
                    ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-white/5"
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
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Desktop user area */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
            <button
              onClick={() => setConfirmLogout(true)}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all"
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
            className="md:hidden p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-white/5 transition-colors"
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
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Nav links */}
          <div className="max-w-3xl mx-auto px-4 py-1">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    active
                      ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 border-l-[3px] border-primary"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-white/5 border-l-[3px] border-transparent"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* User info + profile + logout */}
          <div className="max-w-3xl mx-auto px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <UserMenu />
            <button
              onClick={() => {
                setMobileOpen(false);
                setConfirmLogout(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all"
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
