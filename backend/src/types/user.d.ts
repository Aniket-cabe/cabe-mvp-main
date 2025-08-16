// User type definition for the CaBE Arena backend
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

// Global declaration to make User available everywhere
declare global {
  interface User {
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
}
