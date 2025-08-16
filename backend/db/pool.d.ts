import { SupabaseClient } from '@supabase/supabase-js';
interface PoolConfig {
    maxConnections: number;
    minConnections: number;
    acquireTimeout: number;
    idleTimeout: number;
    retryAttempts: number;
    retryDelay: number;
}
declare class SupabaseConnectionPool {
    private pool;
    private inUse;
    private config;
    private isInitialized;
    constructor(config?: Partial<PoolConfig>);
    /**
     * Initialize the connection pool
     */
    initialize(): Promise<void>;
    /**
     * Create a new Supabase client
     */
    private createClient;
    /**
     * Get a connection from the pool with retry logic
     */
    getConnection(): Promise<SupabaseClient>;
    /**
     * Acquire an available connection from the pool
     */
    private acquireConnection;
    /**
     * Release a connection back to the pool
     */
    releaseConnection(connection: SupabaseClient): void;
    /**
     * Execute a database operation with automatic connection management
     */
    execute<T>(operation: (client: SupabaseClient) => Promise<T>): Promise<T>;
    /**
     * Get pool statistics
     */
    getStats(): {
        totalConnections: number;
        inUseConnections: number;
        availableConnections: number;
        maxConnections: number;
        isInitialized: boolean;
    };
    /**
     * Close all connections in the pool
     */
    close(): Promise<void>;
    /**
     * Utility function for sleep
     */
    private sleep;
}
declare const connectionPool: SupabaseConnectionPool;
export { connectionPool, SupabaseConnectionPool };
export declare function withConnection<T>(operation: (client: SupabaseClient) => Promise<T>): Promise<T>;
export declare function getPoolStats(): {
    totalConnections: number;
    inUseConnections: number;
    availableConnections: number;
    maxConnections: number;
    isInitialized: boolean;
};
export default connectionPool;
//# sourceMappingURL=pool.d.ts.map