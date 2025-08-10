# CaBE Analytics UI Implementation

This document describes the dual-view Analytics UI implementation for CaBE Arena, providing both user and admin analytics views.

## 🏗️ Architecture Overview

### File Structure

```
frontend/src/
├── pages/
│   ├── analytics/index.tsx          # User analytics view
│   ├── admin/analytics.tsx          # Admin analytics view
│   └── dashboard.tsx                # Main dashboard with navigation
├── components/analytics/
│   ├── KPICards.tsx                 # KPI metrics cards
│   ├── SubmissionHeatmap.tsx        # Activity heatmap calendar
│   ├── SkillRadarChart.tsx          # Skills radar chart
│   ├── ActivityBarChart.tsx         # Activity breakdown chart
│   └── CategoryPieChart.tsx         # Category distribution chart
├── hooks/
│   └── useAnalytics.ts              # Analytics data management
├── types/
│   └── analytics.ts                 # TypeScript interfaces
└── App.tsx                          # Main routing configuration
```

## 🧱 User Analytics (`/analytics`)

### Features

1. **Activity Heatmap Calendar**
   - Daily task submissions visualization
   - Color-coded activity levels
   - Hover tooltips with detailed information

2. **Skills Radar Chart**
   - Points earned per skill area
   - Visual representation of skill distribution
   - Interactive tooltips

3. **Activity Bar Chart**
   - Monthly breakdown of Tasks vs Learning vs Gigs
   - Stacked bar visualization
   - Summary statistics

4. **Export Functionality**
   - CSV export of user data
   - Includes tasks, points, dates, and status

5. **Summary Cards**
   - Total points earned
   - Tasks completed
   - Current streak
   - Top performing skill

## 🧱 Admin Analytics (`/admin/analytics`)

### Features

1. **KPI Cards**
   - Daily audits count with trend indicators
   - Average review time metrics
   - Critical deviation rate monitoring

2. **Top Reviewers Table**
   - Reviewer performance metrics
   - Reviewed count, average latency, efficiency
   - Visual ranking indicators

3. **Category Pie Chart**
   - Task category distribution
   - Interactive segments with tooltips
   - Detailed breakdown

4. **Platform Statistics**
   - Total users count
   - Active reviewers
   - Pending reviews
   - Completion rate

5. **Critical Issues Alert**
   - Automatic detection of high deviation rates
   - Actionable recommendations

## 🛠️ Technical Implementation

### Data Management

- **Unified API Endpoint**: `GET /api/metrics`
- **Mock Data**: Comprehensive test data for development
- **Real-time Updates**: 5-minute refresh intervals
- **Error Handling**: Graceful fallbacks and retry mechanisms

### RBAC (Role-Based Access Control)

- **Platinum Users**: Full access to admin analytics
- **Non-Platinum Users**: Redirected to dashboard
- **Permission Checking**: Automatic validation on route access

### Chart Libraries

- **Recharts**: Primary charting library for all visualizations
- **Custom Heatmap**: Simplified CSS-based activity calendar
- **Responsive Design**: Mobile-friendly layouts

### Styling

- **Tailwind CSS**: Utility-first styling approach
- **Dark Mode Support**: Complete dark/light theme compatibility
- **Consistent Design**: Matches skill dashboard color palette
- **Soft Shadows**: Card-based layout with subtle depth

## 🎨 Design Guidelines

### Color Palette

- **Primary**: Blue (#3b82f6) - Tasks and main actions
- **Success**: Green (#10b981) - Learning modules
- **Warning**: Amber (#f59e0b) - Gig projects
- **Danger**: Red (#ef4444) - Critical issues
- **Neutral**: Gray scale for backgrounds and text

### Layout Principles

- **Grid System**: Responsive grid layouts
- **Card Design**: Soft shadows and rounded corners
- **Spacing**: Consistent 6-unit spacing system
- **Typography**: Clear hierarchy with proper contrast

## 🧪 Testing Strategy

### Manual Testing Checklist

- [ ] Load user analytics with test data
- [ ] Verify all chart renders correctly
- [ ] Test CSV export functionality
- [ ] Check admin route access as non-platinum user
- [ ] Verify redirect to dashboard
- [ ] Test responsive design on mobile
- [ ] Validate dark mode compatibility

### Test Routes

- `/analytics` - User analytics view
- `/admin/analytics` - Admin analytics view (platinum only)
- `/dashboard` - Main dashboard
- `/test` - Analytics test page

## 📊 Data Structure

### User Analytics Data

```typescript
interface UserAnalyticsData {
  heatmapData: Array<{ date: string; count: number }>;
  skillRadarData: Array<{ skill: string; points: number; fullMark: number }>;
  activityBarData: Array<{
    category: string;
    tasks: number;
    learning: number;
    gigs: number;
  }>;
  exportData: Array<{
    date: string;
    taskType: string;
    points: number;
    skill: string;
    status: string;
  }>;
  summary: {
    totalPoints: number;
    tasksCompleted: number;
    streak: number;
    topSkill: string;
  };
}
```

### Admin Analytics Data

```typescript
interface AdminAnalyticsData {
  kpiData: {
    dailyAudits: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    avgReviewTime: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    criticalDeviationRate: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  topReviewers: Array<{
    id: string;
    name: string;
    reviewedCount: number;
    avgLatency: number;
    efficiency: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
    color: string;
  }>;
  platformStats: {
    totalUsers: number;
    activeReviewers: number;
    pendingReviews: number;
    completionRate: number;
  };
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- React 18+
- TypeScript 5+

### Installation

```bash
# Install dependencies
npm install recharts lucide-react react-router-dom

# Start development server
npm run dev
```

### Available Routes

- `http://localhost:5173/` - Main dashboard
- `http://localhost:5173/analytics` - User analytics
- `http://localhost:5173/admin/analytics` - Admin analytics (platinum only)
- `http://localhost:5173/test` - Analytics test page

## 🔧 Configuration

### Environment Variables

- `VITE_API_BASE_URL` - API endpoint for metrics data
- `VITE_ENABLE_MOCK_DATA` - Enable/disable mock data

### Customization

- **Color Themes**: Modify color palette in `tailwind.config.js`
- **Chart Options**: Adjust chart configurations in individual components
- **Data Refresh**: Change refresh intervals in `useAnalytics.ts`

## 📈 Performance Considerations

- **Lazy Loading**: Components load on demand
- **Memoization**: React.memo for expensive chart components
- **Data Caching**: 5-minute cache for analytics data
- **Bundle Optimization**: Tree-shaking for chart libraries

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Filtering**: Date ranges and skill filters
- **Export Formats**: PDF and Excel export options
- **Custom Dashboards**: User-configurable layouts
- **Analytics Insights**: AI-powered recommendations

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add TypeScript types for new features
3. Include responsive design considerations
4. Test on multiple screen sizes
5. Update this documentation for new features

## 📝 License

This implementation is part of the CaBE Arena project and follows the same licensing terms.
