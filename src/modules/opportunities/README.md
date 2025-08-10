# Opportunities Module

A comprehensive UI module for displaying and managing freelance gigs and internship opportunities in the CaBE platform.

## Features

- **Opportunity Listings**: Display gigs and internships with detailed information
- **Rank-Based Access**: Opportunities are gated by user rank (Bronze, Silver, Gold)
- **Advanced Filtering**: Filter by type (gigs/internships), category (design/web/AI/writing), and source
- **Proof Submission**: Secure application system with CV/portfolio upload
- **Trust Badges**: Visual indicators for verified company domains and synced sources
- **Responsive Design**: Mobile-first design with responsive grid layouts

## File Structure

```
src/modules/opportunities/
├── components/
│   ├── OppCard.tsx           # Individual opportunity card
│   ├── ProofDrawer.tsx       # Application submission modal
│   └── TrustBadge.tsx        # Company domain verification badge
├── hooks/
│   └── useOpportunities.ts   # Data fetching and state management
├── pages/
│   └── Opportunities.tsx     # Main opportunities page
├── types.ts                  # TypeScript interfaces
├── index.ts                  # Barrel exports
└── README.md                 # This file
```

## Quick Start

```tsx
import { Opportunities } from '@/modules/opportunities';

function App() {
  return (
    <div>
      <Opportunities />
    </div>
  );
}
```

## Components

### Opportunities Page

The main page component that displays the opportunities interface.

**Features:**

- Filter tabs for gigs vs internships
- Category and source filters
- Responsive grid layout
- Loading and error states
- Rank-based opportunity display

**Props:** None (uses internal state management)

### OppCard

Displays individual opportunity information in a card format.

**Props:**

```tsx
interface OppCardProps {
  opportunity: Opportunity;
  userRank: string;
  userEmail: string;
  onApply: (opportunity: Opportunity) => void;
}
```

**Features:**

- Rank lock overlay for inaccessible opportunities
- Source badges (Fiverr, Internshala, etc.)
- Synced badges for external platforms
- Trust badges for company domain verification
- Points display and requirements list

### ProofDrawer

Modal component for submitting applications with proof documents.

**Props:**

```tsx
interface ProofDrawerProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSubmit: (proof: ProofData) => void;
}
```

**Features:**

- CV/Resume link input
- Portfolio URL input
- Optional cover letter
- Form validation
- Success feedback
- Focus management and accessibility

### TrustBadge

Small badge component that appears when user email domain matches company domain.

**Props:**

```tsx
interface TrustBadgeProps {
  userEmail: string;
  companyDomain: string;
}
```

## Hooks

### useOpportunities

Main hook for managing opportunities data and state.

**Returns:**

```tsx
interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  filters: OpportunitiesFilters;
  loading: boolean;
  error: string | null;
  setFilters: (filters: Partial<OpportunitiesFilters>) => void;
  applyToOpportunity: (
    opportunityId: string,
    proof: ProofData
  ) => Promise<void>;
  filteredOpportunities: Opportunity[];
}
```

**Features:**

- Mock data for development
- Filter management
- Application submission
- Error handling

## Types

### Opportunity

```tsx
interface Opportunity {
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
```

### Filters

```tsx
interface OpportunitiesFilters {
  type: 'gig' | 'internship';
  category: 'design' | 'web' | 'ai' | 'writing' | 'all';
  source: 'fiverr' | 'internshala' | 'upwork' | 'linkedin' | 'internal' | 'all';
}
```

## API Contract

### Get Opportunities

```http
GET /api/opps?type=gig|intern&rank={rank}
```

**Response:**

```json
{
  "opportunities": [
    {
      "id": "1",
      "title": "UI/UX Designer",
      "company": "TechCorp Inc",
      "source": "fiverr",
      "type": "gig",
      "category": "design",
      "points": 150,
      "locked": false,
      "requiredRank": "Bronze"
    }
  ]
}
```

### Submit Application

```http
POST /api/opps/apply
Content-Type: application/json

{
  "opportunityId": "1",
  "userId": "user123",
  "proofUrls": ["https://cv-link.com", "https://portfolio.com"]
}
```

## Visual Design

### Color Scheme

- **Primary**: Blue (#3B82F6) for active states and CTAs
- **Success**: Green (#10B981) for trust badges and success states
- **Warning**: Yellow (#F59E0B) for points and rank indicators
- **Error**: Red (#EF4444) for error states
- **Neutral**: Gray scale for text and backgrounds

### Typography

- **Headings**: Inter font family, semibold weights
- **Body**: Inter font family, regular weights
- **Labels**: Small text with medium weight

### Spacing

- Consistent 4px base unit
- Card padding: 24px (p-6)
- Grid gap: 24px (gap-6)
- Section margins: 32px (mb-8)

## Accessibility

### Keyboard Navigation

- Tab navigation through all interactive elements
- Arrow key navigation for filter tabs
- ESC key to close modals and drawers

### Screen Readers

- Proper ARIA labels and roles
- Focus management for modals
- Descriptive alt text for icons

### Color Contrast

- WCAG AA compliant color combinations
- High contrast for important information
- Color-independent status indicators

## Testing

### Cypress Tests

File: `cypress/e2e/opps.cy.ts`

**Test Coverage:**

- Filter functionality (type, category, source)
- Opportunity card rendering
- Locked opportunities cannot be applied
- Trust badge visibility for matching domains
- Proof drawer open/close functionality
- Form validation and submission
- Responsive design breakpoints

### Test IDs

- `opportunities-grid` - Main opportunities container
- `type-tab-{value}` - Type filter tabs
- `category-filter-{value}` - Category filter buttons
- `source-filter-{value}` - Source filter buttons
- `apply-btn-{id}` - Apply buttons on cards
- `cv-link-input` - CV link input field
- `portfolio-input` - Portfolio URL input field
- `submit-application-btn` - Submit button in drawer

## Usage Examples

### Basic Implementation

```tsx
import { Opportunities } from '@/modules/opportunities';

function OpportunitiesPage() {
  return <Opportunities />;
}
```

### Custom Filtering

```tsx
import { useOpportunities } from '@/modules/opportunities';

function CustomOpportunities() {
  const { setFilters, filteredOpportunities } = useOpportunities();

  const showOnlyDesignGigs = () => {
    setFilters({ type: 'gig', category: 'design' });
  };

  return (
    <div>
      <button onClick={showOnlyDesignGigs}>Show Design Gigs</button>
      {/* Render opportunities */}
    </div>
  );
}
```

### Custom Opportunity Card

```tsx
import { OppCard } from '@/modules/opportunities';

function CustomCard({ opportunity }) {
  return (
    <OppCard
      opportunity={opportunity}
      userRank="Silver"
      userEmail="user@company.com"
      onApply={(opp) => console.log('Applying to:', opp.title)}
    />
  );
}
```

## Development Notes

### Mock Data

The module includes comprehensive mock data for development:

- 6 sample opportunities across different types and categories
- Various sources (Fiverr, Internshala, Upwork, LinkedIn, Internal)
- Different rank requirements and point values

### State Management

- Uses React hooks for local state management
- No external state management required
- Easy to integrate with global state if needed

### Performance

- Memoized filtered opportunities
- Lazy loading ready (can be easily adapted)
- Optimized re-renders with useCallback

### Future Enhancements

- Real-time updates via WebSocket
- Advanced search functionality
- Saved applications tracking
- Application status updates
- Company reviews and ratings
