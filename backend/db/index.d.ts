import { SupabaseClient } from '@supabase/supabase-js';
import { connectionPool, withConnection, getPoolStats } from './pool';
export { connectionPool, withConnection, getPoolStats };
export declare function executeWithRetry<T>(operation: (client: SupabaseClient) => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
export declare function executeSQL<T = any>(sql: string, params?: any[], maxRetries?: number, baseDelay?: number): Promise<T>;
export declare function executeSQLString<T = any>(sql: string, params?: any[], maxRetries?: number, baseDelay?: number): Promise<T>;
export declare const db: {
    getUserById(userId: string): Promise<any>;
    getUserByEmail(email: string): Promise<any>;
    createUser(email: string, points?: number): Promise<any>;
    updateUserPoints(userId: string, points: number): Promise<any>;
    getTasks(skillArea?: string, limit?: number): Promise<any[]>;
    getTaskById(taskId: string): Promise<any>;
    createTask(title: string, description: string, skillArea: string): Promise<any>;
    getSubmissionsByUser(userId: string, limit?: number): Promise<any[]>;
    getSubmissionsByStatus(status: string, limit?: number): Promise<any[]>;
    createSubmission(userId: string, taskId: string): Promise<any>;
    updateSubmission(submissionId: string, status: string, score?: number): Promise<any>;
    getUserAnalytics(userId: string): Promise<{
        submissions: {
            status: any;
            score: any;
            submitted_at: any;
            tasks: {
                skill_area: any;
            }[];
        }[];
        totalPoints: any;
        submissionCount: number;
    }>;
    getAdminAnalytics(): Promise<{
        submissions: {
            status: any;
            submitted_at: any;
            tasks: {
                skill_area: any;
            }[];
        }[];
        users: {
            points: any;
            created_at: any;
        }[];
        totalUsers: number;
        totalSubmissions: number;
    }>;
    batchUpdateSubmissions(updates: Array<{
        id: string;
        status: string;
        score?: number;
    }>): Promise<any[]>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
};
export default db;
//# sourceMappingURL=index.d.ts.map