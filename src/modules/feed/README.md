# AI Task Feed Module

A personalized task recommendation system powered by AI that displays relevant tasks to users based on their skills, preferences, and performance history.

## Features

### 🎯 AI-Powered Recommendations

- **Personalized Feed**: Tasks scored by AI relevance (0-100%)
- **Explainable AI**: "Why This?" tooltips explain AI reasoning
- **Skill-Based Matching**: Recommendations based on user's skill areas
- **Performance History**: Considers past task performance and preferences

### 📱 Interactive UI

- **Swipe-to-Discard**: Left swipe on mobile to dismiss tasks
- **Infinite Scroll**: Seamless loading of more recommendations
- **Filter System**: Filter by skills, difficulty, and task type
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🎨 Task Cards

- **Rich Information**: Title, description, points, XP, duration
- **Visual Indicators**: Type badges, difficulty levels, skill areas
- **AI Insights**: Relevance scores and reasoning
- **Action Buttons**: Accept tasks with one click

### ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Focus Management**: Proper focus indicators
- **Touch Support**: Mobile-optimized interactions

## File Structure

```
src/modules/feed/
├── pages/
│   ├── FeedPage.tsx              # Main feed page with route /home
│   └── Home.tsx                  # Home page wrapper component
├── components/
│   ├── TaskCard.tsx              # Individual task card component
│   ├── TaskFeed.tsx              # Reusable feed component
│   └── WhyThisChip.tsx           # AI explanation tooltip component
├── hooks/
│   └── useFeed.ts                # Data fetching and state management
├── api/
│   └── feed.ts                   # API functions for backend communication
├── types.ts                      # TypeScript interfaces
├── index.ts                      # Module exports
└── README.md                     # This file
```

## Usage

### Basic Implementation

```tsx
import { Home, FeedPage } from '@/modules/feed';

// In your router - use either Home or FeedPage
<Route path="/home" element={<Home />} />
// or
<Route path="/feed" element={<FeedPage />} />
```

### Using Individual Components

```tsx
import { TaskFeed, TaskCard, WhyThisChip, FeedDemo } from '@/modules/feed';
import { useFeed } from '@/modules/feed';

// Using the TaskFeed component
function CustomFeed() {
  return (
    <TaskFeed
      maxTasks={5}
      onTaskAccept={(id) => console.log('Accept:', id)}
      onTaskDiscard={(id) => console.log('Discard:', id)}
    />
  );
}

// Using individual components
function CustomFeedDetailed() {
  const { tasks, loading, discardTask } = useFeed();

  return (
    <div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDiscard={discardTask}
          onAccept={(id) => console.log('Accept:', id)}
        />
      ))}
    </div>
  );
}

// Demo component for testing and showcasing
function DemoPage() {
  return <FeedDemo />;
}
```

## API Integration

The module includes comprehensive API functions for backend communication:

### Core API Functions

```tsx
import {
  fetchFeedTasks,
  submitTaskFeedback,
  getFeedPreferences,
  updateFeedPreferences,
  getTaskExplanation,
} from '@/modules/feed';

// Fetch AI-recommended tasks
const tasks = await fetchFeedTasks({
  rank: 'silver',
  skills: ['design', 'frontend'],
  page: 1,
  limit: 10,
  filters: { difficulty: 'medium' },
});

// Submit user feedback
await submitTaskFeedback('task-123', 'accept', 'Great recommendation!');

// Get user preferences
const preferences = await getFeedPreferences();

// Update preferences
await updateFeedPreferences({
  preferredSkills: ['design', 'ai'],
  dailyGoal: 5,
});

// Get AI explanation for a task
const explanation = await getTaskExplanation('task-123');
```

### Endpoint

```
GET /api/feed?rank={rank}&skills={skills}&page={page}&limit={limit}
```

### Query Parameters

- `rank`: User's current rank (bronze, silver, gold, etc.)
- `skills`: Comma-separated list of skill areas
- `page`: Page number for pagination
- `limit`: Number of tasks per page

### Response Format

```typescript
interface FeedResponse {
  success: boolean;
  data: {
    tasks: FeedTask[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNextPage: boolean;
    };
    metadata: {
      user_rank: string;
      skills: string[];
      total_recommendations: number;
      generated_at: string;
    };
  };
  message?: string;
  timestamp: string;
}
```

## Components

### FeedPage

Main page component that orchestrates the entire feed experience.

**Features:**

- Header with AI branding and controls
- Collapsible filter panel
- Task card grid with infinite scroll
- Loading, error, and empty states
- Responsive layout

**Props:** None (uses URL params and hooks)

### TaskCard

Individual task display component with interactive features.

**Props:**

- `task: FeedTask` - Task data to display
- `onDiscard: (taskId: string) => void` - Discard handler
- `onAccept: (taskId: string) => void` - Accept handler
- `isDiscarding?: boolean` - Animation state

**Features:**

- Swipe-to-discard functionality
- Touch and mouse support
- Visual feedback during interactions
- Accessibility support
- Task type and difficulty badges

### WhyThisChip

AI explanation component that shows relevance reasoning.

**Props:**

- `reason: string` - AI explanation text
- `relevanceScore: number` - Relevance percentage (0-100)
- `skillArea: string` - Associated skill area

**Features:**

- Color-coded relevance scores
- Hover and focus tooltips
- Skill area indicators
- Accessibility support

## Hooks

### useFeed

Main data fetching and state management hook.

**Options:**

- `initialFilters?: FeedFilters` - Initial filter state
- `pageSize?: number` - Number of tasks per page (default: 10)

**Returns:**

- `tasks: FeedTask[]` - Current task list
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `hasNextPage: boolean` - More data available
- `loadMore: () => void` - Load next page
- `discardTask: (taskId: string) => void` - Discard task
- `refresh: () => void` - Refresh feed
- `filters: FeedFilters` - Current filters
- `updateFilters: (filters: Partial<FeedFilters>) => void` - Update filters

## Data Types

### FeedTask

```typescript
interface FeedTask {
  id: string;
  title: string;
  description: string;
  type: 'arena' | 'course' | 'challenge';
  skill_area: string;
  points: number;
  xp_value: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  relevance_score: number; // 0-100
  relevance_reason: string; // AI explanation
  created_at: string;
  is_active: boolean;
  tags?: string[];
  requirements?: {
    min_rank?: string;
    skills?: string[];
  };
}
```

### FeedFilters

```typescript
interface FeedFilters {
  skills?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'arena' | 'course' | 'challenge';
  min_points?: number;
  max_duration?: number;
}
```

## Configuration

### Mock Data

The module includes comprehensive mock data for development and testing:

- 10 sample tasks across different skill areas
- Varied difficulty levels and task types
- Realistic AI relevance scores and explanations
- Different point values and XP rewards

### API Fallback

The module automatically falls back to mock data if the API is unavailable, ensuring development can continue without backend dependencies.

## Filtering System

### Available Filters

- **Skills**: Design, Frontend, Backend, AI, Writing, Database, Algorithm, System
- **Difficulty**: Easy, Medium, Hard
- **Type**: Arena, Course, Challenge
- **Points**: Minimum point threshold
- **Duration**: Maximum time limit

### Filter Logic

- Multiple skills can be selected (OR logic)
- Single difficulty and type selection
- Numeric filters for points and duration
- Filters are applied client-side for immediate feedback

## Swipe Interactions

### Mobile Support

- **Touch Events**: Native touch event handling
- **Swipe Threshold**: 80px left swipe to discard
- **Visual Feedback**: Discard hint appears at 50px
- **Animation**: Smooth slide-out animation

### Desktop Support

- **Mouse Events**: Mouse drag support
- **Keyboard**: Enter/Space to accept tasks
- **Accessibility**: Full keyboard navigation

## Infinite Scroll

### Implementation

- **Intersection Observer**: Efficient scroll detection
- **Pagination**: Server-side pagination support
- **Loading States**: Visual feedback during loading
- **Error Handling**: Graceful error recovery

### Performance

- **Lazy Loading**: Tasks load only when needed
- **Memory Management**: Efficient state updates
- **Debouncing**: Prevents excessive API calls

## Testing

### Cypress Tests

Run the comprehensive test suite:

```bash
npx cypress run --spec "cypress/e2e/feed.cy.ts"
```

### Test Coverage

- ✅ Feed loading and display
- ✅ Task card interactions
- ✅ AI recommendation tooltips
- ✅ Swipe-to-discard functionality
- ✅ Filter system
- ✅ Infinite scroll
- ✅ Loading and error states
- ✅ Accessibility features
- ✅ Mobile touch interactions
- ✅ Keyboard navigation

## Accessibility

### ARIA Support

- `role="button"` for interactive elements
- `aria-label` for task cards and buttons
- `role="tooltip"` for AI explanations
- `aria-valuenow/min/max` for progress indicators

### Keyboard Navigation

- Tab navigation through all interactive elements
- Enter/Space activation for buttons
- Focus indicators for all interactive elements
- Escape key to close tooltips

### Screen Reader Support

- Descriptive labels for all components
- Status announcements for loading/error states
- Contextual information for task data
- Proper heading structure

## Responsive Design

### Breakpoints

- **Mobile**: Single column layout with swipe gestures
- **Tablet**: Optimized touch targets and spacing
- **Desktop**: Full layout with hover effects

### Mobile Optimizations

- Touch-friendly button sizes (44px minimum)
- Swipe gestures for task dismissal
- Optimized spacing for thumb navigation
- Reduced animations for performance

## Performance

### Optimizations

- **Memoized Components**: Expensive renders are memoized
- **Lazy Loading**: Components load only when needed
- **Efficient Re-renders**: Minimal state updates
- **Debounced Interactions**: Prevents excessive API calls

### Bundle Size

- **Tree-shakeable**: Only import what you need
- **Minimal Dependencies**: No external charting libraries
- **Code Splitting**: Components can be lazy-loaded

## Future Enhancements

### Planned Features

- [ ] Real-time task updates
- [ ] Advanced AI personalization
- [ ] Social sharing of tasks
- [ ] Task bookmarking
- [ ] Performance analytics
- [ ] Offline support

### Technical Improvements

- [ ] Virtual scrolling for large lists
- [ ] Advanced caching strategies
- [ ] WebSocket integration
- [ ] Service worker support

## Contributing

When adding new features:

1. **Follow the existing patterns** for component structure
2. **Add comprehensive tests** for new functionality
3. **Update TypeScript types** for new data structures
4. **Maintain accessibility** standards
5. **Document changes** in this README

## Dependencies

- **React**: UI framework
- **React Router**: Navigation and routing
- **TailwindCSS**: Styling
- **Lucide React**: Icons
- **Cypress**: Testing (dev dependency)

No external libraries required for core functionality.
