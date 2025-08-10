import { useState, useEffect, useCallback } from 'react';
import type { CaBOTStatus, CaBOTUsage, UseCaBOTReturn } from '../types';

// Mock data for development
const MOCK_STATUS: CaBOTStatus = {
  creditsLeft: 7,
  totalCredits: 10,
  nextReset: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  usageHistory: [
    {
      id: '1',
      taskId: 'task-1',
      taskName: 'Design a landing page',
      usedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      creditsUsed: 1,
    },
    {
      id: '2',
      taskId: 'task-2',
      taskName: 'Write blog content',
      usedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      creditsUsed: 1,
    },
    {
      id: '3',
      taskId: 'task-3',
      taskName: 'Code review assistance',
      usedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      creditsUsed: 1,
    },
  ],
};

export function useCaBOT(userId?: string): UseCaBOTReturn {
  const [status, setStatus] = useState<CaBOTStatus>(MOCK_STATUS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would be a real API call
      // const response = await fetch('/api/cabot/status');
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For demo purposes, we'll use mock data
      setStatus(MOCK_STATUS);
    } catch (err) {
      setError('Failed to load CaBOT status');
      console.error('Error fetching CaBOT status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const decrementCredit = useCallback(async () => {
    if (status.creditsLeft <= 0) {
      throw new Error('No credits remaining');
    }

    setIsLoading(true);
    setError(null);

    try {
      // In production, this would be a real API call
      // const response = await fetch('/api/cabot/consume', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId })
      // });
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update local state
      setStatus((prev) => ({
        ...prev,
        creditsLeft: prev.creditsLeft - 1,
        usageHistory: [
          {
            id: Date.now().toString(),
            taskId: `task-${Date.now()}`,
            taskName: 'Current task',
            usedAt: new Date().toISOString(),
            creditsUsed: 1,
          },
          ...prev.usageHistory,
        ],
      }));
    } catch (err) {
      setError('Failed to consume credit');
      console.error('Error consuming credit:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [status.creditsLeft, userId]);

  const getUsageHistory = useCallback(async (): Promise<CaBOTUsage[]> => {
    try {
      // In production, this would be a real API call
      // const response = await fetch('/api/cabot/usage-history');
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      return status.usageHistory;
    } catch (err) {
      console.error('Error fetching usage history:', err);
      return [];
    }
  }, [status.usageHistory]);

  const refetch = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    creditsLeft: status.creditsLeft,
    totalCredits: status.totalCredits,
    nextReset: status.nextReset,
    usageHistory: status.usageHistory,
    isLoading,
    error,
    decrementCredit,
    getUsageHistory,
    refetch,
  };
}
