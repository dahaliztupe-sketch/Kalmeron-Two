import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    exclude: [
      'node_modules',
      'artifacts',
      'dist',
      '.next',
      '.cache/**',
      'e2e/**',
      'test/e2e/**',
      '**/*.spec.ts',
    ],
    /**
     * Coverage thresholds. Run with `npx vitest run --coverage` (requires
     * `@vitest/coverage-v8` to be installed; not in the default install set
     * to keep cold-start fast).
     */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/lib/security/**',
        'src/lib/billing/**',
        'src/lib/memory/compress-context.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/types.ts',
        'src/lib/firebase-admin.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
    },
  },
});
