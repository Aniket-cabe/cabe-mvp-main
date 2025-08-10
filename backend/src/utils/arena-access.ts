/**
 * Arena Access Utility Functions
 *
 * Centralized logic for determining Arena access based on user points
 * and other potential restrictions.
 */

/**
 * Check if a user can access the Arena based on their points
 * @param userPoints - User's total points
 * @returns True if user can access Arena, false otherwise
 */
export function canAccessArena(userPoints: number): boolean {
  // Basic access check: user must have valid points (0 or above)
  if (userPoints < 0) {
    return false;
  }

  // Future-proof: Additional conditions can be added here
  // Examples:
  // - Account status checks (banned, suspended, etc.)
  // - Cooldown periods
  // - Age restrictions
  // - Geographic restrictions
  // - Subscription status

  // For now, any user with valid points (Bronze and above) can access Arena
  return true;
}

/**
 * Get a user-friendly explanation for Arena access status
 * @param userPoints - User's total points
 * @returns Human-readable explanation of access status
 */
export function getArenaAccessReason(userPoints: number): string {
  if (userPoints < 0) {
    return 'Restricted: Invalid points';
  }

  // Future-proof: Additional conditions can be added here
  // Examples:
  // if (isAccountBanned(userId)) return "Restricted: Account suspended";
  // if (isInCooldown(userId)) return "Restricted: Temporary cooldown period";
  // if (isUnderAge(userId)) return "Restricted: Age requirement not met";
  // if (isGeographicallyRestricted(userId)) return "Restricted: Not available in your region";
  // if (!hasActiveSubscription(userId)) return "Restricted: Subscription required";

  return 'Access granted to Arena';
}

/**
 * Get detailed Arena access information including status and requirements
 * @param userPoints - User's total points
 * @returns Comprehensive access information object
 */
export function getArenaAccessInfo(userPoints: number) {
  const canAccess = canAccessArena(userPoints);
  const reason = getArenaAccessReason(userPoints);

  return {
    canAccess,
    reason,
    userPoints,
    requirements: {
      minimumPoints: 0,
      currentPoints: userPoints,
      pointsMet: userPoints >= 0,
    },
    // Future-proof: Additional requirement checks can be added here
    restrictions: {
      hasValidPoints: userPoints >= 0,
      // Future fields:
      // isAccountActive: true,
      // isNotBanned: true,
      // isNotInCooldown: true,
      // meetsAgeRequirement: true,
      // isInSupportedRegion: true,
      // hasActiveSubscription: true
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if a user meets the minimum requirements for Arena access
 * @param userPoints - User's total points
 * @returns Object with detailed requirement status
 */
export function checkArenaRequirements(userPoints: number) {
  const requirements = {
    minimumPoints: 0,
    currentPoints: userPoints,
    pointsMet: userPoints >= 0,
    missingRequirements: [] as string[],
    allRequirementsMet: true,
  };

  // Check points requirement
  if (userPoints < 0) {
    requirements.missingRequirements.push('Valid points (0 or above)');
    requirements.allRequirementsMet = false;
  }

  // Future-proof: Additional requirement checks
  // if (!isAccountActive(userId)) {
  //   requirements.missingRequirements.push('Active account');
  //   requirements.allRequirementsMet = false;
  // }

  // if (isAccountBanned(userId)) {
  //   requirements.missingRequirements.push('Account not suspended');
  //   requirements.allRequirementsMet = false;
  // }

  return requirements;
}

export default {
  canAccessArena,
  getArenaAccessReason,
  getArenaAccessInfo,
  checkArenaRequirements,
};
