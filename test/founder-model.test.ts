import { describe, it, expect } from "vitest";
import { founderModel, DEFAULT_GUEST_MODEL, DEFAULT_USER_MODEL } from "@/src/lib/company/models";

describe("founderModel", () => {
  it("uses the defaults when env is empty", () => {
    expect(founderModel(true, {})).toBe(DEFAULT_GUEST_MODEL);
    expect(founderModel(false, {})).toBe(DEFAULT_USER_MODEL);
  });
  it("lets env override each tier", () => {
    expect(founderModel(true, { KALMERON_GUEST_MODEL: "gemini-x-1" })).toBe("gemini-x-1");
    expect(founderModel(false, { KALMERON_USER_MODEL: " gemini-y-2 " })).toBe("gemini-y-2");
  });
  it("ignores malformed env values", () => {
    expect(founderModel(true, { KALMERON_GUEST_MODEL: "bad model; rm" })).toBe(DEFAULT_GUEST_MODEL);
    expect(founderModel(false, { KALMERON_USER_MODEL: "" })).toBe(DEFAULT_USER_MODEL);
  });
  it("defaults are no longer the deprecated 2.5 ids", () => {
    expect(DEFAULT_GUEST_MODEL).not.toMatch(/2\.5/);
    expect(DEFAULT_USER_MODEL).not.toMatch(/2\.5/);
  });
});
