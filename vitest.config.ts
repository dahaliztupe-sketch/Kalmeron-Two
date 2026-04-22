import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*.dom.test.{ts,tsx}', 'jsdom'],
    ],
    globals: true,
    exclude: ['node_modules', 'dist', '.next', 'e2e/**', 'test/e2e/**', '**/*.spec.ts'],
  },
});
