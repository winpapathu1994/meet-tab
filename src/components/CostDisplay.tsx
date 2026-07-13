import { useEffect, useRef, useState } from "react";
import type { Currency } from "../data/roles";
import { convertCurrency, CURRENCY_SYMBOLS, formatCost } from "../data/roles";

interface RoleBreakdownItem {
  label: string;
  hourlyRate: number;
  count: number;
  totalRate: number;
  color: string;
}

interface Props {
  elapsedSeconds: number;
  totalRatePerHour: number;
  currency: Currency;
  roleBreakdown?: RoleBreakdownItem[];
}

function fmtTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

export default function CostDisplay({
  elapsedSeconds,
  totalRatePerHour,
  currency,
  roleBreakdown,
}: Props) {
  const costMMK = (totalRatePerHour / 3600) * elapsedSeconds;
  const cost = convertCurrency(costMMK, currency);

  const colorClasses: Record<string, { bg: string; text: string; dot: string }> = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
    amber: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
    violet: { bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
    pink: { bg: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", dot: "bg-pink-500" },
    cyan: { bg: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", dot: "bg-cyan-500" },
    orange: { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
    slate: { bg: "bg-slate-50 dark:bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-500" },
  };

  return (
    <div className="flex flex-col items-center gap-10 select-none">
      {/* Timer — clean monospace */}
      <div className="font-mono tabular-nums text-slate-400 dark:text-slate-500 text-4xl sm:text-5xl md:text-7xl font-light tracking-[0.15em]">
        {fmtTime(elapsedSeconds)}
      </div>

      {/* Cost — the hero */}
      <AnimatedCost cost={cost} currency={currency} />

      {/* Rate subtitle */}
      <div className="text-slate-400 dark:text-slate-500 text-base font-medium tracking-wide">
        {CURRENCY_SYMBOLS[currency]}{" "}
        {formatCost(totalRatePerHour, currency)
          .replace(/MMK|USD|SGD|\$|S\$/g, "")
          .trim()}
        /hr running
      </div>

      {/* Per-role breakdown */}
      {roleBreakdown && roleBreakdown.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {roleBreakdown.map((role) => {
            const roleCostMMK = (role.totalRate / 3600) * elapsedSeconds;
            const roleCost = convertCurrency(roleCostMMK, currency);
            const colors = colorClasses[role.color] ?? colorClasses.slate;

            let display: string;
            if (currency === "MMK") {
              display = `${Math.round(roleCost).toLocaleString("en-US")} MMK`;
            } else {
              display = `${CURRENCY_SYMBOLS[currency]} ${roleCost.toFixed(2)}`;
            }

            return (
              <div
                key={role.label}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors.bg} border border-transparent`}
              >
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <div className="text-left">
                  <div className={`text-xs font-medium ${colors.text}`}>
                    {role.label}
                    {role.count > 1 && <span className="ml-1 opacity-60">×{role.count}</span>}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums font-mono">
                    {display}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnimatedCost({
  cost,
  currency,
}: {
  cost: number;
  currency: Currency;
}) {
  const prevRef = useRef(cost);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (Math.floor(cost) !== Math.floor(prevRef.current)) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 200);
      prevRef.current = cost;
      return () => clearTimeout(t);
    }
  }, [cost]);

  let display: string;
  if (currency === "MMK") {
    display = `${Math.round(cost).toLocaleString("en-US")} MMK`;
  } else {
    display = `${CURRENCY_SYMBOLS[currency]} ${cost.toFixed(2)}`;
  }

  return (
    <div
      className={`font-mono tabular-nums font-bold text-slate-900 dark:text-white leading-none
        text-5xl sm:text-6xl md:text-8xl lg:text-9xl
        transition-all duration-200 ${
          flash
            ? "scale-[1.02] text-primary"
            : "scale-100"
        }`}
    >
      {display}
    </div>
  );
}
