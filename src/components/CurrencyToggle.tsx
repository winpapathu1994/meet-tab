import type { Currency } from "../data/roles";

const CURRENCIES: Currency[] = ["MMK", "USD", "SGD"];

interface Props {
  currency: Currency;
  onChange: (c: Currency) => void;
}

export default function CurrencyToggle({ currency, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm dark:shadow-none">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currency === c
              ? "bg-gray-200 text-gray-900 dark:bg-slate-600 dark:text-white"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
