import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("agent prompts", () => {
  it("every agent prompt.ts appends HONESTY_RULES", () => {
    const root = join(process.cwd(), "src/ai/agents");
    const missing = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(root, d.name, "prompt.ts")))
      .filter((d) => !readFileSync(join(root, d.name, "prompt.ts"), "utf8").includes("HONESTY_RULES"))
      .map((d) => d.name);
    expect(missing).toEqual([]);
  });
});
