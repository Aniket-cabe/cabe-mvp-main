import { useState, useEffect, useCallback } from 'react';
import type { PenaltyData, UsePenaltyDataReturn, DecayEntry } from '../types';

// Mock data for development
const MOCK_DECAY_HISTORY: DecayEntry[] = [
  {
    id: 'decay-1',
    date: '2024-01-15T00:00:00Z',
    pointsLost: 25,
    reason: 'inactivity',
    description: 'No activity for 7+ days',
  },
  {
    id: 'decay-2',
    date: '2024-01-08T00:00:00Z',
    pointsLost: 15,
    reason: 'inactivity',
    description: 'No activity for 7+ days',
  },
  {
    id: 'decay-3',
    date: '2024-01-01T00:00:00Z',
    pointsLost: 50,
    reason: 'penalty',
    description: 'Submission rejected for policy violation',
  },
];

const MOCK_PENALTY_DATA: PenaltyData = {
  creditsLeft: 3,
  lastSubmission: '2024-01-10T14:30:00Z',
  pointsLost: MOCK_DECAY_HISTORY,
  totalPointsLost: 90,
  daysSinceLastSubmission: 5,
  shouldShowDecayWarning: false,
};

export function usePenaltyData(): UsePenaltyDataReturn {
  const [penaltyData, setPenaltyData] = useState<PenaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePenaltyData = useCallback((data: any): PenaltyData => {
    const now = new Date();
    const lastSubmission = new Date(data.lastSubmission);
    const daysSinceLastSubmission = Math.floor(
      (now.getTime() - lastSubmission.getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalPointsLost = data.pointsLost.reduce(
      (sum: number, entry: DecayEntry) => sum + entry.pointsLost,
      0
    );

    return {
      ...data,
      daysSinceLastSubmission,
      totalPointsLost,
      shouldShowDecayWarning: daysSinceLastSubmission > 7,
    };
  }, []);

  const fetchPenaltyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock API response
      const response = {
        success: true,
        data: MOCK_PENALTY_DATA,
      };

      if (response.success) {
        const calculatedData = calculatePenaltyData(response.data);
        setPenaltyData(calculatedData);
      } else {
        throw new Error('Failed to fetch penalty data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [calculatePenaltyData]);

  useEffect(() => {
    fetchPenaltyData();
  }, [fetchPenaltyData]);

  const refetch = useCallback(() => {
    fetchPenaltyData();
  }, [fetchPenaltyData]);

  return {
    penaltyData,
    loading,
    error,
    refetch,
  };
}
