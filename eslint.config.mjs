import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: [
      ".next/**",
      ".cache/**",
      ".local/**",
      "node_modules/**",
      "services/data-warehouse/**",
      "services/**/.venv/**",
      "services/**/__pycache__/**",
      "public/sw.js",
      "**/*.generated.{ts,tsx,js,jsx}",
      ".pythonlibs/**",
      "attached_assets/**",
    ],
  },
  {
    extends: [...next],
    // Pin React version so eslint-plugin-react doesn't try its
    // legacy `context.getFilename()` call (removed in ESLint 10),
    // which crashes the entire lint run.
    settings: {
      react: {
        version: "19.2.5",
      },
    },
    rules: {
      // React 19 compiler hints: flag classic
      // `useEffect(() => { fetchData(); }, [])` and similar patterns as
      // warnings rather than errors. They are real anti-patterns (cascading
      // renders) and should be migrated incrementally to TanStack Query /
      // `use()`, but they are not regressions — keep them visible without
      // blocking CI lint.
      "react-hooks/set-state-in-effect": "warn",
    },
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
