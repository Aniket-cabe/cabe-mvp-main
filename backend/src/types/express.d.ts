import { z } from 'zod';

// Use the global User interface defined in global.d.ts
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      user?: User;
      startTime?: number;
    }
  }
}

export interface ValidatedRequest<T = any> extends Express.Request {
  validatedData: T;
}

export interface AuthenticatedRequest extends Express.Request {
  user: User;
}

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export const UserIdSchema = z.object({
  userId: z.string().uuid(),
});

export const TaskIdSchema = z.object({
  taskId: z.string().uuid(),
});

export const SubmissionSchema = z.object({
  taskId: z.string().uuid(),
  code: z.string().min(1),
  language: z.string().default('javascript'),
  proof: z.string().optional(),
  notes: z.string().optional(),
});

export const FeedbackSchema = z.object({
  submissionId: z.string().uuid(),
  feedback: z.string().min(1),
  score: z.number().min(0).max(100),
  issues: z
    .array(
      z.object({
        type: z.enum([
          'security',
          'performance',
          'style',
          'logic',
          'documentation',
        ]),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        message: z.string(),
        line: z.number().optional(),
      })
    )
    .optional(),
});

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  skillArea: z.enum([
      'ai-ml',
  'cloud-devops',
  'data-analytics',
  'fullstack-dev',
  ]),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  points: z.number().min(1).max(1000),
  duration: z.number().min(5).max(480), // minutes
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  hints: z.array(z.string()).optional(),
  solution: z.string().optional(),
});

export const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  skillArea: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
  userId: z.string().uuid().optional(),
});

export const AuditQuerySchema = z.object({
  submissionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
});

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  skillArea: string;
  difficulty: string;
  points: number;
  duration: number;
  tags: string[];
  requirements: string[];
  hints: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionResponse {
  id: string;
  taskId: string;
  userId: string;
  code: string;
  language: string;
  proof?: string;
  notes?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'completed' | 'failed';
  submittedAt: string;
  completedAt?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  rank: string;
  points: number;
  skills: string[];
  bio?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsResponse {
  user: {
    totalPoints: number;
    tasksCompleted: number;
    currentStreak: number;
    topSkill: string;
    skillBreakdown: Array<{
      skill: string;
      points: number;
      submissions: number;
    }>;
    activityTimeline: Array<{
      date: string;
      submissions: number;
      points: number;
    }>;
  };
  admin: {
    totalUsers: number;
    totalSubmissions: number;
    averageScore: number;
    topPerformers: Array<{
      userId: string;
      name: string;
      points: number;
      submissions: number;
    }>;
    skillDistribution: Array<{
      skill: string;
      submissions: number;
      averageScore: number;
    }>;
  };
}

export interface AuditResponse {
  id: string;
  submissionId: string;
  userId: string;
  taskId: string;
  originalScore: number;
  aiScore: number;
  deviation: number;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  issues: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  status: 'pending' | 'completed' | 'failed';
  reviewerId?: string;
  reviewerNotes?: string;
  createdAt: string;
  completedAt?: string;
}
