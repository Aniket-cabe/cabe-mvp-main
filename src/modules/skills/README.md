# Skills Module

A comprehensive dashboard system for tracking user progress across different skill areas in the CaBE platform.

## Features

### 🎯 Skill Area Dashboards

- **Dynamic Routing**: Each skill has its own dashboard at `/skills/:skillSlug`
- **Color Themes**: Unique color schemes for each skill area
  - Design: `pink-500`
  - Web Development: `emerald-500`
  - AI: `violet-500`
  - Writing: `amber-500`

### 📊 Progress Tracking

- **XP System**: Tier-based progression with visual progress bars
- **Statistics**: Total tasks, average points, completion rates, best scores
- **Activity Heatmap**: 90-day calendar showing daily submission activity
- **Task History**: Detailed table with expandable task information

### 🏆 Badge System

- **Skill-Specific Badges**: Only shows badges earned for the current skill
- **Rarity Levels**: Common, Rare, Epic, Legendary with visual indicators
- **Tooltips**: Detailed information on hover
- **Unlock Dates**: Track when badges were earned

### 🎨 UI Components

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Loading States**: Smooth loading indicators and error handling
- **Interactive Elements**: Expandable tasks, hover effects, tooltips
- **XP Progress Bar**: Dedicated component with tier information and animations

## File Structure

```
src/modules/skills/
├── pages/
│   └── SkillDashboard.tsx          # Main dashboard page
├── components/
│   ├── SkillHeader.tsx             # Skill info and description
│   ├── SkillStats.tsx              # Statistics cards
│   ├── SkillXPBar.tsx              # XP progress bar component
│   ├── SkillTaskList.tsx           # Task history table
│   ├── BadgeStrip.tsx              # Badge grid display
│   ├── ActivityHeatmap.tsx         # Custom calendar heatmap
│   └── SkillsDemo.tsx              # Demo component for testing
├── hooks/
│   └── useSkillData.ts             # Data fetching hook
├── types.ts                        # TypeScript interfaces
├── index.ts                        # Module exports
└── README.md                       # This file
```

## Usage

### Basic Implementation

```tsx
import { SkillDashboard } from '@/modules/skills';

// In your router
<Route path="/skills/:skillSlug" element={<SkillDashboard />} />;
```

### Demo Component

```tsx
import { SkillsDemo } from '@/modules/skills';

// For testing and demonstration
<Route path="/skills-demo" element={<SkillsDemo />} />;
```

### Individual Components

```tsx
import { SkillXPBar, SkillStats, ActivityHeatmap } from '@/modules/skills';

// Use individual components as needed
<SkillXPBar xpProgress={xpData} skill={skillData} size="lg" />;
```

### Data Structure

The module expects data in this format:

```typescript
interface SkillData {
  skill: SkillArea;
  stats: SkillStats;
  tasks: SkillTask[];
  badges: Badge[];
  xpProgress: XPProgress;
  heatmapData: HeatmapData[];
}
```

### API Integration

The module automatically fetches data from `/api/arena/user-progress?skill={skillSlug}` and falls back to mock data if the API is unavailable.

## Components

### SkillDashboard

Main page component that orchestrates all other components.

**Props**: None (uses URL params)
**Features**:

- Dynamic routing with skill slug
- Loading, error, and not-found states
- Responsive layout

### SkillHeader

Displays skill information and description.

**Props**:

- `skill: SkillArea` - Skill information

**Features**:

- Icon, name, and tagline display
- Color-themed styling
- Responsive design

### SkillStats

Shows key statistics in card format.

**Props**:

- `stats: SkillStats` - Statistics data
- `xpProgress: XPProgress` - XP progression data
- `skill: SkillArea` - Skill for theming

**Features**:

- 6 stat cards (tasks, points, XP, score, etc.)
- XP progress bar with tier information
- Color-themed styling

### SkillTaskList

Table displaying task history.

**Props**:

- `tasks: SkillTask[]` - Task data
- `skill: SkillArea` - Skill for theming

**Features**:

- Expandable task details
- Feedback toggle
- Status indicators
- Score and points display

### BadgeStrip

Grid display of earned badges.

**Props**:

- `badges: Badge[]` - Badge data
- `skill: SkillArea` - Skill for theming

**Features**:

- Rarity-based styling
- Hover tooltips
- Unlock date display
- Empty state handling

### ActivityHeatmap

Custom calendar heatmap showing 90 days of activity.

**Props**:

- `data: HeatmapData[]` - Daily activity data
- `skill: SkillArea` - Skill for theming

**Features**:

- Color intensity based on activity
- Hover tooltips with date and count
- Keyboard accessibility
- Responsive design

### SkillXPBar

Dedicated XP progress bar component with tier information.

**Props**:

- `xpProgress: XPProgress` - XP progression data
- `skill: SkillArea` - Skill for theming
- `size?: 'sm' | 'md' | 'lg'` - Component size
- `showDetails?: boolean` - Show tier information

**Features**:

- Multiple size variants
- Tier-based color coding
- Progress animations
- Accessibility support
- XP needed calculation

## Configuration

### Skill Areas

Define new skill areas in `useSkillData.ts`:

```typescript
const SKILL_AREAS: Record<string, SkillArea> = {
  newSkill: {
    slug: 'newSkill',
    name: 'New Skill',
    icon: '🎯',
    tagline: 'Your tagline here',
    color: 'blue-500',
    description: 'Skill description',
  },
};
```

### Color Themes

Each skill area supports custom colors:

- Primary: `{color}-500`
- Light: `{color}-400`
- Dark: `{color}-600`
- Background: `{color}-100`

## Testing

Run the comprehensive test suite:

```bash
npx cypress run --spec "cypress/e2e/skills.cy.ts"
```

### Test Coverage

- ✅ Dashboard loading and display
- ✅ Statistics accuracy
- ✅ XP progress bar functionality
- ✅ SkillXPBar component variants
- ✅ Activity heatmap rendering
- ✅ Task table interactions
- ✅ Badge display and tooltips
- ✅ Error and loading states
- ✅ Accessibility features
- ✅ Responsive design
- ✅ Color theme variations
- ✅ Skill navigation in demo

## Accessibility

### ARIA Support

- `role="progressbar"` for XP bars
- `role="button"` for interactive elements
- `aria-label` for all interactive components
- `aria-valuenow/min/max` for progress indicators

### Keyboard Navigation

- Tab navigation through all interactive elements
- Enter/Space activation for buttons
- Focus indicators for all interactive elements

### Screen Reader Support

- Descriptive labels for all components
- Status announcements for loading/error states
- Contextual information for data displays

## Responsive Design

### Breakpoints

- **Mobile**: Single column layout
- **Tablet**: Two-column grid for tasks/badges
- **Desktop**: Full layout with sidebar elements

### Mobile Optimizations

- Touch-friendly button sizes
- Swipe gestures for task expansion
- Optimized table scrolling
- Compact heatmap display

## State Management

### Loading States

- Skeleton loaders for content
- Spinner for initial load
- Progressive loading for large datasets

### Error Handling

- Graceful fallback to mock data
- User-friendly error messages
- Retry mechanisms for failed requests

### Data Caching

- Local state management with React hooks
- Optimistic updates for better UX
- Background data refresh

## Performance

### Optimizations

- Memoized components for expensive renders
- Lazy loading for large datasets
- Efficient re-renders with proper dependencies
- Debounced search and filtering

### Bundle Size

- Tree-shakeable exports
- Minimal external dependencies
- Custom heatmap implementation (no external library)

## Future Enhancements

### Planned Features

- [ ] Real-time data updates
- [ ] Advanced filtering and sorting
- [ ] Export functionality (PDF/CSV)
- [ ] Social sharing of achievements
- [ ] Comparison with other users
- [ ] Goal setting and tracking

### Technical Improvements

- [ ] Virtual scrolling for large task lists
- [ ] Offline support with service workers
- [ ] Advanced caching strategies
- [ ] Performance monitoring integration

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

No external charting libraries required - custom heatmap implementation included.
