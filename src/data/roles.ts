export interface Role {
  id: string;
  label: string;
  hourlyRate: number; // MMK per hour
}

export const ROLES: Role[] = [
  { id: "junior",   label: "Junior Dev",     hourlyRate: 3500 },
  { id: "senior",   label: "Senior Dev",     hourlyRate: 8000 },
  { id: "manager",  label: "Manager",        hourlyRate: 12000 },
  { id: "designer", label: "Designer (UI/UX)", hourlyRate: 5000 },
  { id: "qa",       label: "QA / Tester",    hourlyRate: 3000 },
  { id: "devops",   label: "DevOps",         hourlyRate: 9000 },
];

export type Currency = "MMK" | "USD" | "SGD";

export const EXCHANGE_RATES: Record<Exclude<Currency, "MMK">, number> = {
  USD: 3658, // 1 USD = 3,658 MMK
  SGD: 1653, // 1 SGD = 1,653 MMK
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MMK: "MMK",
  USD: "$",
  SGD: "S$",
};

/** Format cost for display: MMK whole number with commas, USD/SGD with 2 decimals */
export function formatCost(amount: number, currency: Currency): string {
  if (currency === "MMK") {
    return `${Math.round(amount).toLocaleString("en-US")} MMK`;
  }
  const converted = amount / EXCHANGE_RATES[currency as Exclude<Currency, "MMK">];
  return `${CURRENCY_SYMBOLS[currency]} ${converted.toFixed(2)}`;
}

/** Convert total MMK amount to selected currency */
export function convertCurrency(amountMMK: number, currency: Currency): number {
  if (currency === "MMK") return amountMMK;
  return amountMMK / EXCHANGE_RATES[currency as Exclude<Currency, "MMK">];
}
