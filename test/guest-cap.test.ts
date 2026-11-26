import { describe, it, expect, vi, beforeEach } from "vitest";

let docData: { count: number } | undefined;
let fail = false;
vi.mock("@/src/lib/firebase-admin", () => ({
  adminDb: {
    collection: () => ({ doc: () => ({}) }),
    runTransaction: async (fn: (tx: unknown) => Promise<boolean>) => {
      if (fail) throw new Error("firestore down");
      return fn({
        get: async () => ({ exists: !!docData, data: () => docData }),
        set: (_r: unknown, d: { count: number }) => void (docData = { count: d.count }),
      });
    },
  },
}));

import { consumeGuestQuota, GUEST_DAILY_CAP, GUEST_ROLE_DAILY_CAP, dayKey } from "@/src/lib/plan/guest-cap";

describe("guest quota", () => {
  beforeEach(() => { docData = undefined; fail = false; });
  it("allows up to the cap, then refuses", async () => {
    docData = { count: GUEST_DAILY_CAP - 1 };
    expect(await consumeGuestQuota()).toBe(true);
    expect(await consumeGuestQuota()).toBe(false);
  });
  it("role quota has its own cap", async () => {
    docData = { count: GUEST_ROLE_DAILY_CAP - 1 };
    expect(await consumeGuestQuota(new Date(), "roles")).toBe(true);
    expect(await consumeGuestQuota(new Date(), "roles")).toBe(false);
  });
  it("fails closed when the counter is unavailable", async () => {
    fail = true;
    expect(await consumeGuestQuota()).toBe(false);
  });
  it("uses a per-day key", () => {
    expect(dayKey(new Date("2026-11-26T23:59:00Z"))).toBe("2026-11-26");
  });
});
