import { describe, it, expect } from "vitest";
import { MARKETING_KNOWLEDGE } from "@/src/lib/company/knowledge/marketing";
import { knowledgePrompt, staleItems } from "@/src/lib/company/knowledge/types";
import { MARKETING_ROLE } from "@/src/lib/company/roles/marketing";

describe("role knowledge", () => {
  it("every item has an https source and a review date", () => {
    for (const i of MARKETING_KNOWLEDGE.items) {
      expect(i.sourceUrl.startsWith("https://")).toBe(true);
      expect(i.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("flags unverified and old items", () => {
    const later = new Date("2027-06-01");
    expect(staleItems(MARKETING_KNOWLEDGE, later).length).toBe(MARKETING_KNOWLEDGE.items.length);
    const now = new Date("2026-11-27");
    expect(staleItems(MARKETING_KNOWLEDGE, now).map((i) => i.id)).toEqual(["gtm-first-customers"]);
    expect(knowledgePrompt(MARKETING_KNOWLEDGE, now)).toContain("قديم أو غير مؤكد");
  });
  it("is part of the marketing prompt", () => {
    expect(MARKETING_ROLE.systemPrompt).toContain("خطوات العمل");
  });
});
