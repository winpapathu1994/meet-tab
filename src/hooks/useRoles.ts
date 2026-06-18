"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLES } from "@/data/roles";

export interface RoleData {
  _id: string;
  label: string;
  hourlyRate: number;
}

function staticRoles(): RoleData[] {
  return ROLES.map((r) => ({
    _id: r.id,
    label: r.label,
    hourlyRate: r.hourlyRate,
  }));
}

export function useRoles(): {
  roles: RoleData[];
  loading: boolean;
  refresh: () => void;
} {
  const [roles, setRoles] = useState<RoleData[]>(staticRoles);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const apiRoles: RoleData[] = data.roles ?? [];
        if (apiRoles.length > 0) {
          setRoles(apiRoles);
        }
        // else keep the static fallback
      })
      .catch(() => {
        // keep static fallback on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { roles, loading, refresh };
}
