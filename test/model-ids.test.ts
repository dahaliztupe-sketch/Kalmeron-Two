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

import { liveModel, DEFAULT_LIVE_MODEL } from "@/src/lib/model-ids";
describe("liveModel", () => {
  it("defaults to the current live id, not the removed 2.5 ids", () => {
    expect(liveModel({})).toBe(DEFAULT_LIVE_MODEL);
    expect(DEFAULT_LIVE_MODEL).not.toMatch(/2\.5/);
  });
  it("env override and malformed value", () => {
    expect(liveModel({ KALMERON_MODEL_LIVE: "gemini-z-live" })).toBe("gemini-z-live");
    expect(liveModel({ KALMERON_MODEL_LIVE: "bad;id" })).toBe(DEFAULT_LIVE_MODEL);
  });
});
