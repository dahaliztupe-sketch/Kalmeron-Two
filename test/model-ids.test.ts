import { describe, it, expect } from "vitest";
import { geminiModel, DEFAULT_MODEL_IDS } from "@/src/lib/model-ids";

describe("geminiModel", () => {
  it("returns defaults and none is a deprecated 2.5 id", () => {
    for (const t of ["lite", "flash", "pro"] as const) {
      expect(geminiModel(t, {})).toBe(DEFAULT_MODEL_IDS[t]);
      expect(DEFAULT_MODEL_IDS[t]).not.toMatch(/2\.5/);
    }
  });
  it("overrides per tier and ignores malformed values", () => {
    expect(geminiModel("pro", { KALMERON_MODEL_PRO: " gemini-x-9 " })).toBe("gemini-x-9");
    expect(geminiModel("flash", { KALMERON_MODEL_FLASH: "bad value;" })).toBe(DEFAULT_MODEL_IDS.flash);
  });
});
