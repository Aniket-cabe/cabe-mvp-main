import { useState, useEffect } from 'react';
import type { Course } from '../types';

// Mock course data for fallback
const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Machine Learning Fundamentals',
    description:
      'Learn the basics of machine learning, including algorithms, data preprocessing, and model evaluation.',
    category: 'ai-ml',
    difficulty: 'beginner',
    duration: '4-6 hours',
    requiredRank: 'Bronze',
    instructor: 'Sarah Chen',
    rating: 4.8,
    enrolledCount: 1247,
    tags: ['ai-ml', 'python', 'algorithms', 'data-preprocessing'],
    source: 'internal',
  },
  {
    id: 'course-2',
    title: 'Cloud Infrastructure Mastery',
    description:
      'Master cloud infrastructure with AWS, Azure, and GCP, including containerization and CI/CD pipelines.',
    category: 'cloud-devops',
    difficulty: 'intermediate',
    duration: '8-12 hours',
    requiredRank: 'Silver',
    instructor: 'Mike Johnson',
    rating: 4.9,
    enrolledCount: 2156,
    tags: ['cloud-devops', 'aws', 'docker', 'kubernetes'],
    source: 'fiverr',
  },
  {
    id: 'course-3',
    title: 'Data Science & Analytics',
    description:
      'Introduction to data science concepts, statistical analysis, and practical applications using Python.',
    category: 'data-analytics',
    difficulty: 'intermediate',
    duration: '10-15 hours',
    requiredRank: 'Gold',
    instructor: 'Dr. Emily Zhang',
    rating: 4.7,
    enrolledCount: 892,
    tags: ['data-analytics', 'python', 'statistics', 'visualization'],
    source: 'internal',
  },
  {
    id: 'course-4',
    title: 'Full-Stack Development',
    description:
      'Learn to build complete web applications with frontend and backend technologies for modern development.',
    category: 'fullstack-dev',
    difficulty: 'beginner',
    duration: '3-5 hours',
    requiredRank: 'Bronze',
    instructor: 'Lisa Rodriguez',
    rating: 4.6,
    enrolledCount: 1567,
    tags: ['fullstack-dev', 'react', 'nodejs', 'database'],
    source: 'internshala',
  },
  {
    id: 'course-5',
    title: 'Advanced DevOps Practices',
    description:
      'Master advanced DevOps techniques, infrastructure automation, and modern deployment methods including CI/CD.',
    category: 'cloud-devops',
    difficulty: 'advanced',
    duration: '6-8 hours',
    requiredRank: 'Silver',
    instructor: 'Alex Thompson',
    rating: 4.8,
    enrolledCount: 1342,
    tags: ['cloud-devops', 'terraform', 'jenkins', 'monitoring'],
    source: 'internal',
  },
  {
    id: 'course-6',
    title: 'Advanced Machine Learning',
    description:
      'Comprehensive guide to deep learning, neural networks, and advanced ML techniques using Python libraries.',
    category: 'ai-ml',
    difficulty: 'advanced',
    duration: '12-16 hours',
    requiredRank: 'Gold',
    instructor: 'Dr. Robert Kim',
    rating: 4.9,
    enrolledCount: 678,
    tags: ['ai-ml', 'python', 'tensorflow', 'pytorch'],
    source: 'fiverr',
  },
  {
    id: 'course-7',
    title: 'Data Visualization & Analytics',
    description:
      'Create compelling data visualizations and analytics dashboards using modern tools and techniques.',
    category: 'data-analytics',
    difficulty: 'intermediate',
    duration: '5-7 hours',
    requiredRank: 'Silver',
    instructor: 'Maria Garcia',
    rating: 4.7,
    enrolledCount: 945,
    tags: ['data-analytics', 'visualization', 'tableau', 'powerbi'],
    source: 'internal',
  },
  {
    id: 'course-8',
    title: 'Microservices Architecture',
    description:
      'Learn to build scalable microservices applications with API design and distributed systems.',
    category: 'fullstack-dev',
    difficulty: 'intermediate',
    duration: '4-6 hours',
    requiredRank: 'Silver',
    instructor: 'David Wilson',
    rating: 4.5,
    enrolledCount: 723,
    tags: ['fullstack-dev', 'microservices', 'api', 'architecture'],
    source: 'internshala',
  },
  {
    id: 'course-9',
    title: 'Advanced Cloud Architecture',
    description:
      'Build scalable cloud applications using AWS, Azure, and GCP with serverless and containerization.',
    category: 'cloud-devops',
    difficulty: 'advanced',
    duration: '10-14 hours',
    requiredRank: 'Gold',
    instructor: 'Chris Lee',
    rating: 4.8,
    enrolledCount: 1123,
    tags: ['cloud-devops', 'aws', 'serverless', 'containers'],
    source: 'internal',
  },
  {
    id: 'course-10',
    title: 'Advanced Neural Networks',
    description:
      'Advanced course on neural networks, deep learning architectures, and practical applications using TensorFlow.',
    category: 'ai-ml',
    difficulty: 'expert',
    duration: '15-20 hours',
    requiredRank: 'Platinum',
    instructor: 'Dr. Anna Patel',
    rating: 4.9,
    enrolledCount: 445,
    tags: ['ai-ml', 'tensorflow', 'neural-networks', 'deep-learning'],
    source: 'fiverr',
  },
  {
    id: 'course-11',
    title: 'Big Data Analytics',
    description:
      'Analyze large-scale datasets using distributed computing and advanced analytics techniques.',
    category: 'data-analytics',
    difficulty: 'intermediate',
    duration: '6-8 hours',
    requiredRank: 'Silver',
    instructor: 'James Brown',
    rating: 4.6,
    enrolledCount: 876,
    tags: ['data-analytics', 'big-data', 'spark', 'hadoop'],
    source: 'internal',
  },
  {
    id: 'course-12',
    title: 'Full-Stack Software Development',
    description:
      'Master complete software development from frontend to backend with modern frameworks and databases.',
    category: 'fullstack-dev',
    difficulty: 'advanced',
    duration: '5-7 hours',
    requiredRank: 'Gold',
    instructor: 'Rachel Green',
    rating: 4.7,
    enrolledCount: 654,
    tags: ['fullstack-dev', 'react', 'nodejs', 'database'],
    source: 'internshala',
  },
];

interface UseCoursesReturn {
  courses: Course[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from Supabase first
      if (typeof window !== 'undefined' && (window as any).supabase) {
        const { data, error: supabaseError } = await (window as any).supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data && data.length > 0) {
          setCourses(data);
          return;
        }
      }

      // Fallback to mock data
      console.log('Using mock course data');
      setCourses(MOCK_COURSES);
    } catch (err) {
      console.error('Error fetching courses:', err);

      // Fallback to mock data on error
      console.log('Falling back to mock course data due to error');
      setCourses(MOCK_COURSES);

      // Only set error if we can't provide any data
      if (!MOCK_COURSES.length) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch courses'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCourses();
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch,
  };
}
