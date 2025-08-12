import { RANK_TIERS, calculateRankLevel } from '../middleware/rankMiddleware';

// Define features unlocked at each rank level
export const RANK_FEATURES = {
  Bronze: [
    'Arena Access',
    'Basic Tasks',
    'Submit Solutions',
    'View Basic Leaderboard',
    'Basic Analytics',
    'Basic Credits',
  ],
  Silver: [
    'Arena Access',
    'Basic Tasks',
    'Submit Solutions',
    'View Basic Leaderboard',
    'Basic Analytics',
    'Internships Access',
    'Advanced Leaderboard',
    'Submission History',
    'Skill Area Filtering',
    'Priority Support',
    'Enhanced Credits',
    'Discounts',
  ],
  Gold: [
    'Arena Access',
    'Basic Tasks',
    'Submit Solutions',
    'View Basic Leaderboard',
    'Basic Analytics',
    'Internships Access',
    'Advanced Leaderboard',
    'Submission History',
    'Skill Area Filtering',
    'Priority Support',
    'Freelance Access',
    'Mentorship',
    'Advanced Analytics',
    'Custom Themes',
    'Exclusive Challenges',
    'Advanced Tools',
    'Premium Credits',
    'Priority Discounts',
  ],
  Platinum: [
    'Arena Access',
    'Basic Tasks',
    'Submit Solutions',
    'View Basic Leaderboard',
    'Basic Analytics',
    'Internships Access',
    'Advanced Leaderboard',
    'Submission History',
    'Skill Area Filtering',
    'Priority Support',
    'Freelance Access',
    'Mentorship',
    'Advanced Analytics',
    'Custom Themes',
    'Exclusive Challenges',
    'Advanced Tools',
    'VIP Events',
    'Direct Support',
    'Beta Access',
    'Custom Integrations',
    'Priority Queue',
    'Exclusive Content',
    'Unlimited Credits',
    'Maximum Discounts',
  ],
} as const;

export type RankLevel = keyof typeof RANK_FEATURES;

/**
 * Get all features available for a given rank level
 * @param rank - The rank level to get features for
 * @returns Array of features available at that rank
 */
export const getFeaturesForRank = (rank: RankLevel): readonly string[] => {
  return RANK_FEATURES[rank] || [];
};

/**
 * Get features available for a given points value
 * @param points - User's total points
 * @returns Array of features available at that points level
 */
export const getFeaturesForPoints = (points: number): readonly string[] => {
  const rank = calculateRankLevel(points);
  return getFeaturesForRank(rank);
};

/**
 * Check if a user has access to a specific feature
 * @param userRank - User's rank level
 * @param feature - Feature to check access for
 * @returns True if user has access to the feature
 */
export const hasFeatureAccess = (
  userRank: RankLevel,
  feature: string
): boolean => {
  const userFeatures = getFeaturesForRank(userRank);
  return userFeatures.includes(feature);
};

/**
 * Check if a user has access to a specific feature based on points
 * @param points - User's total points
 * @param feature - Feature to check access for
 * @returns True if user has access to the feature
 */
export const hasFeatureAccessByPoints = (
  points: number,
  feature: string
): boolean => {
  const rank = calculateRankLevel(points);
  return hasFeatureAccess(rank, feature);
};

/**
 * Get features that will be unlocked at the next rank
 * @param currentRank - User's current rank
 * @returns Array of features that will be unlocked at next rank
 */
export const getNextRankFeatures = (
  currentRank: RankLevel
): readonly string[] => {
  const ranks: RankLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentIndex = ranks.indexOf(currentRank);

  if (currentIndex === -1 || currentIndex === ranks.length - 1) {
    return []; // Invalid rank or already at max rank
  }

  const nextRank = ranks[currentIndex + 1];
  const currentFeatures = getFeaturesForRank(currentRank);
  const nextRankFeatures = getFeaturesForRank(nextRank);

  // Return features that are in next rank but not in current rank
  return nextRankFeatures.filter(
    (feature) => !currentFeatures.includes(feature)
  );
};

/**
 * Get features that will be unlocked at the next rank based on points
 * @param points - User's current points
 * @returns Array of features that will be unlocked at next rank
 */
export const getNextRankFeaturesByPoints = (
  points: number
): readonly string[] => {
  const currentRank = calculateRankLevel(points);
  return getNextRankFeatures(currentRank);
};

/**
 * Get all features that are locked for a user at their current rank
 * @param currentRank - User's current rank
 * @returns Array of all features that are locked
 */
export const getLockedFeatures = (
  currentRank: RankLevel
): readonly string[] => {
  const allFeatures = new Set<string>();

  // Collect all features from all ranks
  Object.values(RANK_FEATURES).forEach((features) => {
    features.forEach((feature) => allFeatures.add(feature));
  });

  const currentFeatures = new Set(getFeaturesForRank(currentRank));

  // Return features that are not in current rank
  return Array.from(allFeatures).filter(
    (feature) => !currentFeatures.has(feature)
  );
};

/**
 * Get all features that are locked for a user based on their points
 * @param points - User's current points
 * @returns Array of all features that are locked
 */
export const getLockedFeaturesByPoints = (
  points: number
): readonly string[] => {
  const currentRank = calculateRankLevel(points);
  return getLockedFeatures(currentRank);
};

/**
 * Get comprehensive feature access information for a user
 * @param points - User's current points
 * @returns Complete feature access information
 */
export const getFeatureAccessInfo = (points: number) => {
  const currentRank = calculateRankLevel(points);
  const currentFeatures = getFeaturesForRank(currentRank);
  const nextRankFeatures = getNextRankFeatures(currentRank);
  const lockedFeatures = getLockedFeatures(currentRank);

  // Calculate points to next rank
  const ranks: RankLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentIndex = ranks.indexOf(currentRank);
  const nextRank =
    currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;

  let pointsToNextRank = 0;
  if (nextRank) {
    const nextRankMinPoints =
      RANK_TIERS[nextRank.toUpperCase() as keyof typeof RANK_TIERS].min;
    pointsToNextRank = nextRankMinPoints - points;
  }

  return {
    currentRank,
    currentPoints: points,
    currentFeatures,
    nextRank,
    pointsToNextRank: pointsToNextRank > 0 ? pointsToNextRank : 0,
    nextRankFeatures,
    lockedFeatures,
    totalFeatures: currentFeatures.length,
    totalLockedFeatures: lockedFeatures.length,
    progressToNextRank: nextRank
      ? Math.max(
          0,
          Math.min(
            100,
            ((points -
              RANK_TIERS[currentRank.toUpperCase() as keyof typeof RANK_TIERS]
                .min) /
              (RANK_TIERS[nextRank.toUpperCase() as keyof typeof RANK_TIERS]
                .min -
                RANK_TIERS[currentRank.toUpperCase() as keyof typeof RANK_TIERS]
                  .min)) *
              100
          )
        )
      : 100,
  };
};

/**
 * Validate if a feature exists in the system
 * @param feature - Feature name to validate
 * @returns True if feature exists in any rank
 */
export const isValidFeature = (feature: string): boolean => {
  const allFeatures = new Set<string>();
  Object.values(RANK_FEATURES).forEach((features) => {
    features.forEach((f) => allFeatures.add(f));
  });
  return allFeatures.has(feature);
};

/**
 * Get the minimum rank required to access a specific feature
 * @param feature - Feature name to check
 * @returns Minimum rank required or null if feature doesn't exist
 */
export const getMinimumRankForFeature = (feature: string): RankLevel | null => {
  const ranks: RankLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

  for (const rank of ranks) {
    if (hasFeatureAccess(rank, feature)) {
      return rank;
    }
  }

  return null; // Feature doesn't exist
};

export default {
  RANK_FEATURES,
  getFeaturesForRank,
  getFeaturesForPoints,
  hasFeatureAccess,
  hasFeatureAccessByPoints,
  getNextRankFeatures,
  getNextRankFeaturesByPoints,
  getLockedFeatures,
  getLockedFeaturesByPoints,
  getFeatureAccessInfo,
  isValidFeature,
  getMinimumRankForFeature,
};
