"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

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
    <nav className="w-full bg-[#1f2937] border-b border-white/10">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-12">
        {/* Tabs */}
        <div className="flex items-center h-full">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center h-full px-3 text-sm font-medium transition-colors border-l-[3px] ${
                  active
                    ? "border-primary text-[#f3f4f6] bg-white/5"
                    : "border-transparent text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-white/5"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* User + logout + theme toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[#9ca3af] text-sm">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-2 py-1 rounded-md text-[#9ca3af] hover:text-danger hover:bg-white/5 transition-colors"
          >
            Logout
          </button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
