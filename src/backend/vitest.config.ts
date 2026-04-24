import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    silent: 'passed-only',
    reporters: 'verbose',
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.ts'],

    globalSetup: './src/modules/globalSetup.ts',

    setupFiles: ['./src/modules/setup.ts'],
    coverage: {
      provider: 'v8',
    },
    testTimeout: 30000,
  },
});
