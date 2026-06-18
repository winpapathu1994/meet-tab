import { useEffect, useRef, useState } from "react";
import type { Currency } from "../data/roles";
import { convertCurrency, CURRENCY_SYMBOLS, formatCost } from "../data/roles";

interface Props {
  elapsedSeconds: number;
  totalRatePerHour: number; // MMK
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
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Timer */}
      <div className="font-mono tabular-nums text-slate-400 text-4xl md:text-6xl tracking-wider">
        {fmtTime(elapsedSeconds)}
      </div>

      {/* Cost — the hero element */}
      <AnimatedCost cost={cost} currency={currency} />

      {/* Rate label */}
      <div className="text-slate-500 text-lg">
        {CURRENCY_SYMBOLS[currency]}{" "}
        {formatCost(totalRatePerHour, currency)
          .replace(/MMK|USD|SGD|\$|S\$/g, "")
          .trim()}
        /hr
      </div>
    </div>
  );
}

/** Cost number that animates digit changes with a subtle flip effect */
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
      const t = setTimeout(() => setFlash(false), 150);
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
      className={`font-mono tabular-nums font-bold text-white leading-none
        text-5xl sm:text-6xl md:text-7xl lg:text-8xl
        transition-colors duration-150 ${flash ? "text-amber-400" : ""}`}
    >
      {display}
    </div>
  );
}
