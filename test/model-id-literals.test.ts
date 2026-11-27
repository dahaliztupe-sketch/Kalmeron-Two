import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Guard for the signed-in routes that cannot be live-tested without a user login:
// no source file may hard-code a Gemini model id; ids come from src/lib/model-ids.ts.
const ALLOW = new Set([
  path.join("src", "lib", "model-ids.ts"),
  path.join("src", "lib", "company", "models.ts"),
]);
const SKIP_DIRS = new Set(["node_modules", ".next", "mobile-app", ".git"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

describe("model id literals", () => {
  it("no quoted gemini-* model id outside the id modules", () => {
    const bad: string[] = [];
    for (const f of [...walk("app"), ...walk("src")]) {
      if (ALLOW.has(f)) continue;
      fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
        if (/["'`]gemini-[0-9][a-z0-9.-]*["'`]/i.test(line)) bad.push(`${f}:${i + 1}`);
      });
    }
    expect(bad).toEqual([]);
  });
});
