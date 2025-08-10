import { useState, useEffect } from 'react';
import type { Course } from '../types';

// Mock course data for fallback
const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'UI/UX Design Fundamentals',
    description:
      'Learn the basics of user interface and user experience design, including wireframing, prototyping, and user research.',
    category: 'design',
    difficulty: 'beginner',
    duration: '4-6 hours',
    requiredRank: 'Bronze',
    instructor: 'Sarah Chen',
    rating: 4.8,
    enrolledCount: 1247,
    tags: ['design', 'ui', 'ux', 'wireframing'],
    source: 'internal',
  },
  {
    id: 'course-2',
    title: 'React.js Mastery',
    description:
      'Master React.js development with hooks, context, and advanced patterns for building scalable applications.',
    category: 'web',
    difficulty: 'intermediate',
    duration: '8-12 hours',
    requiredRank: 'Silver',
    instructor: 'Mike Johnson',
    rating: 4.9,
    enrolledCount: 2156,
    tags: ['react', 'javascript', 'frontend', 'hooks'],
    source: 'fiverr',
  },
  {
    id: 'course-3',
    title: 'Machine Learning Basics',
    description:
      'Introduction to machine learning concepts, algorithms, and practical applications using Python.',
    category: 'ai',
    difficulty: 'intermediate',
    duration: '10-15 hours',
    requiredRank: 'Gold',
    instructor: 'Dr. Emily Zhang',
    rating: 4.7,
    enrolledCount: 892,
    tags: ['ai', 'ml', 'python', 'algorithms'],
    source: 'internal',
  },
  {
    id: 'course-4',
    title: 'Content Writing for Digital Marketing',
    description:
      'Learn to write compelling content for websites, blogs, and social media that drives engagement and conversions.',
    category: 'writing',
    difficulty: 'beginner',
    duration: '3-5 hours',
    requiredRank: 'Bronze',
    instructor: 'Lisa Rodriguez',
    rating: 4.6,
    enrolledCount: 1567,
    tags: ['writing', 'content', 'marketing', 'seo'],
    source: 'internshala',
  },
  {
    id: 'course-5',
    title: 'Advanced CSS and SASS',
    description:
      'Master advanced CSS techniques, SASS preprocessing, and modern layout methods including Grid and Flexbox.',
    category: 'web',
    difficulty: 'advanced',
    duration: '6-8 hours',
    requiredRank: 'Silver',
    instructor: 'Alex Thompson',
    rating: 4.8,
    enrolledCount: 1342,
    tags: ['css', 'sass', 'frontend', 'layout'],
    source: 'internal',
  },
  {
    id: 'course-6',
    title: 'Data Science with Python',
    description:
      'Comprehensive guide to data analysis, visualization, and statistical modeling using Python libraries.',
    category: 'ai',
    difficulty: 'advanced',
    duration: '12-16 hours',
    requiredRank: 'Gold',
    instructor: 'Dr. Robert Kim',
    rating: 4.9,
    enrolledCount: 678,
    tags: ['data-science', 'python', 'pandas', 'numpy'],
    source: 'fiverr',
  },
  {
    id: 'course-7',
    title: 'Brand Identity Design',
    description:
      'Create compelling brand identities including logos, color palettes, typography, and brand guidelines.',
    category: 'design',
    difficulty: 'intermediate',
    duration: '5-7 hours',
    requiredRank: 'Silver',
    instructor: 'Maria Garcia',
    rating: 4.7,
    enrolledCount: 945,
    tags: ['design', 'branding', 'logo', 'identity'],
    source: 'internal',
  },
  {
    id: 'course-8',
    title: 'Technical Writing for Developers',
    description:
      'Learn to write clear, concise technical documentation, API docs, and user guides for software products.',
    category: 'writing',
    difficulty: 'intermediate',
    duration: '4-6 hours',
    requiredRank: 'Silver',
    instructor: 'David Wilson',
    rating: 4.5,
    enrolledCount: 723,
    tags: ['writing', 'technical', 'documentation', 'api'],
    source: 'internshala',
  },
  {
    id: 'course-9',
    title: 'Node.js Backend Development',
    description:
      'Build scalable backend applications using Node.js, Express, and MongoDB with authentication and APIs.',
    category: 'web',
    difficulty: 'advanced',
    duration: '10-14 hours',
    requiredRank: 'Gold',
    instructor: 'Chris Lee',
    rating: 4.8,
    enrolledCount: 1123,
    tags: ['nodejs', 'backend', 'express', 'mongodb'],
    source: 'internal',
  },
  {
    id: 'course-10',
    title: 'Deep Learning with TensorFlow',
    description:
      'Advanced course on neural networks, deep learning architectures, and practical applications using TensorFlow.',
    category: 'ai',
    difficulty: 'expert',
    duration: '15-20 hours',
    requiredRank: 'Platinum',
    instructor: 'Dr. Anna Patel',
    rating: 4.9,
    enrolledCount: 445,
    tags: ['deep-learning', 'tensorflow', 'neural-networks', 'ai'],
    source: 'fiverr',
  },
  {
    id: 'course-11',
    title: 'Mobile App Design',
    description:
      'Design beautiful and functional mobile applications for iOS and Android platforms.',
    category: 'design',
    difficulty: 'intermediate',
    duration: '6-8 hours',
    requiredRank: 'Silver',
    instructor: 'James Brown',
    rating: 4.6,
    enrolledCount: 876,
    tags: ['design', 'mobile', 'ios', 'android'],
    source: 'internal',
  },
  {
    id: 'course-12',
    title: 'Copywriting for Conversions',
    description:
      'Master persuasive copywriting techniques to increase conversions and drive sales.',
    category: 'writing',
    difficulty: 'advanced',
    duration: '5-7 hours',
    requiredRank: 'Gold',
    instructor: 'Rachel Green',
    rating: 4.7,
    enrolledCount: 654,
    tags: ['writing', 'copywriting', 'conversions', 'sales'],
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
