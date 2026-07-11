"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  const { attendees, addAttendee, updateAttendee, deleteAttendee, replaceAttendees, shareUrl } =
    useAttendees();
  const { state, elapsed, start, pause, resume, reset } = useTimer();
  const [currency, setCurrency] = useState<Currency>("MMK");
  const { roles: apiRoles } = useRoles();

  // Session name from URL (set when reusing a saved session)
  const [sessionName, setSessionName] = useState<string | null>(null);

  // ── Onboarding banner ──
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("mettab_onboarded")) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem("mettab_onboarded", "1");
  }, []);

  // ── Share link detection ──
  const hasShareParams = useMemo(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("r");
  }, []);

  const isGuest = !user && hasShareParams;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    if (name) {
      setSessionName(name);
    }
  }, []);

  // Auth guard — redirect to login only if NOT a share link
  useEffect(() => {
    if (!loading && !user && !hasShareParams) {
      router.replace("/");
    }
  }, [loading, user, router, hasShareParams]);

  const totalRatePerHour = attendees.reduce((sum, a) => {
    if (a.hourlyRate > 0) return sum + a.hourlyRate;
    const apiRole = apiRoles.find((r) => r._id === a.roleId);
    if (apiRole) return sum + apiRole.hourlyRate;
    const stRole = ROLES.find((r) => r.id === a.roleId);
    return sum + (stRole?.hourlyRate ?? 0);
  }, 0);
  const hasRoles = attendees.length > 0;

  // ── Per-role cost breakdown ──
  const roleBreakdown = useMemo(() => {
    const groups: Record<string, { label: string; hourlyRate: number; count: number; totalRate: number; color: string }> = {};
    const colorMap: Record<string, string> = {
      junior: "emerald",
      senior: "amber",
      manager: "violet",
      designer: "pink",
      qa: "cyan",
      devops: "orange",
    };

    for (const a of attendees) {
      let label = a.roleId;
      let rate = 0;

      if (a.hourlyRate > 0) {
        rate = a.hourlyRate;
        const api = apiRoles.find((r) => r._id === a.roleId);
        if (api) label = api.label;
        else {
          const st = ROLES.find((r) => r.id === a.roleId);
          if (st) label = st.label;
        }
      } else {
        const api = apiRoles.find((r) => r._id === a.roleId);
        if (api) { label = api.label; rate = api.hourlyRate; }
        else {
          const st = ROLES.find((r) => r.id === a.roleId);
          if (st) { label = st.label; rate = st.hourlyRate; }
        }
      }

      const key = a.roleId;
      if (!groups[key]) {
        const colorKey = Object.keys(colorMap).find(k => key.toLowerCase().includes(k));
        groups[key] = {
          label,
          hourlyRate: rate,
          count: 0,
          totalRate: 0,
          color: colorMap[colorKey ?? ""] ?? "slate",
        };
      }
      groups[key].count++;
      groups[key].totalRate += rate;
    }

    return Object.values(groups);
  }, [attendees, apiRoles]);

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

    // Resolve hourlyRate for each attendee — stored rate takes priority,
    // then fall back to API roles and static ROLES lookup
    function resolveRate(a: { roleId: string; hourlyRate: number }): number {
      if (a.hourlyRate > 0) return a.hourlyRate;
      const apiRole = apiRoles.find((r) => r._id === a.roleId);
      if (apiRole) return apiRole.hourlyRate;
      const stRole = ROLES.find((r) => r.id === a.roleId);
      return stRole?.hourlyRate ?? 0;
    }

    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionName: name,
          attendees: attendees.map((a) => ({
            name: a.name || "Unnamed",
            roleId: a.roleId,
            hourlyRate: resolveRate(a),
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
    apiRoles,
  ]);

  // Loading spinner while auth resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated AND not a share link — guard will redirect, show nothing
  if (!user && !hasShareParams) return null;

  const isIdle = state === "idle";
  const readOnly = isGuest;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      {isIdle ? (
        /* ────────────────────────────────── *
         *         SETUP VIEW (idle)           *
         * ────────────────────────────────── */
        <div className="flex flex-col items-center gap-8 w-full max-w-lg">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent">Meet</span>
              <span className="font-light tracking-tighter">Tab</span>
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

          {/* View-only badge for guests */}
          {readOnly && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-medium">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View-only mode
              <span className="hidden sm:inline text-xs font-normal text-amber-600 dark:text-amber-500">
                — sign in to edit
              </span>
            </div>
          )}

          {/* Onboarding banner */}
          {showOnboarding && !readOnly && (
            <div className="w-full rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 relative">
              <button
                onClick={dismissOnboarding}
                className="absolute top-3 right-3 p-1 rounded-lg text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                aria-label="Dismiss tips"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Quick tips to get started</h3>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Currency toggle</strong> (top-right) switches between MMK, USD, and SGD</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span><strong>Edit attendees</strong> — hover over a name to edit or remove</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span><strong>Save as Preset</strong> — reuse attendee configs for recurring meetings</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span><strong>Share links</strong> — copy link during a meeting to let others view live cost</span>
                </li>
              </ul>
            </div>
          )}

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
              readOnly={readOnly}
            />
            {!readOnly && (
              <>
                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-slate-800" />
                <AttendeePersistence
                  attendees={attendees}
                  onLoad={replaceAttendees}
                />
                <SavePreset attendees={attendees} />
              </>
            )}
          </div>

          {/* Start / Copy Link */}
          <TimerControls
            state={state}
            hasRoles={hasRoles}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onShare={handleShare}
            onEndMeeting={handleEndMeeting}
            readOnly={readOnly}
          />

          {/* Hint when Start is disabled */}
          {!readOnly && state === "idle" && !hasRoles && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center -mt-2">
              Add at least one attendee to start
            </p>
          )}

          {/* Sign-in prompt for guests */}
          {readOnly && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Want to edit or start a meeting?{" "}
              <button
                onClick={() => router.push("/")}
                className="text-primary hover:text-primary-hover font-medium underline underline-offset-2 transition-colors"
              >
                Sign in
              </button>
            </p>
          )}
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
              roleBreakdown={roleBreakdown}
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
