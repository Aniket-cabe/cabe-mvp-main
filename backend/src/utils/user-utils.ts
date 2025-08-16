// Utility functions for safe user property access

export interface User {
  id: string;
  email: string;
  name: string;
  rank: string;
  rankLevel: string;
  username: string;
  permissions: string[];
  points: number;
  total_points?: number;
  cabot_credits?: number;
  referral_code?: string;
  is_verified?: boolean;
  avatar_url?: string;
  created_at: string;
  last_activity?: string;
  profile_completed_at?: string;
}

export function getUserProperty(user: any, property: keyof User): any {
  return user?.[property];
}

export function getUserId(user: any): string {
  return getUserProperty(user, 'id') || '';
}

export function getUserEmail(user: any): string {
  return getUserProperty(user, 'email') || '';
}

export function getUserName(user: any): string {
  return getUserProperty(user, 'name') || '';
}

export function getUserRank(user: any): string {
  return getUserProperty(user, 'rank') || '';
}

export function getUserRankLevel(user: any): string {
  return getUserProperty(user, 'rankLevel') || '';
}

export function getUserUsername(user: any): string {
  return getUserProperty(user, 'username') || '';
}

export function getUserPermissions(user: any): string[] {
  return getUserProperty(user, 'permissions') || [];
}

export function getUserPoints(user: any): number {
  return getUserProperty(user, 'points') || 0;
}
