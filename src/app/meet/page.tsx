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
    // Try API roles by _id first, then static ROLES by short id
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

  // Loading spinner while auth resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — guard will redirect, show nothing
  if (!user) return null;

  const isIdle = state === "idle";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 gap-8">
      {/* Currency toggle — always visible */}
      {isIdle && (
        <CurrencyToggle currency={currency} onChange={setCurrency} />
      )}

      {isIdle ? (
        /* ── Setup view ── */
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              MeetTab
            </h1>
            {sessionName && (
              <p className="text-sm text-slate-400">{sessionName}</p>
            )}
          </div>
          <AttendeeManager
            attendees={attendees}
            currency={currency}
            onAdd={addAttendee}
            onUpdate={updateAttendee}
            onDelete={deleteAttendee}
          />
          <AttendeePersistence
            attendees={attendees}
            onLoad={replaceAttendees}
          />
          <SavePreset
            attendees={attendees}
          />
          <TimerControls
            state={state}
            hasRoles={hasRoles}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onShare={handleShare}
          />
        </div>
      ) : (
        /* ── Projector / meeting view ── */
        <div className="flex flex-col items-center gap-10 w-full max-w-4xl">
          {sessionName && (
            <p className="text-sm text-slate-500">{sessionName}</p>
          )}
          <CurrencyToggle currency={currency} onChange={setCurrency} />
          <CostDisplay
            elapsedSeconds={elapsed}
            totalRatePerHour={totalRatePerHour}
            currency={currency}
          />
          <TimerControls
            state={state}
            hasRoles={hasRoles}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onShare={handleShare}
          />
        </div>
      )}
    </div>
  );
}
