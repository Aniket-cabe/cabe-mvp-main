import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/unit.setup.ts'],
    include: [
      'src/**/*.unit.test.ts',
      'src/**/*.unit.spec.ts',
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.spec.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'tests/integration/**',
      'tests/e2e/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/index.ts'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});
