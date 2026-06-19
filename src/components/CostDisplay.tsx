import { useEffect, useRef, useState } from "react";
import type { Currency } from "../data/roles";
import { convertCurrency, CURRENCY_SYMBOLS, formatCost } from "../data/roles";

interface Props {
  elapsedSeconds: number;
  totalRatePerHour: number;
  currency: Currency;
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
}: Props) {
  const costMMK = (totalRatePerHour / 3600) * elapsedSeconds;
  const cost = convertCurrency(costMMK, currency);

  return (
    <div className="flex flex-col items-center gap-10 select-none">
      {/* Timer — clean monospace */}
      <div className="font-mono tabular-nums text-slate-400 dark:text-slate-500 text-5xl md:text-7xl font-light tracking-[0.15em]">
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
        text-6xl sm:text-7xl md:text-8xl lg:text-9xl
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
