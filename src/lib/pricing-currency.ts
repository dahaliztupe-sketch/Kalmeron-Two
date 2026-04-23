/**
 * PPP-adjusted regional currency localization for pricing.
 * Detects user country and adjusts pricing to reflect local purchasing power.
 */

export type CurrencyCode = "USD" | "EGP" | "SAR" | "AED" | "JOD" | "KWD" | "QAR" | "BHD" | "OMR" | "MAD" | "TND" | "DZD";

export interface RegionalPricing {
  countryCode: string;
  currencyCode: CurrencyCode;
  currencySymbol: string;
  /** PPP factor relative to USD. 1.0 = same purchasing power. */
  pppFactor: number;
  /** USD → local conversion (approximate retail rate, refresh quarterly). */
  fxRate: number;
  /** Whether to show PPP-adjusted local price as the headline. */
  applyPppDiscount: boolean;
  /** Display order locally formatted. */
  formatPrefix?: string;
}

export const REGIONAL_PRICING: Record<string, RegionalPricing> = {
  US: { countryCode: "US", currencyCode: "USD", currencySymbol: "$", pppFactor: 1.0, fxRate: 1, applyPppDiscount: false, formatPrefix: "$" },
  EG: { countryCode: "EG", currencyCode: "EGP", currencySymbol: "ج.م", pppFactor: 0.35, fxRate: 49, applyPppDiscount: true, formatPrefix: "ج.م" },
  SA: { countryCode: "SA", currencyCode: "SAR", currencySymbol: "ر.س", pppFactor: 1.0, fxRate: 3.75, applyPppDiscount: false, formatPrefix: "ر.س" },
  AE: { countryCode: "AE", currencyCode: "AED", currencySymbol: "د.إ", pppFactor: 1.0, fxRate: 3.67, applyPppDiscount: false, formatPrefix: "د.إ" },
  JO: { countryCode: "JO", currencyCode: "JOD", currencySymbol: "د.أ", pppFactor: 0.65, fxRate: 0.71, applyPppDiscount: true, formatPrefix: "د.أ" },
  KW: { countryCode: "KW", currencyCode: "KWD", currencySymbol: "د.ك", pppFactor: 1.0, fxRate: 0.31, applyPppDiscount: false, formatPrefix: "د.ك" },
  QA: { countryCode: "QA", currencyCode: "QAR", currencySymbol: "ر.ق", pppFactor: 1.0, fxRate: 3.64, applyPppDiscount: false, formatPrefix: "ر.ق" },
  BH: { countryCode: "BH", currencyCode: "BHD", currencySymbol: "د.ب", pppFactor: 1.0, fxRate: 0.376, applyPppDiscount: false, formatPrefix: "د.ب" },
  OM: { countryCode: "OM", currencyCode: "OMR", currencySymbol: "ر.ع", pppFactor: 0.85, fxRate: 0.385, applyPppDiscount: true, formatPrefix: "ر.ع" },
  MA: { countryCode: "MA", currencyCode: "MAD", currencySymbol: "د.م", pppFactor: 0.45, fxRate: 10, applyPppDiscount: true, formatPrefix: "د.م" },
  TN: { countryCode: "TN", currencyCode: "TND", currencySymbol: "د.ت", pppFactor: 0.4, fxRate: 3.1, applyPppDiscount: true, formatPrefix: "د.ت" },
  DZ: { countryCode: "DZ", currencyCode: "DZD", currencySymbol: "د.ج", pppFactor: 0.3, fxRate: 134, applyPppDiscount: true, formatPrefix: "د.ج" },
};

/** Detect user country via Vercel/Cloudflare headers or fallback. */
export function detectCountry(headerLookup: (key: string) => string | null | undefined): string {
  return (
    headerLookup("x-vercel-ip-country") ||
    headerLookup("cf-ipcountry") ||
    headerLookup("x-country-code") ||
    "US"
  );
}

export function getPricingForCountry(country: string): RegionalPricing {
  return REGIONAL_PRICING[country.toUpperCase()] || REGIONAL_PRICING["US"];
}

/**
 * Convert USD price to localized display string.
 * If applyPppDiscount, divides USD price by PPP factor before converting.
 */
export function formatLocalPrice(usdPrice: number, pricing: RegionalPricing): string {
  const adjustedUsd = pricing.applyPppDiscount ? usdPrice * pricing.pppFactor : usdPrice;
  const local = adjustedUsd * pricing.fxRate;
  const rounded = local >= 100 ? Math.round(local / 5) * 5 : Math.round(local);
  return `${pricing.formatPrefix || pricing.currencySymbol} ${rounded.toLocaleString("ar-EG")}`;
}

/** Return both USD anchor and local price. */
export function dualPrice(usdPrice: number, pricing: RegionalPricing): { local: string; usd: string } {
  return {
    local: formatLocalPrice(usdPrice, pricing),
    usd: `$${usdPrice}`,
  };
}
