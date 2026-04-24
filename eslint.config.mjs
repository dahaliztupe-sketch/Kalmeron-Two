import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    extends: [...next],
  },
  {
    // Discourage new `as any` casts in TS source. Existing files that
    // legitimately need it (e.g. `firebase-admin.ts` with `@ts-nocheck`,
    // generated code) are exempted below.
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Pragmatic exemptions. These directories interact with untyped third-party
    // surfaces (Firebase Admin generated types, test mocks) where removing
    // `any` adds no real safety.
    files: [
      "src/lib/firebase-admin.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "test/**/*.ts",
      "e2e/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
