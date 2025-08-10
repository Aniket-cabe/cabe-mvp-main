import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  FeedTask,
  FeedResponse,
  FeedFilters,
  UseFeedReturn,
} from '../types';

// Mock data for development and testing
const MOCK_TASKS: FeedTask[] = [
  {
    id: 'task-1',
    title: 'Design a Modern Landing Page',
    description:
      'Create a responsive landing page design for a SaaS product with modern UI/UX principles',
    type: 'arena',
    skill_area: 'design',
    points: 150,
    xp_value: 75,
    difficulty: 'medium',
    duration: 120,
    relevance_score: 92,
    relevance_reason:
      'Perfect match for your design skills! This task will boost your Design XP and help you practice modern UI/UX principles.',
    created_at: '2024-01-15T10:00:00Z',
    is_active: true,
    tags: ['UI/UX', 'Responsive', 'SaaS'],
  },
  {
    id: 'task-2',
    title: 'Build a REST API with Node.js',
    description:
      'Develop a RESTful API using Node.js, Express, and MongoDB for a task management system',
    type: 'arena',
    skill_area: 'backend',
    points: 200,
    xp_value: 100,
    difficulty: 'hard',
    duration: 180,
    relevance_score: 88,
    relevance_reason:
      'Great opportunity to strengthen your backend skills! This will significantly boost your Backend XP.',
    created_at: '2024-01-15T09:30:00Z',
    is_active: true,
    tags: ['Node.js', 'Express', 'MongoDB', 'API'],
  },
  {
    id: 'task-3',
    title: 'Create a React Component Library',
    description:
      'Build a reusable component library with TypeScript and Storybook documentation',
    type: 'challenge',
    skill_area: 'frontend',
    points: 300,
    xp_value: 150,
    difficulty: 'hard',
    duration: 240,
    relevance_score: 85,
    relevance_reason:
      'Excellent for advancing your frontend expertise! This challenge will boost your Frontend XP significantly.',
    created_at: '2024-01-15T08:45:00Z',
    is_active: true,
    tags: ['React', 'TypeScript', 'Storybook', 'Components'],
  },
  {
    id: 'task-4',
    title: 'Write Technical Documentation',
    description:
      'Create comprehensive documentation for a software project including API docs and user guides',
    type: 'course',
    skill_area: 'writing',
    points: 100,
    xp_value: 50,
    difficulty: 'easy',
    duration: 90,
    relevance_score: 78,
    relevance_reason:
      'Good opportunity to practice technical writing! This will help boost your Writing XP.',
    created_at: '2024-01-15T08:00:00Z',
    is_active: true,
    tags: ['Documentation', 'Technical Writing', 'API Docs'],
  },
  {
    id: 'task-5',
    title: 'Implement Machine Learning Model',
    description:
      'Build and train a machine learning model for sentiment analysis using Python and TensorFlow',
    type: 'arena',
    skill_area: 'ai',
    points: 250,
    xp_value: 125,
    difficulty: 'hard',
    duration: 200,
    relevance_score: 95,
    relevance_reason:
      'Perfect match for your AI interests! This task will significantly boost your AI XP and ML skills.',
    created_at: '2024-01-15T07:30:00Z',
    is_active: true,
    tags: ['Machine Learning', 'Python', 'TensorFlow', 'NLP'],
  },
  {
    id: 'task-6',
    title: 'Optimize Database Queries',
    description:
      'Analyze and optimize slow database queries for a high-traffic web application',
    type: 'arena',
    skill_area: 'database',
    points: 180,
    xp_value: 90,
    difficulty: 'medium',
    duration: 150,
    relevance_score: 82,
    relevance_reason:
      'Great for improving your database skills! This will boost your Database XP.',
    created_at: '2024-01-15T07:00:00Z',
    is_active: true,
    tags: ['Database', 'Optimization', 'Performance', 'SQL'],
  },
  {
    id: 'task-7',
    title: 'Design System Architecture',
    description:
      'Create a scalable system architecture for a microservices-based application',
    type: 'challenge',
    skill_area: 'system',
    points: 400,
    xp_value: 200,
    difficulty: 'hard',
    duration: 300,
    relevance_score: 90,
    relevance_reason:
      'Excellent challenge for system design skills! This will significantly boost your System XP.',
    created_at: '2024-01-15T06:30:00Z',
    is_active: true,
    tags: ['System Design', 'Microservices', 'Architecture', 'Scalability'],
  },
  {
    id: 'task-8',
    title: 'Algorithm Implementation',
    description:
      "Implement and optimize classic algorithms like Dijkstra's shortest path and A* search",
    type: 'arena',
    skill_area: 'algorithm',
    points: 220,
    xp_value: 110,
    difficulty: 'medium',
    duration: 160,
    relevance_score: 87,
    relevance_reason:
      'Great for strengthening your algorithmic thinking! This will boost your Algorithm XP.',
    created_at: '2024-01-15T06:00:00Z',
    is_active: true,
    tags: ['Algorithms', 'Graph Theory', 'Optimization', 'Data Structures'],
  },
  {
    id: 'task-9',
    title: 'Mobile App UI Design',
    description:
      'Design a complete mobile app interface with wireframes and high-fidelity mockups',
    type: 'course',
    skill_area: 'design',
    points: 120,
    xp_value: 60,
    difficulty: 'medium',
    duration: 140,
    relevance_score: 89,
    relevance_reason:
      'Perfect for expanding your design portfolio! This will boost your Design XP.',
    created_at: '2024-01-15T05:30:00Z',
    is_active: true,
    tags: ['Mobile Design', 'Wireframes', 'Mockups', 'UI/UX'],
  },
  {
    id: 'task-10',
    title: 'Content Marketing Strategy',
    description:
      'Develop a comprehensive content marketing strategy for a B2B SaaS company',
    type: 'course',
    skill_area: 'writing',
    points: 160,
    xp_value: 80,
    difficulty: 'medium',
    duration: 180,
    relevance_score: 76,
    relevance_reason:
      'Good opportunity to practice strategic writing! This will help boost your Writing XP.',
    created_at: '2024-01-15T05:00:00Z',
    is_active: true,
    tags: ['Content Marketing', 'Strategy', 'B2B', 'SaaS'],
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
              skills: ['design', 'web', 'ai'],
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
