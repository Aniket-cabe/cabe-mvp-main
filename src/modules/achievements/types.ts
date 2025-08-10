export interface Badge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  earned: boolean;
  dateEarned?: string; // ISO date string
  progress?: {
    current: number;
    total: number;
    unit: string; // e.g., "courses", "wins", "tasks"
  };
  category: 'arena' | 'learning' | 'social' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: string; // Human-readable requirement text
}

export interface BadgeItemProps {
  badge: Badge;
  onBadgeClick?: (badge: Badge) => void;
}

export interface BadgeGridProps {
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
  filter?: 'all' | 'earned' | 'locked' | Badge['category'];
}

export interface UseBadgesReturn {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filterBadges: (filter: BadgeGridProps['filter']) => Badge[];
}
