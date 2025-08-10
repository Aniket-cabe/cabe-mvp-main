import { useState, useEffect, useCallback, useRef } from 'react';

export interface CaBOTCreditHistory {
  id: string;
  timestamp: string;
  actionType: string;
  creditsUsed: number;
  remaining: number;
  description?: string;
}

export interface CaBOTCreditBalance {
  balance: number;
  maxCredits: number;
  nextReset: string;
  lastUpdated: string;
}

export interface UseCaBOTCreditsReturn {
  balance: number;
  maxCredits: number;
  loading: boolean;
  error: string | null;
  nextReset: string | null;
  lastUpdated: string | null;
  consume: (amount: number, actionType?: string) => Promise<void>;
  getHistory: (range?: 'week' | 'month') => Promise<CaBOTCreditHistory[]>;
  refreshBalance: () => Promise<void>;
  reset: () => Promise<void>;
  getTimeToReset: () => { days: number; hours: number; minutes: number } | null;
}

// Mock data for development
const MOCK_BALANCE: CaBOTCreditBalance = {
  balance: 3,
  maxCredits: 5,
  nextReset: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  lastUpdated: new Date().toISOString(),
};

const MOCK_HISTORY: CaBOTCreditHistory[] = [
  {
    id: 'h1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actionType: 'task_explanation',
    creditsUsed: 1,
    remaining: 3,
    description: 'AI task explanation for React Component',
  },
  {
    id: 'h2',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    actionType: 'auto_messenger',
    creditsUsed: 1,
    remaining: 4,
    description: 'Auto-messenger preview for achievement notification',
  },
  {
    id: 'h3',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actionType: 'smart_scoring',
    creditsUsed: 1,
    remaining: 5,
    description: 'Smart scoring for proof submission',
  },
  {
    id: 'h4',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    actionType: 'task_explanation',
    creditsUsed: 1,
    remaining: 4,
    description: 'AI task explanation for Web API Integration',
  },
  {
    id: 'h5',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    actionType: 'weekly_reset',
    creditsUsed: 0,
    remaining: 5,
    description: 'Weekly credit reset',
  },
];

/**
 * Custom hook for managing CaBOT credit system
 */
export function useCaBOTCredits(): UseCaBOTCreditsReturn {
  const [balance, setBalance] = useState<number>(MOCK_BALANCE.balance);
  const [maxCredits] = useState<number>(MOCK_BALANCE.maxCredits);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextReset, setNextReset] = useState<string | null>(
    MOCK_BALANCE.nextReset
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    MOCK_BALANCE.lastUpdated
  );
  const [history, setHistory] = useState<CaBOTCreditHistory[]>(MOCK_HISTORY);

  // Ref to track if component is mounted
  const mountedRef = useRef(true);

  /**
   * Fetch current credit balance from API
   */
  const fetchBalance = useCallback(async (): Promise<CaBOTCreditBalance> => {
    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/cabot/balance');
      // const data = await response.json();
      // return data;

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Return mock data
      return {
        balance,
        maxCredits,
        nextReset: nextReset || MOCK_BALANCE.nextReset,
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      throw new Error(
        `Failed to fetch credit balance: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, [balance, maxCredits, nextReset]);

  /**
   * Refresh balance from server
   */
  const refreshBalance = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const balanceData = await fetchBalance();

      if (mountedRef.current) {
        setBalance(balanceData.balance);
        setNextReset(balanceData.nextReset);
        setLastUpdated(balanceData.lastUpdated);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Failed to refresh balance'
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchBalance]);

  /**
   * Consume credits for CaBOT usage
   */
  const consume = useCallback(
    async (amount: number, actionType: string = 'general') => {
      if (!mountedRef.current) return;

      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      if (amount > balance) {
        throw new Error('Insufficient credits');
      }

      setLoading(true);
      setError(null);

      try {
        // In production, replace with actual API call
        // const response = await fetch('/api/cabot/consume', {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ userId: 'current-user', amount, actionType })
        // });
        // const data = await response.json();

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newBalance = balance - amount;

        if (mountedRef.current) {
          setBalance(newBalance);
          setLastUpdated(new Date().toISOString());

          // Add to history
          const newHistoryEntry: CaBOTCreditHistory = {
            id: `h${Date.now()}`,
            timestamp: new Date().toISOString(),
            actionType,
            creditsUsed: amount,
            remaining: newBalance,
            description: `CaBOT usage: ${actionType.replace('_', ' ')}`,
          };

          setHistory((prev) => [newHistoryEntry, ...prev]);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error ? err.message : 'Failed to consume credits'
          );
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [balance]
  );

  /**
   * Get credit usage history
   */
  const getHistory = useCallback(
    async (range: 'week' | 'month' = 'week'): Promise<CaBOTCreditHistory[]> => {
      try {
        // In production, replace with actual API call
        // const response = await fetch(`/api/cabot/history?range=${range}`);
        // const data = await response.json();
        // return data;

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Filter history based on range
        const now = Date.now();
        const rangeMs =
          range === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
        const cutoff = now - rangeMs;

        return history.filter(
          (entry) => new Date(entry.timestamp).getTime() > cutoff
        );
      } catch (err) {
        throw new Error(
          `Failed to fetch credit history: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    },
    [history]
  );

  /**
   * Reset credits (admin function or weekly cron)
   */
  const reset = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/cabot/reset', { method: 'POST' });
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (mountedRef.current) {
        setBalance(maxCredits);
        setNextReset(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        ); // Next week
        setLastUpdated(new Date().toISOString());

        // Add reset entry to history
        const resetEntry: CaBOTCreditHistory = {
          id: `reset-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actionType: 'weekly_reset',
          creditsUsed: 0,
          remaining: maxCredits,
          description: 'Weekly credit reset',
        };

        setHistory((prev) => [resetEntry, ...prev]);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Failed to reset credits'
        );
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [maxCredits]);

  /**
   * Calculate time remaining until next reset
   */
  const getTimeToReset = useCallback(() => {
    if (!nextReset) return null;

    const now = Date.now();
    const resetTime = new Date(nextReset).getTime();
    const diff = resetTime - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    return { days, hours, minutes };
  }, [nextReset]);

  /**
   * Auto-refresh balance on mount and handle automatic resets
   */
  useEffect(() => {
    refreshBalance();

    // Set up periodic balance refresh
    const refreshInterval = setInterval(
      () => {
        if (mountedRef.current) {
          refreshBalance();
        }
      },
      5 * 60 * 1000
    ); // Refresh every 5 minutes

    // Set up reset check
    const resetCheckInterval = setInterval(() => {
      if (!mountedRef.current || !nextReset) return;

      const now = Date.now();
      const resetTime = new Date(nextReset).getTime();

      if (now >= resetTime) {
        reset();
      }
    }, 60 * 1000); // Check every minute

    return () => {
      clearInterval(refreshInterval);
      clearInterval(resetCheckInterval);
    };
  }, [refreshBalance, reset, nextReset]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    balance,
    maxCredits,
    loading,
    error,
    nextReset,
    lastUpdated,
    consume,
    getHistory,
    refreshBalance,
    reset,
    getTimeToReset,
  };
}

/**
 * Hook for quick credit checks without full state management
 */
export function useCaBOTCreditCheck() {
  const { balance, loading } = useCaBOTCredits();

  const canUseCredit = balance > 0 && !loading;
  const isLow = balance <= 1;
  const isCritical = balance === 0;

  return {
    balance,
    canUseCredit,
    isLow,
    isCritical,
    loading,
  };
}
