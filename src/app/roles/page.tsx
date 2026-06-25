"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RoleManager from "@/components/RoleManager";
import { useAuth } from "@/contexts/AuthContext";

export default function RolesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Loading spinner while auth resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — guard will redirect, show nothing
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Roles
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Customize hourly rates for each role
          </p>
        </div>

        <RoleManager />
      </div>
    </div>
  );
}
