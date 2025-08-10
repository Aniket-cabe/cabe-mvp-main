import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';
import logger from '../src/utils/logger';

// Database connection pool configuration
interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Default pool configuration
const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxConnections: env.database.poolSize,
  minConnections: 2,
  acquireTimeout: 30000, // 30 seconds
  idleTimeout: 60000, // 1 minute
  retryAttempts: 3,
  retryDelay: 100, // Base delay for exponential backoff
};

// Connection pool class
class SupabaseConnectionPool {
  private pool: SupabaseClient[] = [];
  private inUse: Set<SupabaseClient> = new Set();
  private config: PoolConfig;
  private isInitialized = false;

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
  }

  /**
   * Initialize the connection pool
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    logger.info(
      `🔄 Initializing Supabase connection pool with ${this.config.maxConnections} connections`
    );

    try {
      // Create initial connections
      for (let i = 0; i < this.config.minConnections; i++) {
        const client = this.createClient();
        this.pool.push(client);
      }

      this.isInitialized = true;
      logger.info(
        `✅ Connection pool initialized successfully with ${this.pool.length} connections`
      );
    } catch (error) {
      logger.error('❌ Failed to initialize connection pool:', error);
      throw error;
    }
  }

  /**
   * Create a new Supabase client
   */
  private createClient(): SupabaseClient {
    return createClient(
      env.database.supabaseUrl,
      env.database.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'X-Client-Info': 'cabe-arena-pool',
          },
        },
      }
    );
  }

  /**
   * Get a connection from the pool with retry logic
   */
  async getConnection(): Promise<SupabaseClient> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Try to get an available connection
        const connection = this.acquireConnection();
        if (connection) {
          return connection;
        }

        // If no connections available, create a new one if under max
        if (this.pool.length < this.config.maxConnections) {
          const newConnection = this.createClient();
          this.pool.push(newConnection);
          this.inUse.add(newConnection);
          logger.debug(
            `🔗 Created new connection. Pool size: ${this.pool.length}`
          );
          return newConnection;
        }

        // Wait with exponential backoff before retry
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        logger.warn(
          `⏳ No connections available. Retrying in ${delay}ms (attempt ${attempt}/${this.config.retryAttempts})`
        );
        await this.sleep(delay);
      } catch (error) {
        lastError = error as Error;
        logger.error(
          `❌ Connection acquisition attempt ${attempt} failed:`,
          error
        );

        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed to acquire database connection after ${this.config.retryAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Acquire an available connection from the pool
   */
  private acquireConnection(): SupabaseClient | null {
    for (const connection of this.pool) {
      if (!this.inUse.has(connection)) {
        this.inUse.add(connection);
        return connection;
      }
    }
    return null;
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(connection: SupabaseClient): void {
    if (this.inUse.has(connection)) {
      this.inUse.delete(connection);
      logger.debug(
        `🔄 Released connection. Available: ${this.pool.length - this.inUse.size}`
      );
    }
  }

  /**
   * Execute a database operation with automatic connection management
   */
  async execute<T>(
    operation: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();

    try {
      const result = await operation(connection);
      return result;
    } catch (error) {
      logger.error('❌ Database operation failed:', error);
      throw error;
    } finally {
      this.releaseConnection(connection);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      totalConnections: this.pool.length,
      inUseConnections: this.inUse.size,
      availableConnections: this.pool.length - this.inUse.size,
      maxConnections: this.config.maxConnections,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    logger.info('🔄 Closing connection pool...');

    this.pool = [];
    this.inUse.clear();
    this.isInitialized = false;

    logger.info('✅ Connection pool closed');
  }

  /**
   * Utility function for sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const connectionPool = new SupabaseConnectionPool();

// Export the pool instance and utility functions
export { connectionPool, SupabaseConnectionPool };

// Export a convenience function for executing operations
export async function withConnection<T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  return connectionPool.execute(operation);
}

// Export pool stats for monitoring
export function getPoolStats() {
  return connectionPool.getStats();
}

// Initialize pool on module load
connectionPool.initialize().catch((error) => {
  logger.error('❌ Failed to initialize connection pool on startup:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🔄 Shutting down connection pool...');
  await connectionPool.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🔄 Shutting down connection pool...');
  await connectionPool.close();
  process.exit(0);
});

export default connectionPool;
