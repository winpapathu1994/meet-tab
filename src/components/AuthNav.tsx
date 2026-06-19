"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthNav() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  // Don't show anything while loading or when logged out
  if (loading || !user) return null;

  return (
    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
      <span className="text-gray-500 dark:text-slate-400 text-sm px-2">{user.name}</span>
      <button
        onClick={handleLogout}
        className="text-sm px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-danger hover:bg-gray-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger/50 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
