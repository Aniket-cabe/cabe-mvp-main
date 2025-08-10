import { useState, useEffect, useCallback } from 'react';
import type { CabotCredit, UseCabotReturn } from '../types';

// Mock data for development
const MOCK_CABOT_CREDITS: CabotCredit = {
  current: 3,
  max: 10,
  resetTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  weeklyReset: true,
};

export function useCabot(): UseCabotReturn {
  const [credits, setCredits] = useState<CabotCredit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Calculate time until reset and progress
  const calculateResetInfo = useCallback((resetTime: string) => {
    const now = new Date();
    const reset = new Date(resetTime);
    const diff = reset.getTime() - now.getTime();

    if (diff <= 0) {
      return { timeUntilReset: 'Reset now', resetProgress: 100 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = '';
    if (days > 0) {
      timeString = `${days}d ${hours}h`;
    } else if (hours > 0) {
      timeString = `${hours}h ${minutes}m`;
    } else {
      timeString = `${minutes}m`;
    }

    // Calculate progress (assuming weekly reset)
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    const progress = Math.max(
      0,
      Math.min(100, ((weekInMs - diff) / weekInMs) * 100)
    );

    return { timeUntilReset: timeString, resetProgress: progress };
  }, []);

  // Initialize credits
  useEffect(() => {
    setCredits(MOCK_CABOT_CREDITS);
  }, []);

  // Update time until reset every minute
  useEffect(() => {
    if (!credits) return;

    const updateTime = () => {
      const { timeUntilReset: newTime } = calculateResetInfo(credits.resetTime);
      setTimeUntilReset(newTime);
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [credits, calculateResetInfo]);

  const consumeCredit = useCallback(async (): Promise<boolean> => {
    if (!credits || credits.current <= 0) {
      setError('No credits available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock API response
      const response = {
        success: true,
        data: {
          current: credits.current - 1,
          max: credits.max,
          resetTime: credits.resetTime,
          weeklyReset: credits.weeklyReset,
        },
      };

      if (response.success) {
        setCredits(response.data);
        return true;
      } else {
        throw new Error('Failed to consume credit');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [credits]);

  const resetProgress = credits
    ? calculateResetInfo(credits.resetTime).resetProgress
    : 0;

  return {
    credits,
    consumeCredit,
    loading,
    error,
    timeUntilReset,
    resetProgress,
  };
}
