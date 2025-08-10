import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface Suggestion {
  line: number;
  message: string;
}

export interface SuggestResponse {
  suggestions: Suggestion[];
  language: string;
}

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
  tags?: string[];
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
    result: PlagiarismReport | null;
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

export const useAIFeatures = (baseUrl: string = '/api/ai') => {
  const [state, setState] = useState<AIFeaturesState>({
    plagiarism: { loading: false, result: null, error: null },
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
        const response = await fetch(`${baseUrl}/plagiarism`, {
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
          plagiarism: { loading: false, result: report, error: null },
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
          plagiarism: { loading: false, result: null, error: errorMessage },
        }));
        toast.error('Failed to detect plagiarism. Please try again.');
        throw error;
      }
    },
    [baseUrl]
  );

  const generateLearningPaths = useCallback(
    async (code: string, language: string) => {
      setState((prev) => ({
        ...prev,
        learningPaths: { ...prev.learningPaths, loading: true, error: null },
      }));

      try {
        const response = await fetch(`${baseUrl}/learning-paths`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        });

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
    },
    [baseUrl]
  );

  const getCodeSuggestions = useCallback(
    async (code: string, language: string) => {
      setState((prev) => ({
        ...prev,
        suggestions: { ...prev.suggestions, loading: true, error: null },
      }));

      try {
        const response = await fetch(`${baseUrl}/suggest`, {
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
          toast.success('✨ Your code looks great! No suggestions needed.');
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
    [baseUrl]
  );

  const clearPlagiarismReport = useCallback(() => {
    setState((prev) => ({
      ...prev,
      plagiarism: { loading: false, result: null, error: null },
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
      return '🚨 High similarity detected! Your code shows very high similarity to existing submissions.';
    } else if (report.similarity > 0.6) {
      return '⚠️ Moderate similarity found. Consider making your code more unique while maintaining functionality.';
    } else if (report.similarity > 0.3) {
      return 'ℹ️ Minor similarities detected, likely due to common patterns. Your code looks good!';
    } else {
      return '✅ Great job! Your code shows excellent originality and understanding.';
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

export default useAIFeatures;
