import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-utils/setup.ts'],
    globals: true,
    include: ['{lib,components,hooks}/**/*.test.{ts,tsx}'],
  },
});
