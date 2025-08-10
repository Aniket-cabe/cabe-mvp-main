import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Opportunity,
  OpportunitiesFilters,
  UseOpportunitiesReturn,
  ProofSubmission,
} from '../types';

// Mock data for development
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'UI/UX Designer for Mobile App',
    description:
      'Create beautiful and intuitive user interfaces for our mobile application. We need someone with strong design skills and experience in mobile-first design.',
    company: 'TechCorp Inc',
    source: 'fiverr',
    type: 'gig',
    category: 'design',
    points: 150,
    locked: false,
    requiredRank: 'Bronze',
    location: 'Remote',
    duration: '2-3 weeks',
    budget: '$500-800',
    requirements: ['Figma', 'Adobe Creative Suite', 'Mobile Design Experience'],
    postedDate: '2024-01-15',
    deadline: '2024-02-15',
  },
  {
    id: '2',
    title: 'Frontend Developer Intern',
    description:
      'Join our team as a frontend developer intern. Work on real projects using React, TypeScript, and modern web technologies.',
    company: 'StartupXYZ',
    source: 'internshala',
    type: 'internship',
    category: 'web',
    points: 200,
    locked: true,
    requiredRank: 'Silver',
    location: 'Mumbai, India',
    duration: '6 months',
    requirements: ['React', 'TypeScript', 'CSS', 'Git'],
    postedDate: '2024-01-10',
  },
  {
    id: '3',
    title: 'AI Content Writer',
    description:
      'Write engaging content about AI and technology. We need someone who can explain complex topics in simple terms.',
    company: 'AI Insights',
    source: 'upwork',
    type: 'gig',
    category: 'writing',
    points: 100,
    locked: false,
    requiredRank: 'Bronze',
    location: 'Remote',
    duration: 'Ongoing',
    budget: '$200-400/month',
    requirements: ['AI Knowledge', 'Content Writing', 'SEO Basics'],
    postedDate: '2024-01-12',
  },
  {
    id: '4',
    title: 'Machine Learning Engineer',
    description:
      'Build and deploy machine learning models for our data analytics platform. Work with Python, TensorFlow, and cloud services.',
    company: 'DataFlow Solutions',
    source: 'linkedin',
    type: 'internship',
    category: 'ai',
    points: 300,
    locked: true,
    requiredRank: 'Gold',
    location: 'Bangalore, India',
    duration: '3 months',
    requirements: ['Python', 'TensorFlow', 'SQL', 'AWS'],
    postedDate: '2024-01-08',
  },
  {
    id: '5',
    title: 'Web Developer for E-commerce',
    description:
      'Develop a modern e-commerce website using Next.js and Stripe. Focus on performance and user experience.',
    company: 'ShopSmart',
    source: 'internal',
    type: 'gig',
    category: 'web',
    points: 250,
    locked: false,
    requiredRank: 'Silver',
    location: 'Remote',
    duration: '4-6 weeks',
    budget: '$1000-1500',
    requirements: ['Next.js', 'Stripe', 'TailwindCSS', 'TypeScript'],
    postedDate: '2024-01-14',
  },
  {
    id: '6',
    title: 'Graphic Designer for Brand Identity',
    description:
      'Create a complete brand identity including logo, color palette, and design guidelines for our startup.',
    company: 'InnovateLab',
    source: 'fiverr',
    type: 'gig',
    category: 'design',
    points: 180,
    locked: false,
    requiredRank: 'Bronze',
    location: 'Remote',
    duration: '1-2 weeks',
    budget: '$300-500',
    requirements: ['Adobe Illustrator', 'Brand Design', 'Logo Design'],
    postedDate: '2024-01-13',
  },
];

export function useOpportunities(): UseOpportunitiesReturn {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<OpportunitiesFilters>({
    type: 'gig',
    category: 'all',
    source: 'all',
  });

  // Fetch opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In real app, this would be: const response = await fetch('/api/opps?type=gig&rank=bronze');
        setOpportunities(mockOpportunities);
        setError(null);
      } catch (err) {
        setError('Failed to load opportunities');
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Filter opportunities based on current filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Filter by type
      if (filters.type !== opp.type) return false;

      // Filter by category
      if (filters.category !== 'all' && opp.category !== filters.category)
        return false;

      // Filter by source
      if (filters.source !== 'all' && opp.source !== filters.source)
        return false;

      return true;
    });
  }, [opportunities, filters]);

  // Update filters
  const setFilters = useCallback(
    (newFilters: Partial<OpportunitiesFilters>) => {
      setFiltersState((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Apply to opportunity
  const applyToOpportunity = useCallback(
    async (
      opportunityId: string,
      proof: Omit<ProofSubmission, 'opportunityId' | 'submittedAt' | 'status'>
    ) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In real app, this would be:
        // const response = await fetch('/api/opps/apply', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ opportunityId, ...proof })
        // });

        console.log('Application submitted:', { opportunityId, ...proof });

        // You could update local state here if needed
        // For example, mark the opportunity as applied
      } catch (err) {
        console.error('Error applying to opportunity:', err);
        throw new Error('Failed to submit application');
      }
    },
    []
  );

  return {
    opportunities,
    filters,
    loading,
    error,
    setFilters,
    applyToOpportunity,
    filteredOpportunities,
  };
}
