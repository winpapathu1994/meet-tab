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
      <span className="text-slate-400 text-sm px-2">{user.name}</span>
      <button
        onClick={handleLogout}
        className="text-sm px-3 py-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
