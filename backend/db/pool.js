"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// Validate required environment variables - make it optional for Railway
if (!process.env.DATABASE_URL && !process.env.MONGO_URL) {
    console.warn('⚠️ No DATABASE_URL or MONGO_URL found. Database features will be disabled.');
}
// Parse DB_POOL_SIZE safely with fallback to 10
const parsePoolSize = () => {
    const poolSize = process.env.DB_POOL_SIZE;
    if (!poolSize) {
        return 10;
    }
    const parsed = parseInt(poolSize, 10);
    if (isNaN(parsed) || parsed <= 0) {
        console.warn(`Invalid DB_POOL_SIZE "${poolSize}", using default value of 10`);
        return 10;
    }
    return parsed;
};
// Determine SSL configuration
const determineSSLConfig = () => {
    const databaseUrl = process.env.DATABASE_URL || '';
    const forceSSL = process.env.FORCE_DB_SSL === 'true';
    const isReplit = process.env.REPL_ID || process.env.REPL_SLUG;
    // Check if DATABASE_URL contains sslmode=require
    const hasSSLMode = databaseUrl.includes('sslmode=require');
    // Enable SSL if:
    // 1. FORCE_DB_SSL is true, OR
    // 2. DATABASE_URL has sslmode=require, OR
    // 3. Running on Replit
    if (forceSSL || hasSSLMode || isReplit) {
        return { rejectUnauthorized: false };
    }
    return false;
};
// Pool configuration - only create if DATABASE_URL exists
const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    max: parsePoolSize(),
    ssl: determineSSLConfig(),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxUses: 7500,
} : null;
// Log the resolved pool configuration at startup
if (poolConfig) {
    console.log('Database pool configuration:', {
        max: poolConfig.max,
        ssl: poolConfig.ssl
    });
}
else {
    console.log('No PostgreSQL database configured - using MongoDB only');
}
// Create and export the pool instance (only if configured)
const pool = poolConfig ? new pg_1.Pool(poolConfig) : null;
// Handle pool errors (only if pool exists)
if (pool) {
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
}
exports.default = pool;
//# sourceMappingURL=pool.js.map