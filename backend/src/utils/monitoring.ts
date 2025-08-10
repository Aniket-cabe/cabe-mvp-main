import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import logger from './logger';

// Create a custom registry
const register = new Registry();

// ============================================================================
// METRICS DEFINITIONS
// ============================================================================

// HTTP request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// API endpoint metrics
export const apiRequestDuration = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'Duration of API requests in seconds',
  labelNames: ['endpoint', 'method', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const apiRequestTotal = new Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['endpoint', 'method', 'status_code'],
  registers: [register],
});

// Database metrics
export const dbQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
  registers: [register],
});

export const dbQueryTotal = new Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
  registers: [register],
});

// AI service metrics
export const aiRequestDuration = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI service requests in seconds',
  labelNames: ['service', 'operation'],
  buckets: [1, 3, 5, 10, 30, 60, 120],
  registers: [register],
});

export const aiRequestTotal = new Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI service requests',
  labelNames: ['service', 'operation', 'status'],
  registers: [register],
});

// Business metrics
export const taskSubmissionTotal = new Counter({
  name: 'task_submissions_total',
  help: 'Total number of task submissions',
  labelNames: ['skill_area', 'difficulty', 'status'],
  registers: [register],
});

export const userRegistrationTotal = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['source'],
  registers: [register],
});

export const activeUsersGauge = new Gauge({
  name: 'active_users_current',
  help: 'Current number of active users',
  labelNames: ['rank'],
  registers: [register],
});

// Error metrics
export const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'endpoint', 'severity'],
  registers: [register],
});

// Performance metrics
export const memoryUsageGauge = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Current memory usage in bytes',
  labelNames: ['type'],
  registers: [register],
});

export const cpuUsageGauge = new Gauge({
  name: 'cpu_usage_percentage',
  help: 'Current CPU usage percentage',
  registers: [register],
});

// ============================================================================
// METRICS COLLECTION FUNCTIONS
// ============================================================================

export function setupMetrics() {
  // Collect default metrics
  // promClient.collectDefaultMetrics({ register });

  // Update memory usage every 30 seconds
  setInterval(() => {
    const memUsage = process.memoryUsage();
    memoryUsageGauge.set({ type: 'rss' }, memUsage.rss);
    memoryUsageGauge.set({ type: 'heapTotal' }, memUsage.heapTotal);
    memoryUsageGauge.set({ type: 'heapUsed' }, memUsage.heapUsed);
    memoryUsageGauge.set({ type: 'external' }, memUsage.external);
  }, 30000);

  // Update CPU usage every 30 seconds
  setInterval(() => {
    const cpuUsage = process.cpuUsage();
    const totalUsage = cpuUsage.user + cpuUsage.system;
    cpuUsageGauge.set(totalUsage / 1000000); // Convert to percentage
  }, 30000);

  logger.info('📊 Metrics collection setup complete');

  return {
    register,
    httpRequestDuration,
    httpRequestTotal,
    apiRequestDuration,
    apiRequestTotal,
    dbQueryDuration,
    dbQueryTotal,
    aiRequestDuration,
    aiRequestTotal,
    taskSubmissionTotal,
    userRegistrationTotal,
    activeUsersGauge,
    errorTotal,
    memoryUsageGauge,
    cpuUsageGauge,
  };
}

// ============================================================================
// METRICS MIDDLEWARE
// ============================================================================

export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Record HTTP metrics
    httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    );
    httpRequestTotal.inc({ method, route, status_code: statusCode });

    // Record API metrics for API routes
    if (req.path.startsWith('/api/')) {
      const endpoint = req.path.replace('/api/', '');
      apiRequestDuration.observe(
        { endpoint, method, status_code: statusCode },
        duration
      );
      apiRequestTotal.inc({ endpoint, method, status_code: statusCode });
    }

    // Record error metrics
    if (statusCode >= 400) {
      const severity = statusCode >= 500 ? 'high' : 'medium';
      errorTotal.inc({
        type: 'http_error',
        endpoint: req.path,
        severity,
      });
    }
  });

  next();
}

// ============================================================================
// DATABASE METRICS HELPERS
// ============================================================================

export function recordDbQuery(
  operation: string,
  table: string,
  duration: number,
  status: 'success' | 'error'
) {
  dbQueryDuration.observe({ operation, table }, duration);
  dbQueryTotal.inc({ operation, table, status });
}

export function recordDbQueryAsync<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  return queryFn()
    .then((result) => {
      const duration = (Date.now() - start) / 1000;
      recordDbQuery(operation, table, duration, 'success');
      return result;
    })
    .catch((error) => {
      const duration = (Date.now() - start) / 1000;
      recordDbQuery(operation, table, duration, 'error');
      throw error;
    });
}

// ============================================================================
// AI SERVICE METRICS HELPERS
// ============================================================================

export function recordAIRequest(
  service: string,
  operation: string,
  duration: number,
  status: 'success' | 'error'
) {
  aiRequestDuration.observe({ service, operation }, duration);
  aiRequestTotal.inc({ service, operation, status });
}

export function recordAIRequestAsync<T>(
  service: string,
  operation: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  return requestFn()
    .then((result) => {
      const duration = (Date.now() - start) / 1000;
      recordAIRequest(service, operation, duration, 'success');
      return result;
    })
    .catch((error) => {
      const duration = (Date.now() - start) / 1000;
      recordAIRequest(service, operation, duration, 'error');
      throw error;
    });
}

// ============================================================================
// BUSINESS METRICS HELPERS
// ============================================================================

export function recordTaskSubmission(
  skillArea: string,
  difficulty: string,
  status: 'success' | 'failed'
) {
  taskSubmissionTotal.inc({ skill_area: skillArea, difficulty, status });
}

export function recordUserRegistration(source: string) {
  userRegistrationTotal.inc({ source });
}

export function updateActiveUsers(rank: string, count: number) {
  activeUsersGauge.set({ rank }, count);
}

export function recordError(
  type: string,
  endpoint: string,
  severity: 'low' | 'medium' | 'high'
) {
  errorTotal.inc({ type, endpoint, severity });
}

// ============================================================================
// HEALTH CHECK METRICS
// ============================================================================

export const healthCheckGauge = new Gauge({
  name: 'health_check_status',
  help: 'Health check status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service'],
  registers: [register],
});

export function updateHealthStatus(service: string, isHealthy: boolean) {
  healthCheckGauge.set({ service }, isHealthy ? 1 : 0);
}

// ============================================================================
// CUSTOM METRICS
// ============================================================================

// Rate limiting metrics
export const rateLimitHits = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint', 'ip'],
  registers: [register],
});

export function recordRateLimitHit(endpoint: string, ip: string) {
  rateLimitHits.inc({ endpoint, ip });
}

// Authentication metrics
export const authAttempts = new Counter({
  name: 'authentication_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'status'],
  registers: [register],
});

export function recordAuthAttempt(
  method: string,
  status: 'success' | 'failed'
) {
  authAttempts.inc({ method, status });
}

// ============================================================================
// METRICS EXPORT
// ============================================================================

export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

export { register };
