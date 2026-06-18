"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Attendee } from "../types/attendee";
import { fromRoleCounts, toRoleCounts, encodeNames, decodeNames } from "../types/attendee";

const PARAM_KEY = "r";
const NAME_PARAM = "n";

const isBrowser = typeof window !== "undefined";

// ── URL helpers (role counts + optional names) ──

function parseUrl(): { counts: Record<string, number>; names: string[] } {
  if (!isBrowser) return { counts: {}, names: [] };
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(PARAM_KEY);
  const rawNames = params.get(NAME_PARAM);
  if (!raw) return { counts: {}, names: [] };
  const counts: Record<string, number> = {};
  for (const segment of raw.split(",")) {
    const [id, n] = segment.split(":");
    const count = parseInt(n, 10);
    if (id && count > 0) {
      counts[id] = count;
    }
  }
  return { counts, names: decodeNames(rawNames ?? "") };
}

function buildParam(counts: Record<string, number>): string {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => `${id}:${count}`)
    .join(",");
}

function syncUrl(counts: Record<string, number>, names?: string[]) {
  if (!isBrowser) return;
  const segments = buildParam(counts);
  const url = new URL(window.location.href);
  if (segments) {
    url.searchParams.set(PARAM_KEY, segments);
  } else {
    url.searchParams.delete(PARAM_KEY);
  }
  const nameStr = (names ?? []).join(",");
  if (nameStr) {
    url.searchParams.set(NAME_PARAM, nameStr);
  } else {
    url.searchParams.delete(NAME_PARAM);
  }
  window.history.replaceState(null, "", url.toString());
}

function getShareUrl(counts: Record<string, number>, names?: string[]): string {
  if (!isBrowser) return "";
  const url = new URL(window.location.href);
  const segments = buildParam(counts);
  if (segments) {
    url.searchParams.set(PARAM_KEY, segments);
  } else {
    url.searchParams.delete(PARAM_KEY);
  }
  const nameStr = (names ?? []).join(",");
  if (nameStr) {
    url.searchParams.set(NAME_PARAM, nameStr);
  } else {
    url.searchParams.delete(NAME_PARAM);
  }
  return url.toString();
}

// ── Hook ──

export function useAttendees(): {
  attendees: Attendee[];
  addAttendee: (name: string, roleId: string) => void;
  updateAttendee: (
    id: string,
    updates: Partial<Pick<Attendee, "name" | "roleId">>,
  ) => void;
  deleteAttendee: (id: string) => void;
  replaceAttendees: (entries: { name: string; roleId: string }[]) => void;
  shareUrl: string;
} {
  const [attendees, setAttendees] = useState<Attendee[]>(() => {
    const parsed = parseUrl();
    return fromRoleCounts(parsed.counts, parsed.names);
  });

  // Re-parse URL params on mount (SSR hydration)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const parsed = parseUrl();
    setAttendees(fromRoleCounts(parsed.counts, parsed.names));
    setHydrated(true);
  }, []);

  // Sync URL after render — never inside a setState updater (avoids
  // "Cannot update Router while rendering" from Next.js)
  useEffect(() => {
    if (hydrated) {
      syncUrl(toRoleCounts(attendees), attendees.map((a) => a.name));
    }
  }, [attendees, hydrated]);

  const addAttendee = useCallback((name: string, roleId: string) => {
    setAttendees((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), roleId },
    ]);
  }, []);

  const updateAttendee = useCallback(
    (id: string, updates: Partial<Pick<Attendee, "name" | "roleId">>) => {
      setAttendees((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    },
    [],
  );

  const deleteAttendee = useCallback((id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const replaceAttendees = useCallback(
    (entries: { name: string; roleId: string }[]) => {
      setAttendees(
        entries.map((e) => ({
          id: crypto.randomUUID(),
          name: e.name,
          roleId: e.roleId,
        })),
      );
    },
    [],
  );

  const shareUrl = useMemo(() => {
    if (!hydrated) return "";
    return getShareUrl(toRoleCounts(attendees), attendees.map((a) => a.name));
  }, [attendees, hydrated]);

  return {
    attendees,
    addAttendee,
    updateAttendee,
    deleteAttendee,
    replaceAttendees,
    shareUrl,
  };
}
