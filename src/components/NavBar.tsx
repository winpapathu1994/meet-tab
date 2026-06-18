"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Tab {
  label: string;
  href: string;
}

const TABS: Tab[] = [
  { label: "Meet", href: "/meet" },
  { label: "Roles", href: "/roles" },
  { label: "Meeting Sessions", href: "/presets" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  // Don't show on API docs page, while loading, or when logged out
  if (pathname.startsWith("/api-docs") || loading || !user) return null;

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-12">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-2 py-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
