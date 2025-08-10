# Achievements & Badges Module

A comprehensive achievements and badges system for the CaBE platform that displays earned and locked badges with animations, progress tracking, and filtering capabilities.

## Features

### 🏆 Badge Display

- **Earned Badges**: Full color with animations and hover effects
- **Locked Badges**: Grayscale with 70% opacity to indicate unearned status
- **Progress Tracking**: Linear progress bars for partially completed achievements
- **Rarity System**: Visual indicators for Common, Rare, Epic, and Legendary badges

### 🎨 UI Components

- **Masonry Grid Layout**: Responsive CSS columns layout (`columns-1 sm:columns-2 md:columns-3 lg:columns-4`)
- **Animations**: Pop animation for earned badges (400ms duration)
- **Tooltips**: Hover tooltips with progress information and motivational text
- **Filtering**: Filter by category, earned status, or view all badges

### 📊 Progress Tracking

- **Progress Bars**: Show completion percentage for ongoing achievements
- **Motivational Text**: "Only 2 more wins. Let's go. 💥" style messages
- **Real-time Updates**: Progress updates when tasks are completed

### ♿ Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Clear focus indicators and logical tab order
- **Progress Indicators**: ARIA-compliant progress bars

## File Structure

```
src/modules/achievements/
├── pages/
│   └── Achievements.tsx          # Main achievements page
├── components/
│   ├── BadgeGrid.tsx             # Masonry grid layout
│   └── BadgeItem.tsx             # Individual badge component
├── hooks/
│   └── useBadges.ts              # Data fetching and filtering
├── types.ts                      # TypeScript interfaces
├── index.ts                      # Module exports
└── README.md                     # This documentation
```

## Usage

### Basic Implementation

```tsx
import { Achievements } from '@/modules/achievements';

// In your router
<Route path="/achievements" element={<Achievements />} />;
```

### Individual Components

```tsx
import { BadgeGrid, BadgeItem } from '@/modules/achievements';

// Use BadgeGrid with custom data
<BadgeGrid
  badges={badgeData}
  onBadgeClick={handleBadgeClick}
  filter="earned"
/>

// Use BadgeItem individually
<BadgeItem
  badge={badgeData}
  onBadgeClick={handleBadgeClick}
/>
```

### Data Structure

The module expects badge data in this format:

```typescript
interface Badge {
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
```

## Components

### Achievements

Main page component that orchestrates the entire achievements experience.

**Features**:

- Progress overview with statistics
- Filter controls for different badge categories
- Responsive layout with header and navigation
- Error handling and loading states

### BadgeGrid

Masonry grid layout component for displaying badges.

**Props**:

- `badges: Badge[]` - Array of badge data
- `onBadgeClick?: (badge: Badge) => void` - Click handler
- `filter?: 'all' | 'earned' | 'locked' | Badge['category']` - Filter type

**Features**:

- Responsive masonry layout using CSS columns
- Filtering functionality
- Progress statistics display
- Empty state handling

### BadgeItem

Individual badge component with animations and interactions.

**Props**:

- `badge: Badge` - Badge data
- `onBadgeClick?: (badge: Badge) => void` - Click handler

**Features**:

- Earned/locked state styling
- Progress bar for partial completion
- Hover tooltips with motivational text
- Pop animation for earned badges
- Rarity-based color coding
- Full accessibility support

## Badge Categories

### Arena Badges

- **First Victory**: Win your first Arena challenge
- **Hot Streak**: Win 5 Arena challenges in a row
- **Arena Master**: Win 50 Arena challenges
- **Arena Legend**: Win 100 Arena challenges

### Learning Badges

- **Student**: Complete your first course
- **Scholar**: Complete 5 courses
- **Academic**: Complete 20 courses
- **Learning Master**: Complete 50 courses

### Social Badges

- **Social Butterfly**: Add your first friend
- **Networker**: Add 10 friends
- **Influencer**: Add 50 friends

### Streak Badges

- **Consistent**: Maintain a 3-day streak
- **Week Warrior**: Maintain a 7-day streak
- **Month Master**: Maintain a 30-day streak
- **Century Club**: Maintain a 100-day streak

### Special Badges

- **Beta Tester**: Join during beta phase
- **Early Adopter**: Join in the first month
- **Founder**: One of the first 100 users
- **Perfect Score**: Get a perfect score on any task
- **Jack of All Trades**: Earn badges in all categories
- **Badge Collector**: Earn 100 badges

## Animations

### Pop Animation

Earned badges feature a 400ms pop animation:

```css
@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}
```

### Hover Effects

- **Earned Badges**: Scale to 105% with shadow effects
- **Locked Badges**: No hover effects (maintains grayscale state)

## Progress System

### Progress Bars

- Display for badges with partial completion
- Shows current/total progress with percentage
- Updates in real-time as tasks are completed

### Motivational Text

Tooltips show encouraging messages:

- "Only 2 more wins. Let's go. 💥"
- "Only 1 more course. Let's go. 💥"

## Accessibility

### ARIA Support

- `role="button"` for interactive badge items
- `role="progressbar"` for progress indicators
- `aria-label` with descriptive text for each badge
- `aria-valuenow/min/max` for progress bars

### Keyboard Navigation

- Tab navigation through all interactive elements
- Enter/Space activation for badge clicks
- Focus indicators for all interactive elements

### Screen Reader Support

- Descriptive labels for all badges
- Status announcements for earned vs locked badges
- Progress information for ongoing achievements

## Responsive Design

### Breakpoints

- **Mobile**: Single column layout
- **Tablet**: Two-column layout
- **Desktop**: Three-column layout
- **Large Desktop**: Four-column layout

### Masonry Layout

Uses CSS `columns` property for true masonry layout:

```css
.columns-1 sm:columns-2 md:columns-3 lg:columns-4
```

## Testing

Run the comprehensive test suite:

```bash
npx cypress run --spec "cypress/e2e/achievements.cy.ts"
```

### Test Coverage

- ✅ Page layout and header display
- ✅ Filter controls functionality
- ✅ Badge grid rendering (20+ items)
- ✅ Locked badge styling (grayscale, opacity)
- ✅ Earned badge animations
- ✅ Progress bar functionality
- ✅ Tooltip interactions
- ✅ Accessibility features
- ✅ Responsive design
- ✅ Error handling

## API Integration

The module automatically fetches data from `/api/badges` and falls back to mock data if the API is unavailable.

### Expected API Response

```json
{
  "badges": [
    {
      "id": "badge-id",
      "title": "Badge Title",
      "emoji": "🏆",
      "description": "Badge description",
      "earned": true,
      "dateEarned": "2024-01-15T10:30:00Z",
      "category": "arena",
      "rarity": "common",
      "requirements": "Win 1 Arena challenge"
    }
  ]
}
```

## Performance

### Optimizations

- Memoized filtering functions
- Efficient re-renders with proper dependencies
- CSS-based animations (no JavaScript animation libraries)
- Lazy loading for large badge collections

### Bundle Size

- Minimal external dependencies
- Tree-shakeable exports
- Efficient component structure

## Future Enhancements

### Planned Features

- [ ] Real-time badge unlocking notifications
- [ ] Badge sharing functionality
- [ ] Advanced filtering and sorting
- [ ] Badge comparison with other users
- [ ] Export functionality (PDF/CSV)
- [ ] Badge unlock celebrations

### Technical Improvements

- [ ] Virtual scrolling for large badge collections
- [ ] Advanced caching strategies
- [ ] Performance monitoring integration
- [ ] Offline support with service workers

## Contributing

When adding new features:

1. **Follow the existing patterns** for component structure
2. **Add comprehensive tests** for new functionality
3. **Update TypeScript types** for new data structures
4. **Maintain accessibility** standards
5. **Document changes** in this README

## Dependencies

- **React**: UI framework
- **TailwindCSS**: Styling
- **Lucide React**: Icons
- **Cypress**: Testing (dev dependency)

No external animation or grid libraries required - custom CSS implementation included.
