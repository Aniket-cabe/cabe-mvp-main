# Learning Module

A comprehensive learning management system for the CaBE platform, featuring course discovery, rank-gated access, and proof submission capabilities.

## Features

### 🎯 **Core Functionality**

- **Course Discovery**: Browse and search through curated courses
- **Rank-Gated Access**: Courses locked based on user rank progression
- **Proof Submission**: Upload files or external links as completion proof
- **Progress Tracking**: Visual progress indicators for ongoing courses
- **Platform Integration**: Support for Fiverr and Internshala synced courses

### 📊 **UI Components**

- **Filter Chips**: Category-based filtering (All, Design, Web, AI, Writing)
- **Search**: Fuzzy matching on course titles and descriptions
- **Pagination**: 10 courses per page with navigation
- **Course Cards**: Rich course information with rank lock overlays
- **Course Modal**: Detailed course view with mobile swipe support
- **Proof Uploader**: Drag/drop file upload with validation

### 🔒 **Rank System**

- **Bronze**: Access to beginner courses
- **Silver**: Access to intermediate courses
- **Gold**: Access to advanced courses
- **Platinum**: Access to expert courses
- **Diamond**: Access to all courses

## File Structure

```
src/modules/learning/
├── pages/
│   └── LearnIndex.tsx          # Main course list page
├── components/
│   ├── CourseCard.tsx          # Reusable course card component
│   └── ProofUploader.tsx       # Proof submission drawer
├── hooks/
│   └── useCourses.ts           # Course data fetching hook
├── types.ts                    # TypeScript type definitions
├── index.ts                    # Module exports
└── README.md                   # This file
```

## Components

### LearnIndex

The main learning center page featuring:

- Course grid with filtering and search
- Pagination controls
- Course modal for detailed view
- Proof uploader integration

### CourseCard

Reusable course card component with:

- Course thumbnail and metadata
- Rank lock overlay for restricted courses
- Platform sync indicators
- Progress bar for ongoing courses
- Start course button with rank validation

### ProofUploader

Proof submission drawer with:

- File upload (PNG, JPG, PDF up to 10MB)
- External link submission
- Drag/drop and paste support
- Progress tracking
- Form validation

## Hooks

### useCourses

Fetches course data with fallback support:

- **Primary**: Supabase database integration
- **Fallback**: Local mock data
- **Features**: Loading states, error handling, refetch capability

## Types

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  category: 'design' | 'web' | 'ai' | 'writing';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  requiredRank: string;
  progress?: number;
  source?: 'fiverr' | 'internshala' | 'internal';
  // ... additional fields
}
```

## Usage

### Basic Implementation

```tsx
import { LearnIndex } from '@/modules/learning';

function App() {
  return (
    <div>
      <LearnIndex />
    </div>
  );
}
```

### Custom Course Card

```tsx
import { CourseCard } from '@/modules/learning';
import type { Course } from '@/modules/learning';

const course: Course = {
  id: 'course-1',
  title: 'React.js Mastery',
  description: 'Master React.js development...',
  category: 'web',
  difficulty: 'intermediate',
  duration: '8-12 hours',
  requiredRank: 'Silver',
};

function MyComponent() {
  return (
    <CourseCard
      course={course}
      onClick={() => console.log('Course clicked')}
      onStartCourse={() => console.log('Start course')}
      userRank="Bronze"
    />
  );
}
```

### Custom Hook Usage

```tsx
import { useCourses } from '@/modules/learning';

function MyComponent() {
  const { courses, loading, error, refetch } = useCourses();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {courses?.map((course) => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  );
}
```

## Accessibility

### ARIA Support

- `role="tablist"` and `role="tab"` for category filters
- `role="tabpanel"` for filtered content
- Proper focus management and keyboard navigation

### Keyboard Navigation

- Tab navigation through interactive elements
- Arrow key navigation for category filters
- Enter key activation for buttons and links
- Escape key to close modals

## Testing

### Cypress Tests

Comprehensive test coverage in `cypress/e2e/learning.cy.ts`:

- Course filtering and search
- Rank-gated access validation
- Proof uploader functionality
- File type and size validation
- Platform sync indicators
- Loading and error states
- Keyboard accessibility

### Test Commands

```bash
# Run all learning module tests
npm run cypress:run --spec "cypress/e2e/learning.cy.ts"

# Run tests in interactive mode
npm run cypress:open
```

## Integration

### Supabase Setup

To enable Supabase integration:

1. Configure Supabase client in your app
2. Create `courses` table with required schema
3. Set up authentication and row-level security

### Mock Data

The module includes comprehensive mock data for development and testing:

- 12 sample courses across all categories
- Various difficulty levels and rank requirements
- Platform sync examples (Fiverr, Internshala)
- Realistic course metadata

## Styling

### Tailwind CSS Classes

The module uses Tailwind CSS for styling with:

- Responsive design patterns
- Consistent color schemes
- Smooth transitions and animations
- Dark mode support (via CSS variables)

### Custom Classes

- `.line-clamp-2`: Text truncation for descriptions
- `.blur-sm`: Visual lock effect for restricted courses
- Custom color schemes for categories and difficulties

## Performance

### Optimization Features

- **Lazy Loading**: Course cards load as needed
- **Memoization**: Filtered results cached with useMemo
- **Debounced Search**: Search input optimized for performance
- **Virtual Scrolling**: Ready for large course lists

### Bundle Size

- Tree-shakeable exports
- Minimal dependencies
- Optimized component structure

## Future Enhancements

### Planned Features

- **Course Recommendations**: AI-powered course suggestions
- **Learning Paths**: Structured course sequences
- **Certificates**: Completion certificates and badges
- **Social Features**: Course reviews and ratings
- **Offline Support**: Course content caching

### Technical Improvements

- **GraphQL Integration**: More efficient data fetching
- **Real-time Updates**: Live course progress tracking
- **Advanced Search**: Full-text search with filters
- **Analytics**: Learning progress analytics

## Contributing

### Development Guidelines

1. Follow TypeScript best practices
2. Maintain accessibility standards
3. Write comprehensive tests
4. Update documentation for new features
5. Follow the established component patterns

### Code Style

- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Maintain consistent naming conventions

---

**The Learning Module provides a complete, accessible, and scalable solution for course management and learning progression in the CaBE platform.** 🚀✨
