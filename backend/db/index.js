"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.getPoolStats = exports.withConnection = exports.connectionPool = void 0;
exports.executeWithRetry = executeWithRetry;
exports.executeSQL = executeSQL;
exports.executeSQLString = executeSQLString;
const pool_1 = require("./pool");
Object.defineProperty(exports, "connectionPool", { enumerable: true, get: function () { return pool_1.connectionPool; } });
Object.defineProperty(exports, "withConnection", { enumerable: true, get: function () { return pool_1.withConnection; } });
Object.defineProperty(exports, "getPoolStats", { enumerable: true, get: function () { return pool_1.getPoolStats; } });
const logger_1 = __importDefault(require("../src/utils/logger"));
// Database operation wrapper with retry logic
async function executeWithRetry(operation, maxRetries = 3, baseDelay = 100) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await (0, pool_1.withConnection)(operation);
        }
        catch (error) {
            lastError = error;
            // Check if it's a retryable error
            if (isRetryableError(error)) {
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    logger_1.default.warn(`🔄 Database operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
                    await sleep(delay);
                    continue;
                }
            }
            // Non-retryable error or max retries reached
            throw error;
        }
    }
    throw new Error(`Database operation failed after ${maxRetries} attempts: ${lastError?.message}`);
}
// Check if an error is retryable
function isRetryableError(error) {
    const retryableErrors = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNREFUSED',
        'timeout',
        'network error',
        'connection error',
    ];
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toLowerCase() || '';
    return retryableErrors.some((retryableError) => errorMessage.includes(retryableError) ||
        errorCode.includes(retryableError));
}
// Utility function for sleep
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// SQL string execution wrapper
async function executeSQL(sql, params = [], maxRetries = 3, baseDelay = 100) {
    return executeWithRetry(async (client) => {
        const { data, error } = await client.rpc('execute_sql', { sql, params });
        if (error)
            throw error;
        return data;
    }, maxRetries, baseDelay);
}
// Direct SQL execution wrapper for services that pass SQL strings
async function executeSQLString(sql, params = [], maxRetries = 3, baseDelay = 100) {
    return executeWithRetry(async (client) => {
        const { data, error } = await client.rpc('execute_sql', { sql, params });
        if (error)
            throw error;
        return data;
    }, maxRetries, baseDelay);
}
// Optimized query operations
exports.db = {
    // User operations
    async getUserById(userId) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    async getUserByEmail(email) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    async createUser(email, points = 0) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('users')
                .insert({ email, points })
                .select()
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    async updateUserPoints(userId, points) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('users')
                .update({ points })
                .eq('id', userId)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    // Task operations
    async getTasks(skillArea, limit = 50) {
        return executeWithRetry(async (client) => {
            let query = client
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            if (skillArea) {
                query = query.eq('skill_area', skillArea);
            }
            const { data, error } = await query;
            if (error)
                throw error;
            return data;
        });
    },
    async getTaskById(taskId) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('tasks')
                .select('*')
                .eq('id', taskId)
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    async createTask(title, description, skillArea) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('tasks')
                .insert({ title, description, skill_area: skillArea })
                .select()
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    // Submission operations
    async getSubmissionsByUser(userId, limit = 20) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('submissions')
                .select(`
          *,
          tasks (
            id,
            title,
            skill_area
          )
        `)
                .eq('user_id', userId)
                .order('submitted_at', { ascending: false })
                .limit(limit);
            if (error)
                throw error;
            return data;
        });
    },
    async getSubmissionsByStatus(status, limit = 50) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('submissions')
                .select(`
          *,
          users (
            id,
            email
          ),
          tasks (
            id,
            title,
            skill_area
          )
        `)
                .eq('status', status)
                .order('submitted_at', { ascending: false })
                .limit(limit);
            if (error)
                throw error;
            return data;
        });
    },
    async createSubmission(userId, taskId) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('submissions')
                .insert({
                user_id: userId,
                task_id: taskId,
                status: 'pending',
                score: null,
            })
                .select()
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    async updateSubmission(submissionId, status, score) {
        return executeWithRetry(async (client) => {
            const updateData = { status };
            if (score !== undefined) {
                updateData.score = score;
            }
            const { data, error } = await client
                .from('submissions')
                .update(updateData)
                .eq('id', submissionId)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        });
    },
    // Analytics operations
    async getUserAnalytics(userId) {
        return executeWithRetry(async (client) => {
            // Get user's submission statistics
            const { data: submissions, error: submissionsError } = await client
                .from('submissions')
                .select('status, score, submitted_at, tasks(skill_area)')
                .eq('user_id', userId);
            if (submissionsError)
                throw submissionsError;
            // Get user's points
            const { data: user, error: userError } = await client
                .from('users')
                .select('points')
                .eq('id', userId)
                .single();
            if (userError)
                throw userError;
            return {
                submissions,
                totalPoints: user.points,
                submissionCount: submissions.length,
            };
        });
    },
    async getAdminAnalytics() {
        return executeWithRetry(async (client) => {
            // Get submission statistics
            const { data: submissions, error: submissionsError } = await client
                .from('submissions')
                .select('status, submitted_at, tasks(skill_area)');
            if (submissionsError)
                throw submissionsError;
            // Get user statistics
            const { data: users, error: usersError } = await client
                .from('users')
                .select('points, created_at');
            if (usersError)
                throw usersError;
            return {
                submissions,
                users,
                totalUsers: users.length,
                totalSubmissions: submissions.length,
            };
        });
    },
    // Batch operations for better performance
    async batchUpdateSubmissions(updates) {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('submissions')
                .upsert(updates.map((update) => ({
                id: update.id,
                status: update.status,
                ...(update.score !== undefined && { score: update.score }),
            })))
                .select();
            if (error)
                throw error;
            return data;
        });
    },
    // Health check
    async healthCheck() {
        return executeWithRetry(async (client) => {
            const { data, error } = await client
                .from('users')
                .select('count')
                .limit(1);
            if (error)
                throw error;
            return { status: 'healthy', timestamp: new Date().toISOString() };
        });
    },
};
// Export the optimized database operations
exports.default = exports.db;
//# sourceMappingURL=index.js.map