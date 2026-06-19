"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AttendeeManager from "@/components/AttendeeManager";
import CostDisplay from "@/components/CostDisplay";
import CurrencyToggle from "@/components/CurrencyToggle";
import AttendeePersistence from "@/components/AttendeePersistence";
import TimerControls from "@/components/TimerControls";
import SavePreset from "@/components/SavePreset";
import { useAuth } from "@/contexts/AuthContext";
import { ROLES, type Currency } from "@/data/roles";
import { useRoles } from "@/hooks/useRoles";
import { useAttendees } from "@/hooks/useAttendees";
import { useTimer } from "@/hooks/useTimer";

export default function MeetPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const { attendees, addAttendee, updateAttendee, deleteAttendee, replaceAttendees, shareUrl } =
    useAttendees();
  const { state, elapsed, start, pause, resume, reset } = useTimer();
  const [currency, setCurrency] = useState<Currency>("MMK");
  const { roles: apiRoles } = useRoles();

  // Session name from URL (set when reusing a saved session)
  const [sessionName, setSessionName] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    if (name) {
      setSessionName(name);
    }
  }, []);

  const totalRatePerHour = attendees.reduce((sum, a) => {
    if (a.hourlyRate > 0) return sum + a.hourlyRate;
    const apiRole = apiRoles.find((r) => r._id === a.roleId);
    if (apiRole) return sum + apiRole.hourlyRate;
    const stRole = ROLES.find((r) => r.id === a.roleId);
    return sum + (stRole?.hourlyRate ?? 0);
  }, 0);
  const hasRoles = attendees.length > 0;

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  }, [shareUrl]);

  const [saving, setSaving] = useState(false);

  const handleEndMeeting = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    const totalCostMMK = totalRatePerHour > 0
      ? (totalRatePerHour / 3600) * elapsed
      : 0;

    const name =
      sessionName ??
      `Session — ${new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;

    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionName: name,
          attendees: attendees.map((a) => ({
            name: a.name || "Unnamed",
            roleId: a.roleId,
            hourlyRate: a.hourlyRate,
          })),
          totalCostMMK: Math.round(totalCostMMK),
          elapsedSeconds: elapsed,
          currency,
        }),
      });
    } catch {
      // still navigate even if save fails
    }

    reset();
    setSaving(false);
    router.push("/history");
  }, [
    saving,
    totalRatePerHour,
    elapsed,
    sessionName,
    attendees,
    currency,
    reset,
    router,
  ]);

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

  const isIdle = state === "idle";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {isIdle ? (
        /* ────────────────────────────────── *
         *         SETUP VIEW (idle)           *
         * ────────────────────────────────── */
        <div className="flex flex-col items-center gap-8 w-full max-w-lg">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              MeetTab
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Track meeting costs in real time
            </p>
            {sessionName && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {sessionName}
              </span>
            )}
          </div>

          {/* Currency selector — subtle top-right feel */}
          <div className="self-end">
            <CurrencyToggle currency={currency} onChange={setCurrency} />
          </div>

          {/* Main card — attendees + quick actions */}
          <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
            <AttendeeManager
              attendees={attendees}
              currency={currency}
              onAdd={addAttendee}
              onUpdate={updateAttendee}
              onDelete={deleteAttendee}
            />
            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800" />
            <AttendeePersistence
              attendees={attendees}
              onLoad={replaceAttendees}
            />
            <SavePreset attendees={attendees} />
          </div>

          {/* Start button */}
          <TimerControls
            state={state}
            hasRoles={hasRoles}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onShare={handleShare}
            onEndMeeting={handleEndMeeting}
          />
        </div>
      ) : (
        /* ────────────────────────────────── *
         *      PROJECTOR VIEW (running)       *
         * ────────────────────────────────── */
        <div className="flex flex-col items-center gap-10 w-full max-w-3xl">
          {/* Top bar */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sessionName && (
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  {sessionName}
                </span>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {attendees.length} {attendees.length === 1 ? "person" : "people"}
              </span>
            </div>
            <CurrencyToggle currency={currency} onChange={setCurrency} />
          </div>

          {/* Hero cost + timer */}
          <div className="py-12">
            <CostDisplay
              elapsedSeconds={elapsed}
              totalRatePerHour={totalRatePerHour}
              currency={currency}
            />
          </div>

          {/* Controls */}
          <TimerControls
            state={state}
            hasRoles={hasRoles}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onShare={handleShare}
            onEndMeeting={handleEndMeeting}
          />
        </div>
      )}

    </div>
  );
}
