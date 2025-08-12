export type OpportunityType = 'gig' | 'internship';
export type OpportunityCategory = 'cloud-devops' | 'fullstack-dev' | 'ai-ml' | 'data-analytics';
export type OpportunitySource =
  | 'fiverr'
  | 'internshala'
  | 'upwork'
  | 'linkedin'
  | 'internal';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  company: string;
  source: OpportunitySource;
  type: OpportunityType;
  category: OpportunityCategory;
  points: number;
  locked: boolean;
  requiredRank: string;
  location: string;
  duration: string;
  budget?: string;
  requirements: string[];
  postedDate: string;
  deadline?: string;
}

export interface ProofSubmission {
  opportunityId: string;
  cvLink?: string;
  portfolio?: string;
  coverLetter?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface OpportunitiesFilters {
  type: OpportunityType;
  category: OpportunityCategory | 'all';
  source: OpportunitySource | 'all';
}

export interface OpportunitiesState {
  opportunities: Opportunity[];
  filters: OpportunitiesFilters;
  loading: boolean;
  error: string | null;
  selectedOpportunity: Opportunity | null;
  showProofDrawer: boolean;
}

export interface OppCardProps {
  opportunity: Opportunity;
  userRank: string;
  userEmail: string;
  onApply: (opportunity: Opportunity) => void;
}

export interface ProofDrawerProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSubmit: (
    proof: Omit<ProofSubmission, 'opportunityId' | 'submittedAt' | 'status'>
  ) => void;
}

export interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  filters: OpportunitiesFilters;
  loading: boolean;
  error: string | null;
  setFilters: (filters: Partial<OpportunitiesFilters>) => void;
  applyToOpportunity: (
    opportunityId: string,
    proof: Omit<ProofSubmission, 'opportunityId' | 'submittedAt' | 'status'>
  ) => Promise<void>;
  filteredOpportunities: Opportunity[];
}

export interface TrustBadgeProps {
  userEmail: string;
  companyDomain: string;
}
