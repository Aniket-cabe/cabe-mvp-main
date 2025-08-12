export interface CaBOTMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
}

export interface CaBOTCredit {
  current: number;
  max: number;
  resetTime: Date;
}

export interface CaBOTUsage {
  messagesUsed: number;
  creditsUsed: number;
  lastUsed: Date;
}

export interface CaBOTConfig {
  maxCredits: number;
  resetInterval: number; // in hours
  costPerMessage: number;
}
