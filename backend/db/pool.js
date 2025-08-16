"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseConnectionPool = exports.connectionPool = void 0;
exports.withConnection = withConnection;
exports.getPoolStats = getPoolStats;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../src/config/env");
const logger_1 = __importDefault(require("../src/utils/logger"));
// Default pool configuration
const DEFAULT_POOL_CONFIG = {
    maxConnections: env_1.env.database.poolSize,
    minConnections: 2,
    acquireTimeout: 30000, // 30 seconds
    idleTimeout: 60000, // 1 minute
    retryAttempts: 3,
    retryDelay: 100, // Base delay for exponential backoff
};
// Connection pool class
class SupabaseConnectionPool {
    pool = [];
    inUse = new Set();
    config;
    isInitialized = false;
    constructor(config = {}) {
        this.config = { ...DEFAULT_POOL_CONFIG, ...config };
    }
    /**
     * Initialize the connection pool
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        logger_1.default.info(`🔄 Initializing Supabase connection pool with ${this.config.maxConnections} connections`);
        try {
            // Create initial connections
            for (let i = 0; i < this.config.minConnections; i++) {
                const client = this.createClient();
                this.pool.push(client);
            }
            this.isInitialized = true;
            logger_1.default.info(`✅ Connection pool initialized successfully with ${this.pool.length} connections`);
        }
        catch (error) {
            logger_1.default.error('❌ Failed to initialize connection pool:', error);
            throw error;
        }
    }
    /**
     * Create a new Supabase client
     */
    createClient() {
        return (0, supabase_js_1.createClient)(env_1.env.database.supabaseUrl, env_1.env.database.supabaseServiceRoleKey, {
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
        });
    }
    /**
     * Get a connection from the pool with retry logic
     */
    async getConnection() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        let lastError = null;
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
                    logger_1.default.debug(`🔗 Created new connection. Pool size: ${this.pool.length}`);
                    return newConnection;
                }
                // Wait with exponential backoff before retry
                const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                logger_1.default.warn(`⏳ No connections available. Retrying in ${delay}ms (attempt ${attempt}/${this.config.retryAttempts})`);
                await this.sleep(delay);
            }
            catch (error) {
                lastError = error;
                logger_1.default.error(`❌ Connection acquisition attempt ${attempt} failed:`, error);
                if (attempt < this.config.retryAttempts) {
                    const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                    await this.sleep(delay);
                }
            }
        }
        throw new Error(`Failed to acquire database connection after ${this.config.retryAttempts} attempts: ${lastError?.message}`);
    }
    /**
     * Acquire an available connection from the pool
     */
    acquireConnection() {
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
    releaseConnection(connection) {
        if (this.inUse.has(connection)) {
            this.inUse.delete(connection);
            logger_1.default.debug(`🔄 Released connection. Available: ${this.pool.length - this.inUse.size}`);
        }
    }
    /**
     * Execute a database operation with automatic connection management
     */
    async execute(operation) {
        const connection = await this.getConnection();
        try {
            const result = await operation(connection);
            return result;
        }
        catch (error) {
            logger_1.default.error('❌ Database operation failed:', error);
            throw error;
        }
        finally {
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
    async close() {
        logger_1.default.info('🔄 Closing connection pool...');
        this.pool = [];
        this.inUse.clear();
        this.isInitialized = false;
        logger_1.default.info('✅ Connection pool closed');
    }
    /**
     * Utility function for sleep
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.SupabaseConnectionPool = SupabaseConnectionPool;
// Create singleton instance
const connectionPool = new SupabaseConnectionPool();
exports.connectionPool = connectionPool;
// Export a convenience function for executing operations
async function withConnection(operation) {
    return connectionPool.execute(operation);
}
// Export pool stats for monitoring
function getPoolStats() {
    return connectionPool.getStats();
}
// Initialize pool on module load
connectionPool.initialize().catch((error) => {
    logger_1.default.error('❌ Failed to initialize connection pool on startup:', error);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    logger_1.default.info('🔄 Shutting down connection pool...');
    await connectionPool.close();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.default.info('🔄 Shutting down connection pool...');
    await connectionPool.close();
    process.exit(0);
});
exports.default = connectionPool;
//# sourceMappingURL=pool.js.map