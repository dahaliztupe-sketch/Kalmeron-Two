/**
 * Central number & date formatting utilities for Kalmeron.
 *
 * All functions use Latin (Western) digits regardless of locale, so Arabic UI
 * shows 1,234 not ١٬٢٣٤.  Pass a language tag ending in -u-nu-latn to keep
 * Arabic date/time structure while still using Western digits.
 */

const LATN = "ar-EG-u-nu-latn";

/**
 * Format a plain integer or decimal with thousand separators.
 * e.g. 12345.6 → "12,345.6"
 */
export function formatNum(n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(LATN, opts).format(n);
}

/**
 * Format currency — defaults to EGP.
 * e.g. formatCurrency(5000) → "5,000 ج.م."
 */
export function formatCurrency(
  n: number,
  currency = "EGP",
  opts?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(LATN, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);
}

/**
 * Format a percentage.
 * e.g. formatPct(0.237) → "23.7%"
 */
export function formatPct(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Format a Date or ISO string for display in the Arabic UI with Latin digits.
 * e.g. "٢٢ مايو ٢٠٢٥" → "22 مايو 2025"
 */
export function formatDate(
  date: Date | string | number,
  opts?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "object" ? date : new Date(date);
  return d.toLocaleDateString(LATN, opts);
}

/**
 * Format a Date or ISO string with time using Latin digits.
 */
export function formatDateTime(
  date: Date | string | number,
  opts?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "object" ? date : new Date(date);
  return d.toLocaleString(LATN, opts);
}
