export interface DecayEntry {
  id: string;
  date: string;
  pointsLost: number;
  reason: 'inactivity' | 'penalty' | 'expiration';
  description?: string;
}

export interface CabotCredit {
  current: number;
  max: number;
  resetTime: string; // ISO string
  weeklyReset: boolean;
}

export interface PenaltyData {
  creditsLeft: number;
  lastSubmission: string; // ISO string
  pointsLost: DecayEntry[];
  totalPointsLost: number;
  daysSinceLastSubmission: number;
  shouldShowDecayWarning: boolean;
}

export interface DecayBannerProps {
  lastSubmission: string;
  onViewHistory: () => void;
}

export interface DecayHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  decayHistory: DecayEntry[];
}

export interface CreditWarningToastProps {
  isVisible: boolean;
  onClose: () => void;
  creditsLeft: number;
}

export interface CabotCreditRingProps {
  credits: CabotCredit;
  size?: number;
  strokeWidth?: number;
  showCountdown?: boolean;
}

export interface UsePenaltyDataReturn {
  penaltyData: PenaltyData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCabotReturn {
  credits: CabotCredit | null;
  consumeCredit: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  timeUntilReset: string;
  resetProgress: number; // 0-100
}

export interface CreditUsageData {
  date: string;
  used: number;
  remaining: number;
}
