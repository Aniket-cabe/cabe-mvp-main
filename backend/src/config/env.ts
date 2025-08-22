import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('5000'),

  // Database
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  DB_POOL_SIZE: z.string().transform(Number).default('10'),

  // AI Services
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENROUTER_API_KEY: z.string().optional(),

  // Airtable
  AIRTABLE_API_KEY: z.string().optional(),
  AIRTABLE_BASE_ID: z.string().optional(),
  AIRTABLE_TABLE_NAME: z.string().optional(),

  // Security
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Redis
  REDIS_URL: z.string()
    .regex(/^redis(s)?:\/\/.+$/, "Invalid Redis URL format. Must be redis:// or rediss://")
    .default("redis://127.0.0.1:6379"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // WebSocket
  WEBSOCKET_PORT: z.string().transform(Number).default('8080'),
  BASE_URL: z.string().url().default('http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // Slack
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  // Feature Flags
  ENABLE_AI_SCORING: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  ENABLE_AUDIT_LOGGING: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  ENABLE_SLACK_NOTIFICATIONS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Cluster
  CLUSTER_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  CLUSTER_WORKERS: z.string().transform(Number).default('4'),
});

// Parse and validate environment
const envParseResult = envSchema.safeParse(process.env);

if (!envParseResult.success) {
  console.error('❌ Environment validation failed:');
  console.error(envParseResult.error.format());
  process.exit(1);
}

export const env = envParseResult.data;

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Add isDevelopment property to env object for backward compatibility
export const envWithHelpers = {
  ...env,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
};

// Feature flags
export const features = {
  aiScoring: env.ENABLE_AI_SCORING,
  auditLogging: env.ENABLE_AUDIT_LOGGING,
  slackNotifications: env.ENABLE_SLACK_NOTIFICATIONS,
} as const;

// Security config
export const security = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
} as const;

// Database config
export const database = {
  supabaseUrl: env.SUPABASE_URL,
  supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAnonKey: env.SUPABASE_ANON_KEY,
  poolSize: env.DB_POOL_SIZE,
} as const;

// AI config
export const ai = {
  openaiApiKey: env.OPENAI_API_KEY,
  openaiModel: env.OPENAI_MODEL,
} as const;

// WebSocket config
export const websocket = {
  port: env.WEBSOCKET_PORT,
} as const;
