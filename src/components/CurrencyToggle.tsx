"use client";

import type { Currency } from "../data/roles";

const CURRENCIES: Currency[] = ["MMK", "USD", "SGD"];

interface Props {
  currency: Currency;
  onChange: (c: Currency) => void;
}

export default function CurrencyToggle({ currency, onChange }: Props) {
  return (
    <div className="inline-flex rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 ring-1 ring-inset ring-slate-200/60 dark:ring-slate-700/60 shadow-sm">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`relative px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 ${
            currency === c
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md shadow-slate-200/50 dark:shadow-black/20"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
          }`}
        >
          {c === "MMK" ? "MMK" : c === "USD" ? "USD" : "SGD"}
        </button>
      ))}
    </div>
  );
}
