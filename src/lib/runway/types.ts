/**
 * Cash Runway Alarm — types shared between client, server, and storage.
 */

export type RunwayKind = "infinite" | "noBurn" | "noCash" | "warning" | "healthy";

export interface RunwayInputs {
  /** Current bank balance in EGP. */
  cashEgp: number;
  /** Average monthly revenue / inflows in EGP. */
  monthlyIncomeEgp: number;
  /** Average monthly burn / outflows in EGP. */
  monthlyBurnEgp: number;
  /** User-defined alarm threshold in months. Default 6. */
  thresholdMonths: number;
}

export interface RunwayResult {
  kind: RunwayKind;
  /** Net monthly burn = burn − income. May be 0 or negative when profitable. */
  netBurnEgp: number;
  /** Months of runway. `Infinity` when net burn ≤ 0. */
  months: number;
  /** True when months < thresholdMonths and finite. */
  belowThreshold: boolean;
}

export interface RunwayRecommendation {
  /** Stable id used for analytics + dismissal. */
  id: string;
  /** Short Arabic action title (≤ 60 chars). */
  title: string;
  /** One-sentence rationale in Arabic. */
  rationale: string;
  /** Optional impact in months gained when applied. */
  monthsGained?: number;
}

export interface RunwaySnapshot extends RunwayInputs {
  /** Firestore document id is the user's uid. Stored here for convenience. */
  uid: string;
  /** ISO timestamp of the last user-initiated update. */
  updatedAt: string;
  /** ISO timestamp of the last automated daily check. */
  lastCheckedAt?: string;
  /** When set, banner will not show again until this date passes. */
  dismissedUntil?: string;
}
