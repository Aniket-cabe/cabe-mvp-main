import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectionPool, getPoolStats, withConnection } from '../db/pool';
import { env } from '../src/config/env';

describe('Database Connection Pool', () => {
  beforeAll(async () => {
    // Initialize the pool before running tests
    await connectionPool.initialize();
  });

  afterAll(async () => {
    // Clean up the pool after tests
    await connectionPool.close();
  });

  beforeEach(() => {
    // Reset pool stats between tests
    jest.clearAllMocks();
  });

  describe('Pool Configuration', () => {
    it('should respect DB_POOL_SIZE environment variable', () => {
      const stats = getPoolStats();
      expect(stats.maxConnections).toBe(env.database.poolSize);
      expect(stats.maxConnections).toBeGreaterThan(0);
    });

    it('should initialize with minimum connections', () => {
      const stats = getPoolStats();
      expect(stats.totalConnections).toBeGreaterThanOrEqual(2);
      expect(stats.isInitialized).toBe(true);
    });

    it('should not exceed maximum connections', () => {
      const stats = getPoolStats();
      expect(stats.totalConnections).toBeLessThanOrEqual(stats.maxConnections);
    });
  });

  describe('Connection Management', () => {
    it('should acquire and release connections properly', async () => {
      const initialStats = getPoolStats();

      // Acquire a connection
      const connection = await connectionPool.getConnection();
      expect(connection).toBeDefined();

      const duringStats = getPoolStats();
      expect(duringStats.inUseConnections).toBe(
        initialStats.inUseConnections + 1
      );

      // Release the connection
      connectionPool.releaseConnection(connection);

      const finalStats = getPoolStats();
      expect(finalStats.inUseConnections).toBe(initialStats.inUseConnections);
    });

    it('should handle connection execution wrapper', async () => {
      const result = await withConnection(async (client) => {
        // Test a simple query
        const { data, error } = await client
          .from('users')
          .select('count')
          .limit(1);

        if (error) throw error;
        return data;
      });

      expect(result).toBeDefined();
    });

    it('should automatically release connections after execution', async () => {
      const initialStats = getPoolStats();

      await withConnection(async (client) => {
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 10));
        return true;
      });

      const finalStats = getPoolStats();
      expect(finalStats.inUseConnections).toBe(initialStats.inUseConnections);
    });
  });

  describe('Concurrent Connection Handling', () => {
    it('should handle 50 concurrent connections without errors', async () => {
      const concurrentOperations = 50;
      const promises = Array.from({ length: concurrentOperations }, (_, i) =>
        withConnection(async (client) => {
          // Simulate database operation
          const { data, error } = await client
            .from('users')
            .select('count')
            .limit(1);

          if (error) throw error;

          // Add some delay to simulate real work
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 10)
          );

          return { index: i, data };
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(concurrentOperations);
      results.forEach((result, index) => {
        expect(result.index).toBe(index);
        expect(result.data).toBeDefined();
      });
    }, 30000); // 30 second timeout for concurrent test

    it('should maintain pool integrity under high load', async () => {
      const loadTest = async () => {
        const operations = 100;
        const promises = Array.from({ length: operations }, () =>
          withConnection(async (client) => {
            // Simulate various database operations
            const operations = [
              client.from('users').select('count').limit(1),
              client.from('tasks').select('count').limit(1),
              client.from('submissions').select('count').limit(1),
            ];

            const results = await Promise.all(operations);
            return results.every((result) => !result.error);
          })
        );

        const results = await Promise.all(promises);
        return results.every((result) => result === true);
      };

      const success = await loadTest();
      expect(success).toBe(true);

      const stats = getPoolStats();
      expect(stats.inUseConnections).toBe(0); // All connections should be released
    }, 30000);
  });

  describe('Error Handling and Retry Logic', () => {
    it('should retry on transient errors', async () => {
      let attemptCount = 0;

      const result = await withConnection(async (client) => {
        attemptCount++;

        // Simulate transient error on first attempt
        if (attemptCount === 1) {
          const error = new Error('ECONNRESET');
          (error as any).code = 'ECONNRESET';
          throw error;
        }

        return { success: true, attempt: attemptCount };
      });

      expect(attemptCount).toBeGreaterThan(1);
      expect(result.success).toBe(true);
    });

    it('should handle non-retryable errors immediately', async () => {
      let attemptCount = 0;

      try {
        await withConnection(async (client) => {
          attemptCount++;
          throw new Error('Invalid query syntax');
        });
      } catch (error) {
        expect(attemptCount).toBe(1); // Should not retry
        expect((error as Error).message).toContain('Invalid query syntax');
      }
    });
  });

  describe('Pool Statistics', () => {
    it('should provide accurate pool statistics', () => {
      const stats = getPoolStats();

      expect(stats).toHaveProperty('totalConnections');
      expect(stats).toHaveProperty('inUseConnections');
      expect(stats).toHaveProperty('availableConnections');
      expect(stats).toHaveProperty('maxConnections');
      expect(stats).toHaveProperty('isInitialized');

      expect(stats.totalConnections).toBeGreaterThanOrEqual(0);
      expect(stats.inUseConnections).toBeGreaterThanOrEqual(0);
      expect(stats.availableConnections).toBeGreaterThanOrEqual(0);
      expect(stats.maxConnections).toBeGreaterThan(0);
      expect(typeof stats.isInitialized).toBe('boolean');

      // Validate relationships
      expect(stats.availableConnections).toBe(
        stats.totalConnections - stats.inUseConnections
      );
      expect(stats.totalConnections).toBeLessThanOrEqual(stats.maxConnections);
    });

    it('should track connection usage correctly', async () => {
      const initialStats = getPoolStats();

      // Use multiple connections
      await Promise.all([
        withConnection(async (client) => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return true;
        }),
        withConnection(async (client) => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return true;
        }),
        withConnection(async (client) => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return true;
        }),
      ]);

      const finalStats = getPoolStats();
      expect(finalStats.inUseConnections).toBe(initialStats.inUseConnections);
    });
  });

  describe('Graceful Shutdown', () => {
    it('should close pool gracefully', async () => {
      // Create a new pool instance for this test
      const testPool = new (require('../db/pool').SupabaseConnectionPool)();
      await testPool.initialize();

      const initialStats = testPool.getStats();
      expect(initialStats.isInitialized).toBe(true);

      await testPool.close();

      const finalStats = testPool.getStats();
      expect(finalStats.isInitialized).toBe(false);
      expect(finalStats.totalConnections).toBe(0);
      expect(finalStats.inUseConnections).toBe(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete operations within reasonable time', async () => {
      const startTime = Date.now();

      await withConnection(async (client) => {
        const { data, error } = await client
          .from('users')
          .select('count')
          .limit(1);

        if (error) throw error;
        return data;
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it('should handle rapid sequential operations', async () => {
      const operations = 20;
      const startTime = Date.now();

      for (let i = 0; i < operations; i++) {
        await withConnection(async (client) => {
          const { data, error } = await client
            .from('users')
            .select('count')
            .limit(1);

          if (error) throw error;
          return data;
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 20 operations should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
    });
  });
});
