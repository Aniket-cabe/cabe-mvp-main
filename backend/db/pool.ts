import { Pool, PoolConfig } from 'pg';

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Parse DB_POOL_SIZE safely with fallback to 10
const parsePoolSize = (): number => {
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

// Pool configuration
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parsePoolSize(),
  ssl: determineSSLConfig(),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500,
};

// Log the resolved pool configuration at startup
console.log('Database pool configuration:', {
  max: poolConfig.max,
  ssl: poolConfig.ssl
});

// Create and export the pool instance
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
