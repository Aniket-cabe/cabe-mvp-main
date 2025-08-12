import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  FeedTask,
  FeedResponse,
  FeedFilters,
  UseFeedReturn,
} from '../types';

// Mock data for development and testing - Updated with new skill areas
const MOCK_TASKS: FeedTask[] = [
  {
    id: 'task-1',
    title: 'Build Machine Learning Model',
    description:
      'Create a predictive model using Python and scikit-learn for data analysis',
    type: 'arena',
    skill_area: 'ai-ml',
    points: 300,
    xp_value: 150,
    difficulty: 'hard',
    duration: 180,
    relevance_score: 95,
    relevance_reason:
      'Perfect match for your AI/ML skills! This task will boost your AI/ML XP and help you practice machine learning.',
    created_at: '2024-01-15T10:00:00Z',
    is_active: true,
    tags: ['Machine Learning', 'Python', 'scikit-learn', 'Data Science'],
  },
  {
    id: 'task-2',
    title: 'Deploy Application to Cloud',
    description:
      'Set up CI/CD pipeline and deploy a web application to AWS/Azure/GCP',
    type: 'arena',
    skill_area: 'cloud-devops',
    points: 250,
    xp_value: 125,
    difficulty: 'hard',
    duration: 150,
    relevance_score: 88,
    relevance_reason:
      'Great opportunity to strengthen your cloud and DevOps skills! This will significantly boost your Cloud & DevOps XP.',
    created_at: '2024-01-15T09:30:00Z',
    is_active: true,
    tags: ['AWS', 'CI/CD', 'Docker', 'Kubernetes'],
  },
  {
    id: 'task-3',
    title: 'Create Data Analysis Dashboard',
    description:
      'Build interactive dashboards with data visualization using modern tools',
    type: 'challenge',
    skill_area: 'data-analytics',
    points: 200,
    xp_value: 100,
    difficulty: 'medium',
    duration: 120,
    relevance_score: 85,
    relevance_reason:
      'Excellent for advancing your data analytics expertise! This challenge will boost your Data Science & Analytics XP significantly.',
    created_at: '2024-01-15T08:45:00Z',
    is_active: true,
    tags: ['Data Visualization', 'Tableau', 'Power BI', 'Analytics'],
  },
  {
    id: 'task-4',
    title: 'Build Full-Stack Application',
    description:
      'Create a complete web application with React frontend and Node.js backend',
    type: 'course',
    skill_area: 'fullstack-dev',
    points: 400,
    xp_value: 200,
    difficulty: 'hard',
    duration: 240,
    relevance_score: 92,
    relevance_reason:
      'Great opportunity to practice full-stack development! This will help boost your Full-Stack Software Development XP.',
    created_at: '2024-01-15T08:00:00Z',
    is_active: true,
    tags: ['React', 'Node.js', 'Full-Stack', 'Software Development'],
  },
  {
    id: 'task-5',
    title: 'Implement Neural Network',
    description:
      'Build and train a deep learning model for image classification using TensorFlow',
    type: 'arena',
    skill_area: 'ai-ml',
    points: 350,
    xp_value: 175,
    difficulty: 'hard',
    duration: 200,
    relevance_score: 95,
    relevance_reason:
      'Perfect match for your AI interests! This task will significantly boost your AI/ML XP and deep learning skills.',
    created_at: '2024-01-15T07:30:00Z',
    is_active: true,
    tags: ['Deep Learning', 'TensorFlow', 'Neural Networks', 'Computer Vision'],
  },
  {
    id: 'task-6',
    title: 'Set up Kubernetes Cluster',
    description:
      'Deploy and manage a Kubernetes cluster with monitoring and logging',
    type: 'arena',
    skill_area: 'cloud-devops',
    points: 300,
    xp_value: 150,
    difficulty: 'hard',
    duration: 180,
    relevance_score: 90,
    relevance_reason:
      'Excellent for advancing your cloud infrastructure skills! This will boost your Cloud & DevOps XP.',
    created_at: '2024-01-15T07:00:00Z',
    is_active: true,
    tags: ['Kubernetes', 'Containerization', 'Monitoring', 'DevOps'],
  },
  {
    id: 'task-7',
    title: 'Data Pipeline Development',
    description:
      'Build ETL pipeline for processing large datasets with Apache Spark',
    type: 'challenge',
    skill_area: 'data-analytics',
    points: 250,
    xp_value: 125,
    difficulty: 'hard',
    duration: 160,
    relevance_score: 88,
    relevance_reason:
      'Great for strengthening your data engineering skills! This will boost your Data Science & Analytics XP.',
    created_at: '2024-01-15T06:30:00Z',
    is_active: true,
    tags: ['ETL', 'Apache Spark', 'Big Data', 'Data Engineering'],
  },
  {
    id: 'task-8',
    title: 'Microservices Architecture',
    description:
      'Design and implement a microservices-based application with API gateway',
    type: 'arena',
    skill_area: 'fullstack-dev',
    points: 350,
    xp_value: 175,
    difficulty: 'hard',
    duration: 200,
    relevance_score: 90,
    relevance_reason:
      'Perfect for advancing your software architecture skills! This will boost your Full-Stack Software Development XP.',
    created_at: '2024-01-15T06:00:00Z',
    is_active: true,
    tags: ['Microservices', 'API Gateway', 'Architecture', 'Scalability'],
  },
  {
    id: 'task-9',
    title: 'Natural Language Processing',
    description:
      'Build a chatbot using NLP techniques and language models',
    type: 'course',
    skill_area: 'ai-ml',
    points: 200,
    xp_value: 100,
    difficulty: 'medium',
    duration: 120,
    relevance_score: 85,
    relevance_reason:
      'Good opportunity to practice NLP! This will help boost your AI/ML XP.',
    created_at: '2024-01-15T05:30:00Z',
    is_active: true,
    tags: ['NLP', 'Chatbot', 'Language Models', 'AI'],
  },
  {
    id: 'task-10',
    title: 'Infrastructure as Code',
    description:
      'Automate infrastructure deployment using Terraform and Ansible',
    type: 'arena',
    skill_area: 'cloud-devops',
    points: 200,
    xp_value: 100,
    difficulty: 'medium',
    duration: 120,
    relevance_score: 82,
    relevance_reason:
      'Great for learning infrastructure automation! This will boost your Cloud & DevOps XP.',
    created_at: '2024-01-15T05:00:00Z',
    is_active: true,
    tags: ['Terraform', 'Ansible', 'IaC', 'Automation'],
  },
];

interface UseFeedOptions {
  initialFilters?: FeedFilters;
  pageSize?: number;
}

export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const { initialFilters = {}, pageSize = 10 } = options;

  const [tasks, setTasks] = useState<FeedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [filters, setFilters] = useState<FeedFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [discardedTasks, setDiscardedTasks] = useState<Set<string>>(new Set());

  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  // Filter tasks based on current filters
  const filterTasks = useCallback(
    (taskList: FeedTask[]): FeedTask[] => {
      return taskList.filter((task) => {
        // Skip discarded tasks
        if (discardedTasks.has(task.id)) return false;

        // Filter by skills
        if (filters.skills && filters.skills.length > 0) {
          if (!filters.skills.includes(task.skill_area)) return false;
        }

        // Filter by difficulty
        if (filters.difficulty && task.difficulty !== filters.difficulty) {
          return false;
        }

        // Filter by type
        if (filters.type && task.type !== filters.type) {
          return false;
        }

        // Filter by minimum points
        if (filters.min_points && task.points < filters.min_points) {
          return false;
        }

        // Filter by maximum duration
        if (filters.max_duration && task.duration > filters.max_duration) {
          return false;
        }

        return true;
      });
    },
    [filters, discardedTasks]
  );

  // Fetch tasks from API or use mock data
  const fetchTasks = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

        // In a real implementation, this would be an API call:
        // const response = await fetch(`/api/feed?rank=${userRank}&skills=${skills.join(',')}&page=${page}&limit=${pageSize}`);
        // const data: FeedResponse = await response.json();

        // For now, use mock data
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const mockResponse: FeedResponse = {
          success: true,
          data: {
            tasks: MOCK_TASKS.slice(startIndex, endIndex),
            pagination: {
              page,
              limit: pageSize,
              total: MOCK_TASKS.length,
              hasNextPage: endIndex < MOCK_TASKS.length,
            },
            metadata: {
              user_rank: 'bronze',
              skills: ['ai-ml', 'cloud-devops', 'data-analytics'],
              total_recommendations: MOCK_TASKS.length,
              generated_at: new Date().toISOString(),
            },
          },
          timestamp: new Date().toISOString(),
        };

        if (mockResponse.success) {
          const filteredTasks = filterTasks(mockResponse.data.tasks);

          if (append) {
            setTasks((prev) => [...prev, ...filteredTasks]);
          } else {
            setTasks(filteredTasks);
          }

          setHasNextPage(mockResponse.data.pagination.hasNextPage);
          setCurrentPage(page);
        } else {
          throw new Error(mockResponse.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Error fetching feed tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [pageSize, filterTasks]
  );

  // Load more tasks (infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      fetchTasks(currentPage + 1, true);
    }
  }, [loading, hasNextPage, currentPage, fetchTasks]);

  // Discard a task
  const discardTask = useCallback((taskId: string) => {
    setDiscardedTasks((prev) => new Set([...prev, taskId]));
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  // Accept a task (navigate to task page)
  const acceptTask = useCallback((taskId: string) => {
    // In a real implementation, this would navigate to the task page
    console.log('Accepting task:', taskId);
    // window.location.href = `/tasks/${taskId}`;
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    setTasks([]);
    setDiscardedTasks(new Set());
  }, []);

  // Refresh feed
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setTasks([]);
    setDiscardedTasks(new Set());
    fetchTasks(1, false);
  }, [fetchTasks]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, loading, loadMore]);

  // Initial load
  useEffect(() => {
    fetchTasks(1, false);
  }, [fetchTasks]);

  // Refetch when filters change
  useEffect(() => {
    if (currentPage > 1) {
      refresh();
    }
  }, [filters, refresh]);

  return {
    tasks,
    loading,
    error,
    hasNextPage,
    loadMore,
    discardTask,
    refresh,
    filters,
    updateFilters,
  };
}
