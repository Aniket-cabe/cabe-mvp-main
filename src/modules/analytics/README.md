# Analytics Module

A comprehensive dual-layer analytics system for the CaBE platform, providing rich data visualizations and insights for both users and administrators.

## 📊 Overview

The Analytics Module delivers a sophisticated dashboard experience with two distinct layers:

- **User Analytics** (`/analytics`) - Personal performance metrics and insights
- **Admin Analytics** (`/admin/analytics`) - Platform-wide metrics with RBAC protection

## 🎯 Features

### User Analytics Features

- **Submission Heatmap** - Visual calendar showing daily submission frequency
- **Skill Radar Chart** - Multi-dimensional skill point visualization
- **Task Type Bar Chart** - Points breakdown by task categories
- **Data Export** - CSV/JSON export functionality
- **Personal Insights** - Activity streaks, total points, best skills

### Admin Analytics Features (Platinum Only)

- **KPI Cards** - Key performance indicators with trend analysis
- **Top Reviewers Table** - Reviewer performance metrics and rankings
- **Task Distribution Pie Chart** - Platform-wide task category breakdown
- **Audit Data Export** - Complete audit dataset export
- **RBAC Security** - Role-based access control for sensitive data

## 🏗️ Architecture

```
src/modules/analytics/
├── pages/
│   ├── UserAnalytics.tsx       # User analytics dashboard
│   └── AdminAnalytics.tsx      # Admin analytics dashboard (RBAC protected)
├── components/
│   ├── AnalyticsCharts/
│   │   ├── SubmissionCalendar.tsx        # Heatmap calendar
│   │   ├── SkillRadarChart.tsx           # Radar chart component
│   │   ├── TaskTypeBarChart.tsx          # Bar chart component
│   │   ├── KPICards.tsx                  # Admin KPI cards
│   │   ├── TopReviewersTable.tsx         # Reviewers performance table
│   │   └── TaskDistributionPieChart.tsx  # Pie chart component
│   ├── ExportButton.tsx        # Export functionality
│   └── AnalyticsDemo.tsx       # Demo component
├── hooks/
│   └── useAnalytics.ts         # Analytics data management
├── utils/
│   └── exportCSV.ts           # Export utilities
├── types.ts                   # TypeScript interfaces
├── index.ts                   # Module exports
└── README.md                  # This file
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { UserAnalytics, AdminAnalytics } from '@/modules/analytics';

// User Analytics Route
function UserAnalyticsPage() {
  return <UserAnalytics />;
}

// Admin Analytics Route (requires RBAC check)
function AdminAnalyticsPage() {
  return <AdminAnalytics />;
}
```

### Using Individual Components

```tsx
import {
  SkillRadarChart,
  TaskTypeBarChart,
  ExportButton,
} from '@/modules/analytics';

function CustomDashboard() {
  const { userData } = useAnalytics();

  return (
    <div>
      <SkillRadarChart data={userData.skillRadar} />
      <TaskTypeBarChart data={userData.taskTypeBar} />
      <ExportButton
        data={userData.exportData}
        filename="my-analytics"
        format="csv"
      />
    </div>
  );
}
```

### Using the Analytics Hook

```tsx
import { useAnalytics } from '@/modules/analytics';

function MyComponent() {
  const { userData, adminData, isLoading, error, refetch } = useAnalytics();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>
        Total Points:{' '}
        {userData.taskTypeBar.reduce((sum, item) => sum + item.totalPoints, 0)}
      </h1>
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}
```

## 📈 Component Reference

### SubmissionCalendar

Visual heatmap showing submission frequency over time.

```tsx
<SubmissionCalendar data={submissionHeatmapData} className="custom-class" />
```

**Props:**

- `data`: `SubmissionHeatmapData[]` - Array of date/count objects
- `className?`: `string` - Additional CSS classes

### SkillRadarChart

Radar chart displaying skill point distribution.

```tsx
<SkillRadarChart data={skillRadarData} className="custom-class" />
```

**Props:**

- `data`: `SkillRadarData[]` - Array of skill/points objects
- `className?`: `string` - Additional CSS classes

### TaskTypeBarChart

Bar chart showing points by task type.

```tsx
<TaskTypeBarChart data={taskTypeBarData} className="custom-class" />
```

**Props:**

- `data`: `TaskTypeBarData[]` - Array of taskType/totalPoints objects
- `className?`: `string` - Additional CSS classes

### KPICards

Admin KPI cards with trend indicators.

```tsx
<KPICards data={kpiCardsData} className="custom-class" />
```

**Props:**

- `data`: `KPICardData[]` - Array of KPI objects
- `className?`: `string` - Additional CSS classes

### TopReviewersTable

Performance table for top reviewers.

```tsx
<TopReviewersTable data={topReviewersData} className="custom-class" />
```

**Props:**

- `data`: `TopReviewerData[]` - Array of reviewer objects
- `className?`: `string` - Additional CSS classes

### TaskDistributionPieChart

Pie chart showing task category distribution.

```tsx
<TaskDistributionPieChart
  data={taskDistributionData}
  className="custom-class"
/>
```

**Props:**

- `data`: `TaskDistributionData[]` - Array of category/count objects
- `className?`: `string` - Additional CSS classes

### ExportButton

Configurable export button for data download.

```tsx
<ExportButton
  data={exportData}
  filename="analytics-export"
  format="csv"
  className="custom-class"
/>
```

**Props:**

- `data`: `ExportData[] | AuditData[]` - Data to export
- `filename`: `string` - Base filename for download
- `format`: `'csv' | 'json'` - Export format
- `className?`: `string` - Additional CSS classes

## 🔒 RBAC Implementation

The Admin Analytics page implements Role-Based Access Control:

```tsx
// RBAC Check in AdminAnalytics.tsx
useEffect(() => {
  if (user.rank !== 'platinum') {
    navigate('/analytics', { replace: true });
  }
}, [user.rank, navigate]);
```

**Access Levels:**

- **All Users**: User Analytics (`/analytics`)
- **Platinum Only**: Admin Analytics (`/admin/analytics`)

## 📡 API Integration

The module expects a single endpoint that returns both user and admin data:

```typescript
GET / api / metrics;
```

**Response Format:**

```json
{
  "userData": {
    "submissionHeatmap": [{ "date": "2024-01-01", "count": 5 }],
    "skillRadar": [{ "skill": "Design", "points": 850, "maxPoints": 1000 }],
    "taskTypeBar": [{ "taskType": "Arena", "totalPoints": 1250, "count": 25 }],
    "exportData": [
      {
        "date": "2024-01-01",
        "taskType": "Arena",
        "points": 50,
        "skill": "Design"
      }
    ]
  },
  "adminData": {
    "kpiCards": [
      {
        "title": "Daily Audits",
        "value": 156,
        "unit": "reviews",
        "change": 12,
        "changeType": "increase"
      }
    ],
    "topReviewers": [
      {
        "name": "Sarah Chen",
        "reviewed": 45,
        "avgLatency": 6.2,
        "rank": "platinum"
      }
    ],
    "taskDistribution": [
      {
        "category": "Arena Tasks",
        "count": 156,
        "percentage": 45,
        "color": "#3B82F6"
      }
    ],
    "auditData": [
      {
        "id": "audit-001",
        "reviewer": "Sarah Chen",
        "taskType": "Arena",
        "status": "approved",
        "reviewTime": 6.2,
        "timestamp": "2024-01-30T10:30:00Z",
        "deviation": 0.2
      }
    ]
  }
}
```

## 🎨 Styling & Theming

### TailwindCSS Classes

The module uses a consistent design system:

```css
/* Card containers */
.analytics-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

/* Chart containers */
.chart-container {
  @apply h-80;
}

/* KPI value display */
.kpi-value {
  @apply text-3xl font-bold text-gray-900;
}
```

### Dark Mode Support

All charts are dark-mode compatible using conditional styling:

```tsx
<div className="dark:bg-gray-800 dark:text-white">{/* Chart content */}</div>
```

### Responsive Design

Grid layouts adapt to different screen sizes:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Responsive grid */}
</div>
```

## 📊 Chart Configuration

### Recharts Integration

All charts use recharts with consistent styling:

```tsx
// Common chart props
const commonProps = {
  margin: { top: 20, right: 30, bottom: 20, left: 20 },
  animationDuration: 1000,
};

// Color palette
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
```

### Custom Tooltips

All charts include custom tooltips:

```tsx
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        {/* Tooltip content */}
      </div>
    );
  }
  return null;
};
```

## 🧪 Testing

### Cypress Tests

Comprehensive E2E tests cover:

```typescript
// RBAC testing
it('should redirect non-platinum users to user analytics', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({ rank: 'gold' }));
  });
  cy.visit('/admin/analytics');
  cy.url().should('include', '/analytics');
});

// Chart rendering
it('should render all charts with valid data', () => {
  cy.get('[data-cy="skill-radar-chart"]').should('be.visible');
  cy.get('[data-cy="task-type-bar-chart"]').should('be.visible');
});

// Export functionality
it('should handle CSV export', () => {
  cy.get('[data-cy="export-csv"]').click();
});
```

### Test Coverage

- ✅ RBAC redirect functionality
- ✅ Chart rendering with valid data
- ✅ Export functionality (CSV/JSON)
- ✅ Loading and error states
- ✅ Responsive design
- ✅ Dark mode compatibility
- ✅ Accessibility features

## 🚀 Performance

### Optimization Strategies

1. **Memoized Components**: Expensive chart renders are memoized
2. **Lazy Loading**: Charts load on demand
3. **Efficient Re-renders**: Minimal state updates
4. **Debounced Interactions**: Prevents excessive API calls

### Bundle Size

- Core module: ~45KB (gzipped)
- Recharts dependency: ~120KB (gzipped)
- react-calendar-heatmap: ~15KB (gzipped)

## ♿ Accessibility

### ARIA Support

All interactive elements include proper ARIA labels:

```tsx
<button aria-label="Export analytics data as CSV" onClick={handleExport}>
  Download CSV
</button>
```

### Keyboard Navigation

- All buttons are keyboard accessible
- Charts support keyboard navigation
- Focus management for modals

### Screen Reader Support

- Loading states announced to screen readers
- Chart data available as table alternatives
- Proper heading hierarchy

## 🔧 Configuration

### Environment Variables

```env
# API endpoint for analytics data
ANALYTICS_API_ENDPOINT=/api/metrics

# Enable debug logging
ANALYTICS_DEBUG=true

# Export file size limits
MAX_EXPORT_SIZE=10000
```

### Default Settings

```typescript
// Hook configuration
const defaultConfig = {
  refreshInterval: 300000, // 5 minutes
  retryAttempts: 3,
  timeout: 10000,
};
```

## 🐛 Troubleshooting

### Common Issues

**Charts not rendering:**

```bash
# Check recharts installation
npm list recharts

# Verify data format
console.log('Chart data:', chartData);
```

**RBAC not working:**

```typescript
// Check user context
console.log('User rank:', user.rank);

// Verify navigation setup
import { useNavigate } from 'react-router-dom';
```

**Export not working:**

```typescript
// Check browser support
if (!('download' in document.createElement('a'))) {
  console.error('Browser does not support file downloads');
}
```

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
ANALYTICS_DEBUG = true;

// Or enable programmatically
localStorage.setItem('analytics:debug', 'true');
```

## 📚 Dependencies

### Core Dependencies

```json
{
  "react": "^18.0.0",
  "recharts": "^2.8.0",
  "react-calendar-heatmap": "^1.9.0",
  "lucide-react": "^0.263.1"
}
```

### Development Dependencies

```json
{
  "cypress": "^13.0.0",
  "@types/react": "^18.0.0",
  "typescript": "^5.0.0"
}
```

## 🔄 Migration Guide

### From v1.x to v2.x

```typescript
// Old API
import { Analytics } from '@/modules/analytics';

// New API
import { UserAnalytics, AdminAnalytics } from '@/modules/analytics';
```

### Breaking Changes

- Separated user and admin analytics into distinct pages
- Added RBAC requirement for admin features
- Changed export data format

## 🤝 Contributing

### Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test:e2e

# Type checking
npm run type-check
```

### Code Standards

- Use TypeScript for all new components
- Follow existing naming conventions
- Add comprehensive tests for new features
- Update documentation for any API changes

## 📄 License

This module is part of the CaBE platform and follows the same licensing terms.

---

**Analytics Module v2.0** - Built with ❤️ for the CaBE platform
