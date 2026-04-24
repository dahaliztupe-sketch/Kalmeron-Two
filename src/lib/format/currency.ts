/**
 * Kalmeron Currency Formatter
 * ----------------------------
 * Single source of truth for displaying money across MENA + USD.
 * Backed by Intl.NumberFormat — RTL-safe, locale-aware, defensive against NaN.
 *
 * Supported codes (per DESIGN_LANGUAGE_PLAN):
 *   EGP — جنيه مصري       (Egyptian Pound)
 *   SAR — ريال سعودي      (Saudi Riyal)
 *   AED — درهم إماراتي    (Emirati Dirham)
 *   USD — دولار أمريكي    (US Dollar)
 *
 * Locale rules:
 *   - Arabic locale formats numbers in Arabic-Indic digits + Arabic currency symbol.
 *   - English locale formats with Western digits + ISO symbol.
 *   - Default locale follows the active app locale via the optional argument.
 */

export type CurrencyCode = "EGP" | "SAR" | "AED" | "USD";
export type CurrencyLocale = "ar" | "en";

export interface FormatCurrencyOptions {
  /** ISO 4217 currency code. Default: "USD". */
  currency?: CurrencyCode;
  /** UI language. Default: "ar". */
  locale?: CurrencyLocale;
  /** Force a fractional digit count. Default: smart (0 if integer-ish, 2 otherwise). */
  fractionDigits?: number;
  /** Compact notation (e.g. 1.2K, 3.4M). Default: false. */
  compact?: boolean;
  /** Show currency symbol/code. Default: true. */
  withSymbol?: boolean;
}

/** Map of canonical Arabic currency labels for plain-text contexts (e.g. AI prompts). */
export const CURRENCY_LABEL_AR: Record<CurrencyCode, string> = {
  EGP: "جنيه مصري",
  SAR: "ريال سعودي",
  AED: "درهم إماراتي",
  USD: "دولار أمريكي",
};

export const CURRENCY_LABEL_EN: Record<CurrencyCode, string> = {
  EGP: "Egyptian Pound",
  SAR: "Saudi Riyal",
  AED: "Emirati Dirham",
  USD: "US Dollar",
};

/** Default per-region currency. Keep aligned with `lib/region.ts` if added later. */
export const DEFAULT_CURRENCY_BY_LOCALE: Record<CurrencyLocale, CurrencyCode> = {
  ar: "EGP",
  en: "USD",
};

/**
 * Format a numeric amount as a currency string.
 *
 * @example
 *   formatCurrency(1499)                              // "1,499 $"
 *   formatCurrency(1499, { currency: "EGP" })         // "١٬٤٩٩ ج.م"
 *   formatCurrency(1_500_000, { compact: true })      // "1.5M $"
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: FormatCurrencyOptions = {},
): string {
  const {
    currency = "USD",
    locale = "ar",
    fractionDigits,
    compact = false,
    withSymbol = true,
  } = options;

  // Defensive — never let "NaN $" leak to UI.
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return locale === "ar" ? "—" : "—";
  }

  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  // Smart fraction digits: integer-ish amounts hide decimals.
  const isIntegerish = Math.abs(amount % 1) < 0.005;
  const minFrac = fractionDigits ?? (isIntegerish ? 0 : 2);
  const maxFrac = fractionDigits ?? (isIntegerish ? 0 : 2);

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: withSymbol ? "currency" : "decimal",
      currency,
      currencyDisplay: "symbol",
      notation: compact ? "compact" : "standard",
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    }).format(amount);
  } catch {
    // Fallback if the runtime lacks the requested locale.
    const n = amount.toLocaleString("en-US", {
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    });
    return withSymbol ? `${n} ${currency}` : n;
  }
}

/** Quick helper — a number → "1.2K MAU" style label without currency. */
export function formatCompactNumber(amount: number, locale: CurrencyLocale = "ar"): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Convert annual price to a friendly per-month label (rounded). */
export function annualToMonthly(annual: number): number {
  if (!Number.isFinite(annual)) return 0;
  return Math.round(annual / 12);
}
