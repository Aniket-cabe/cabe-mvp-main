import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/security.setup.ts'],
    include: [
      'src/**/*.security.test.ts',
      'src/**/*.security.spec.ts',
      'tests/security/**/*.test.ts',
      'tests/security/**/*.spec.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'tests/unit/**',
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
        '**/*.config.ts'
      ]
    },
    testTimeout: 20000,
    hookTimeout: 20000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});
