import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

type Idx = { collectionGroup: string; queryScope: string; fields: { fieldPath: string; order?: string }[] };

describe("firestore.indexes.json", () => {
  const d = JSON.parse(readFileSync("firestore.indexes.json", "utf8")) as { indexes: Idx[] };
  it("has no duplicate composite indexes and each has 2+ fields", () => {
    const keys = d.indexes.map((i) => i.collectionGroup + "|" + i.fields.map((f) => f.fieldPath + ":" + f.order).join(","));
    expect(new Set(keys).size).toBe(keys.length);
    for (const i of d.indexes) expect(i.fields.length).toBeGreaterThanOrEqual(2);
  });
  it("covers the audited query shapes", () => {
    const has = (c: string, f: string[]) => d.indexes.some((i) => i.collectionGroup === c && i.fields.map((x) => x.fieldPath).join(",") === f.join(","));
    expect(has("usageEvents", ["userId", "createdAt"])).toBe(true);
    expect(has("usage_daily", ["userId", "date"])).toBe(true);
    expect(has("cap_tables", ["userId", "updatedAt"])).toBe(true);
    expect(has("consent_events", ["userId", "consentType", "collectedAt"])).toBe(true);
  });
});
