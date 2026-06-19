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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 dark:border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — guard will redirect, show nothing
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 gap-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Roles
      </h1>
      <RoleManager />
    </div>
  );
}
