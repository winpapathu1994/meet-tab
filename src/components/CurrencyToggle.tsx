import type { Currency } from "../data/roles";

const CURRENCIES: Currency[] = ["MMK", "USD", "SGD"];

interface Props {
  currency: Currency;
  onChange: (c: Currency) => void;
}

export default function CurrencyToggle({ currency, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currency === c
              ? "bg-slate-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
