import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cluster.ts', 'src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  dts: false,           // Important: skip type declarations
  skipNodeModulesBundle: true,
  minify: false,
  splitting: false,
  treeshake: true,
  // Ensure proper file naming for Replit compatibility
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs'
    }
  },
  external: [
    // External dependencies that shouldn't be bundled
    'express',
    'cors',
    'helmet',
    'compression',
    'dotenv',
    'bcryptjs',
    'jsonwebtoken',
    'multer',
    'nodemailer',
    'redis',
    'ioredis',
    'socket.io',
    'swagger-jsdoc',
    'swagger-ui-express',
    'winston',
    'pino',
    'pino-pretty',
    'prom-client',
    'rate-limiter-flexible',
    'express-rate-limit',
    'express-slow-down',
    'express-status-monitor',
    'express-validator',
    'express-winston',
    'express-mongo-sanitize',
    'express-http-proxy',
    'express-async-errors',
    'hpp',
    'xss-clean',
    'node-cron',
    'openai',
    'zod',
    'joi',
    'ajv',
    'airtable',
    '@supabase/supabase-js',
    'pg-native'
  ]
});
