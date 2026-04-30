import { describe, expect, it } from "vitest";
import {
  buildRecommendations,
  computeRunway,
  DEFAULT_THRESHOLD_MONTHS,
  fmtMonths,
} from "@/src/lib/runway/calc";

describe("computeRunway", () => {
  it("returns infinite when income covers burn", () => {
    const r = computeRunway({
      cashEgp: 100_000,
      monthlyIncomeEgp: 50_000,
      monthlyBurnEgp: 30_000,
      thresholdMonths: 6,
    });
    expect(r.kind).toBe("infinite");
    expect(r.months).toBe(Infinity);
    expect(r.belowThreshold).toBe(false);
  });

  it("returns warning when months below threshold", () => {
    const r = computeRunway({
      cashEgp: 50_000,
      monthlyIncomeEgp: 0,
      monthlyBurnEgp: 25_000, // 2 months
      thresholdMonths: 6,
    });
    expect(r.kind).toBe("warning");
    expect(r.months).toBe(2);
    expect(r.belowThreshold).toBe(true);
  });

  it("returns healthy when months >= threshold", () => {
    const r = computeRunway({
      cashEgp: 600_000,
      monthlyIncomeEgp: 0,
      monthlyBurnEgp: 50_000, // 12 months
      thresholdMonths: 6,
    });
    expect(r.kind).toBe("healthy");
    expect(r.months).toBe(12);
    expect(r.belowThreshold).toBe(false);
  });

  it("returns noCash when cash is zero but burn exists", () => {
    const r = computeRunway({
      cashEgp: 0,
      monthlyIncomeEgp: 0,
      monthlyBurnEgp: 25_000,
      thresholdMonths: 6,
    });
    expect(r.kind).toBe("noCash");
    expect(r.belowThreshold).toBe(true);
  });

  it("clamps negative inputs to zero", () => {
    const r = computeRunway({
      cashEgp: -1,
      monthlyIncomeEgp: -50,
      monthlyBurnEgp: -100,
      thresholdMonths: 6,
    });
    expect(r.kind).toBe("noBurn");
  });

  it("falls back to default threshold when invalid", () => {
    const r = computeRunway({
      cashEgp: 100_000,
      monthlyIncomeEgp: 0,
      monthlyBurnEgp: 25_000,
      thresholdMonths: 0, // invalid → default 6
    });
    // 4 months < 6 default → warning
    expect(r.kind).toBe("warning");
    expect(DEFAULT_THRESHOLD_MONTHS).toBe(6);
  });
});

describe("buildRecommendations", () => {
  it("returns urgent recs when warning + low months", () => {
    const inputs = {
      cashEgp: 30_000,
      monthlyIncomeEgp: 0,
      monthlyBurnEgp: 30_000,
      thresholdMonths: 6,
    };
    const result = computeRunway(inputs);
    const recs = buildRecommendations(inputs, result);
    expect(recs.length).toBeGreaterThanOrEqual(3);
    expect(recs.some((r) => r.id === "cut-burn")).toBe(true);
    expect(recs.some((r) => r.id === "freeze-hiring")).toBe(true);
  });

  it("returns growth recs when healthy", () => {
    const inputs = {
      cashEgp: 1_000_000,
      monthlyIncomeEgp: 0,
      monthlyBurnEgp: 50_000,
      thresholdMonths: 6,
    };
    const result = computeRunway(inputs);
    const recs = buildRecommendations(inputs, result);
    expect(recs.some((r) => r.id === "extend-runway")).toBe(true);
  });

  it("returns reinvest rec when infinite", () => {
    const inputs = {
      cashEgp: 100_000,
      monthlyIncomeEgp: 80_000,
      monthlyBurnEgp: 50_000,
      thresholdMonths: 6,
    };
    const result = computeRunway(inputs);
    const recs = buildRecommendations(inputs, result);
    expect(recs.some((r) => r.id === "reinvest")).toBe(true);
  });
});

describe("fmtMonths", () => {
  it("formats infinity", () => {
    expect(fmtMonths(Infinity)).toBe("∞");
  });
  it("formats months under 12", () => {
    expect(fmtMonths(4.3)).toMatch(/شهر/);
  });
  it("formats years for 12+ months", () => {
    expect(fmtMonths(18)).toMatch(/سنة/);
  });
});
