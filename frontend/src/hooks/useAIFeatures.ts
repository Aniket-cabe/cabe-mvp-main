import { useCallback, useState } from 'react';

export interface Suggestion {
  line: number;
  message: string;
}
export interface SuggestResponse {
  suggestions: Suggestion[];
  language: string;
}

export function useAIFeatures(baseUrl: string = '/api/ai') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const getSuggestions = useCallback(
    async (code: string, language: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/suggest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SuggestResponse = await res.json();
        setSuggestions(data.suggestions || []);
        return data.suggestions || [];
      } catch (e: any) {
        setError(e.message || 'Failed to fetch suggestions');
        return [] as Suggestion[];
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  return { loading, error, suggestions, getSuggestions };
}

export default useAIFeatures;
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface PlagiarismReport {
  similarity: number;
  matchedSources: Array<{
    submissionId: string;
    userId: string;
    username: string;
    similarity: number;
    matchedLines: number[];
  }>;
  highlighted: Array<{
    line: number;
    content: string;
    isMatched: boolean;
  }>;
  confidence: number;
  timestamp: Date;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  skills: string[];
  reason: string;
}

interface CodeSuggestion {
  line: number;
  message: string;
  suggestion: string;
  confidence: number;
}

interface AIFeaturesState {
  plagiarism: {
    loading: boolean;
    report: PlagiarismReport | null;
    error: string | null;
  };
  learningPaths: {
    loading: boolean;
    paths: LearningPath[];
    error: string | null;
  };
  suggestions: {
    loading: boolean;
    suggestions: CodeSuggestion[];
    error: string | null;
  };
}

export const useAIFeatures = () => {
  const [state, setState] = useState<AIFeaturesState>({
    plagiarism: { loading: false, report: null, error: null },
    learningPaths: { loading: false, paths: [], error: null },
    suggestions: { loading: false, suggestions: [], error: null },
  });

  const detectPlagiarism = useCallback(
    async (code: string, language: string) => {
      setState((prev) => ({
        ...prev,
        plagiarism: { ...prev.plagiarism, loading: true, error: null },
      }));

      try {
        const response = await fetch('/api/ai/plagiarism', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
          throw new Error('Plagiarism detection failed');
        }

        const report: PlagiarismReport = await response.json();

        setState((prev) => ({
          ...prev,
          plagiarism: { loading: false, report, error: null },
        }));

        // Show appropriate toast based on similarity
        if (report.similarity > 0.8) {
          toast.error('🚨 High similarity detected! Please review your code.');
        } else if (report.similarity > 0.6) {
          toast.warning(
            '⚠️ Moderate similarity found. Consider making your code more unique.'
          );
        } else {
          toast.success('✅ Great! Your code shows originality.');
        }

        return report;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          plagiarism: { loading: false, report: null, error: errorMessage },
        }));
        toast.error('Failed to detect plagiarism. Please try again.');
        throw error;
      }
    },
    []
  );

  const generateLearningPaths = useCallback(async (userId: string) => {
    setState((prev) => ({
      ...prev,
      learningPaths: { ...prev.learningPaths, loading: true, error: null },
    }));

    try {
      const response = await fetch(`/api/ai/learning-paths?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to generate learning paths');
      }

      const paths: LearningPath[] = await response.json();

      setState((prev) => ({
        ...prev,
        learningPaths: { loading: false, paths, error: null },
      }));

      toast.success(
        `🎯 Generated ${paths.length} personalized learning paths for you!`
      );
      return paths;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        learningPaths: { loading: false, paths: [], error: errorMessage },
      }));
      toast.error('Failed to generate learning paths. Please try again.');
      throw error;
    }
  }, []);

  const getCodeSuggestions = useCallback(
    async (code: string, language: string) => {
      setState((prev) => ({
        ...prev,
        suggestions: { ...prev.suggestions, loading: true, error: null },
      }));

      try {
        const response = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
          throw new Error('Failed to get code suggestions');
        }

        const suggestions: CodeSuggestion[] = await response.json();

        setState((prev) => ({
          ...prev,
          suggestions: { loading: false, suggestions, error: null },
        }));

        if (suggestions.length > 0) {
          toast.success(
            `💡 Found ${suggestions.length} code suggestions for you!`
          );
        } else {
          toast.info('✨ Your code looks great! No suggestions needed.');
        }

        return suggestions;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          suggestions: { loading: false, suggestions: [], error: errorMessage },
        }));
        toast.error('Failed to get code suggestions. Please try again.');
        throw error;
      }
    },
    []
  );

  const clearPlagiarismReport = useCallback(() => {
    setState((prev) => ({
      ...prev,
      plagiarism: { loading: false, report: null, error: null },
    }));
  }, []);

  const clearLearningPaths = useCallback(() => {
    setState((prev) => ({
      ...prev,
      learningPaths: { loading: false, paths: [], error: null },
    }));
  }, []);

  const clearSuggestions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      suggestions: { loading: false, suggestions: [], error: null },
    }));
  }, []);

  const getPlagiarismMessage = useCallback((report: PlagiarismReport) => {
    if (report.similarity > 0.8) {
      return {
        type: 'error' as const,
        title: '🚨 High Similarity Detected',
        message:
          'Your code shows very high similarity to existing submissions. Please review and ensure originality.',
        color: 'text-red-600',
      };
    } else if (report.similarity > 0.6) {
      return {
        type: 'warning' as const,
        title: '⚠️ Moderate Similarity',
        message:
          'Some similarities found. Consider making your code more unique while maintaining functionality.',
        color: 'text-yellow-600',
      };
    } else if (report.similarity > 0.3) {
      return {
        type: 'info' as const,
        title: 'ℹ️ Minor Similarities',
        message:
          'Minor similarities detected, likely due to common patterns. Your code looks good!',
        color: 'text-blue-600',
      };
    } else {
      return {
        type: 'success' as const,
        title: '✅ Original Work',
        message:
          'Great job! Your code shows excellent originality and understanding.',
        color: 'text-green-600',
      };
    }
  }, []);

  return {
    // State
    plagiarism: state.plagiarism,
    learningPaths: state.learningPaths,
    suggestions: state.suggestions,

    // Actions
    detectPlagiarism,
    generateLearningPaths,
    getCodeSuggestions,
    clearPlagiarismReport,
    clearLearningPaths,
    clearSuggestions,
    getPlagiarismMessage,
  };
};
