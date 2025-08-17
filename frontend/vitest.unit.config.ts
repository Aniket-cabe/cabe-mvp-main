import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/unit.setup.ts'],
    include: [
      'src/**/*.unit.test.ts',
      'src/**/*.unit.test.tsx',
      'src/**/*.unit.spec.ts',
      'src/**/*.unit.spec.tsx',
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.test.tsx',
      'tests/unit/**/*.spec.ts',
      'tests/unit/**/*.spec.tsx'
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
        '**/index.ts',
        '**/main.tsx'
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
