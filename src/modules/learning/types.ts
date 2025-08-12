export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'ai-ml' | 'cloud-devops' | 'data-analytics' | 'fullstack-dev';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  requiredRank: string;
  progress?: number;
  source?: 'fiverr' | 'internshala' | 'internal';
  thumbnail?: string;
  instructor?: string;
  rating?: number;
  enrolledCount?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseCategory {
  id: string;
  label: string;
  color: string;
}

export interface ProofUpload {
  courseId: string;
  file?: File;
  externalLink?: string;
  notes?: string;
  uploadedAt: string;
}

export interface UserRank {
  current: string;
  next: string;
  progress: number;
}

export interface CourseProgress {
  courseId: string;
  progress: number;
  completedAt?: string;
  proofSubmitted?: boolean;
}
