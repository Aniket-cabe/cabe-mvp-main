# Audit Dashboard API Simulator

## Overview

The **Audit Dashboard API Simulator** is a local mock API module that simulates all the API endpoints needed by the Arena Audit Dashboard frontend. This allows comprehensive testing of dashboard functionality without requiring a backend server.

## Features

### 🎯 **Core Functionality**

- **Complete API Simulation**: All dashboard endpoints simulated
- **Realistic Data**: 4 sample audit runs with varied submissions
- **Latency Simulation**: 300ms delay to mimic real API behavior
- **Type Safety**: Full TypeScript support with proper interfaces
- **Filtering & Search**: Comprehensive filtering capabilities
- **Statistics**: Built-in analytics and metrics

### 📊 **Mock Data Coverage**

- **4 Audit Runs**: 3 completed, 1 pending
- **18 Submissions**: 5-6 submissions per run
- **3 Reviewers**: admin-1, admin-2, admin-3
- **3 Skill Areas**: frontend, backend, design
- **4 Difficulty Levels**: easy, medium, hard, expert
- **All Deviation Types**: none, minor, major, critical
- **All Action Types**: allow, flag_for_review, escalate, override

## API Reference

### Types

```typescript
export interface AuditRunSummary {
  id: string;
  reviewer: string;
  taskTitle: string;
  skillArea: string;
  taskDifficulty: string;
  status: 'completed' | 'pending';
  startedAt: string;
  completedAt?: string;
}

export interface FullAuditRun extends AuditRunSummary {
  results: SubmissionAuditResult[];
}

export interface SubmissionAuditResult {
  submissionId: string;
  userId: string;
  userScore: number;
  aiScore: number;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  actionTaken?: string;
  notes?: string;
  timestamp: string;
}
```

### Core Functions

#### `getAuditRuns(): Promise<AuditRunSummary[]>`

Returns a list of all audit runs (summary data only).

**Example:**

```typescript
import { getAuditRuns } from '../src/utils/audit-dashboard-api';

const auditRuns = await getAuditRuns();
console.log(`Found ${auditRuns.length} audit runs`);
```

#### `getAuditRunById(id: string): Promise<FullAuditRun | null>`

Returns full audit run data including all submissions.

**Example:**

```typescript
import { getAuditRunById } from '../src/utils/audit-dashboard-api';

const auditRun = await getAuditRunById('run-001');
if (auditRun) {
  console.log(`Task: ${auditRun.taskTitle}`);
  console.log(`Submissions: ${auditRun.results.length}`);
}
```

#### `getAllReviewers(): Promise<string[]>`

Returns all unique reviewer names.

**Example:**

```typescript
import { getAllReviewers } from '../src/utils/audit-dashboard-api';

const reviewers = await getAllReviewers();
console.log('Reviewers:', reviewers); // ['admin-1', 'admin-2', 'admin-3']
```

### Filtering Functions

#### `getAuditRunsByReviewer(reviewer: string): Promise<AuditRunSummary[]>`

Filter audit runs by specific reviewer.

#### `getAuditRunsByStatus(status: 'completed' | 'pending'): Promise<AuditRunSummary[]>`

Filter audit runs by status.

#### `getAuditRunsBySkillArea(skillArea: string): Promise<AuditRunSummary[]>`

Filter audit runs by skill area.

#### `getAllSkillAreas(): Promise<string[]>`

Get all unique skill areas.

#### `getAllTaskDifficulties(): Promise<string[]>`

Get all unique task difficulty levels.

### Utility Functions

#### `getSubmissionAuditResult(submissionId: string): Promise<SubmissionAuditResult | null>`

Get specific submission audit result by ID.

#### `getAuditStatistics(): Promise<AuditStatistics>`

Get comprehensive audit statistics.

**Returns:**

```typescript
{
  totalRuns: number;
  completedRuns: number;
  pendingRuns: number;
  totalSubmissions: number;
  averageSubmissionsPerRun: number;
  reviewers: string[];
  skillAreas: string[];
}
```

#### `searchAuditRuns(query: string): Promise<AuditRunSummary[]>`

Search audit runs by task title, skill area, or reviewer name.

## Mock Data Details

### Audit Run 1: Frontend Navigation Bar

- **ID**: `run-001`
- **Reviewer**: `admin-1`
- **Task**: Build a responsive navigation bar
- **Skill Area**: frontend
- **Difficulty**: medium
- **Status**: completed
- **Submissions**: 5 (mix of deviation types)

### Audit Run 2: Backend Authentication

- **ID**: `run-002`
- **Reviewer**: `admin-2`
- **Task**: Implement user authentication system
- **Skill Area**: backend
- **Difficulty**: hard
- **Status**: completed
- **Submissions**: 6 (includes critical deviations)

### Audit Run 3: Design Landing Page

- **ID**: `run-003`
- **Reviewer**: `admin-3`
- **Task**: Design a landing page
- **Skill Area**: design
- **Difficulty**: easy
- **Status**: completed
- **Submissions**: 4 (mostly minor deviations)

### Audit Run 4: Backend REST API (Pending)

- **ID**: `run-004`
- **Reviewer**: `admin-1`
- **Task**: Build a REST API
- **Skill Area**: backend
- **Difficulty**: expert
- **Status**: pending
- **Submissions**: 3 (incomplete)

## Integration Examples

### Basic Frontend Integration

```typescript
// React component example
import React, { useState, useEffect } from 'react';
import { getAuditRuns, type AuditRunSummary } from '../src/utils/audit-dashboard-api';

function AuditDashboard() {
  const [auditRuns, setAuditRuns] = useState<AuditRunSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditRuns() {
      try {
        const runs = await getAuditRuns();
        setAuditRuns(runs);
      } catch (error) {
        console.error('Failed to load audit runs:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAuditRuns();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Audit Dashboard</h1>
      <div>
        {auditRuns.map(run => (
          <div key={run.id}>
            <h3>{run.taskTitle}</h3>
            <p>Reviewer: {run.reviewer}</p>
            <p>Status: {run.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Advanced Filtering

```typescript
import {
  getAuditRunsByReviewer,
  getAuditRunsByStatus,
  getAuditRunsBySkillArea,
} from '../src/utils/audit-dashboard-api';

// Filter by reviewer
const admin1Runs = await getAuditRunsByReviewer('admin-1');

// Filter by status
const completedRuns = await getAuditRunsByStatus('completed');
const pendingRuns = await getAuditRunsByStatus('pending');

// Filter by skill area
const backendRuns = await getAuditRunsBySkillArea('backend');
```

### Statistics Dashboard

```typescript
import { getAuditStatistics } from '../src/utils/audit-dashboard-api';

async function loadDashboardStats() {
  const stats = await getAuditStatistics();

  console.log('Dashboard Statistics:');
  console.log(`Total Runs: ${stats.totalRuns}`);
  console.log(`Completed: ${stats.completedRuns}`);
  console.log(`Pending: ${stats.pendingRuns}`);
  console.log(`Total Submissions: ${stats.totalSubmissions}`);
  console.log(
    `Avg Submissions/Run: ${stats.averageSubmissionsPerRun.toFixed(1)}`
  );
}
```

### Search Functionality

```typescript
import { searchAuditRuns } from '../src/utils/audit-dashboard-api';

// Search by task title
const navigationResults = await searchAuditRuns('navigation');

// Search by skill area
const backendResults = await searchAuditRuns('backend');

// Search by reviewer
const adminResults = await searchAuditRuns('admin-1');
```

## Testing

### Running Tests

```bash
# Run the test script
cd backend
npx tsx scripts/test-audit-dashboard-api.ts
```

### Test Coverage

The test suite verifies:

- ✅ All API functions work correctly
- ✅ Data retrieval and filtering
- ✅ Search functionality
- ✅ Statistics calculation
- ✅ Error handling for non-existent data
- ✅ Data validation
- ✅ Latency simulation
- ✅ Type safety

### Example Test Output

```
🧪 Testing Audit Dashboard API Simulator

1. Testing getAuditRuns()...
✅ Retrieved 4 audit runs

2. Testing getAuditRunById()...
✅ Retrieved audit run: Build a responsive navigation bar
   Submissions: 5
   Status: completed

3. Testing getAllReviewers()...
✅ Found 3 reviewers: ['admin-1', 'admin-2', 'admin-3']

...

🎉 All tests completed successfully!

Mock Data Summary:
   Total Audit Runs: 4
   Total Submissions: 18
   Reviewers: admin-1, admin-2, admin-3
   Skill Areas: frontend, backend, design
   Task Difficulties: easy, medium, hard, expert
   Status Distribution: 3 completed, 1 pending

Ready for frontend integration! 🚀
```

## Performance Characteristics

### Latency Simulation

- **All functions**: 300ms delay to simulate real API latency
- **Consistent timing**: Predictable response times for testing
- **Realistic behavior**: Mimics actual network conditions

### Data Size

- **Audit Runs**: 4 runs (small, manageable dataset)
- **Submissions**: 18 total submissions
- **Memory usage**: Minimal in-memory storage
- **Response size**: Optimized for frontend consumption

## Best Practices

### 1. Error Handling

```typescript
async function safeGetAuditRun(id: string) {
  try {
    const run = await getAuditRunById(id);
    if (!run) {
      throw new Error(`Audit run ${id} not found`);
    }
    return run;
  } catch (error) {
    console.error('Failed to get audit run:', error);
    return null;
  }
}
```

### 2. Loading States

```typescript
function useAuditRuns() {
  const [data, setData] = useState<AuditRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const runs = await getAuditRuns();
        setData(runs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
```

### 3. Caching

```typescript
// Simple in-memory cache
const cache = new Map<string, any>();

async function cachedGetAuditRun(id: string) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const run = await getAuditRunById(id);
  if (run) {
    cache.set(id, run);
  }

  return run;
}
```

## Migration to Real API

When ready to switch to a real backend:

1. **Replace imports**: Change from mock API to real API client
2. **Update endpoints**: Modify function calls to use actual URLs
3. **Handle authentication**: Add auth headers/tokens
4. **Error handling**: Update error handling for network issues
5. **Loading states**: Adjust for real network latency

### Example Migration

```typescript
// Before (mock API)
import { getAuditRuns } from '../src/utils/audit-dashboard-api';

// After (real API)
import { apiClient } from '../src/utils/api-client';

// Replace function calls
const runs = await getAuditRuns(); // Mock
const runs = await apiClient.get('/audit/runs'); // Real
```

## Future Enhancements

### Planned Features

- **Dynamic data generation**: Generate more varied mock data
- **Real-time updates**: Simulate real-time data changes
- **Pagination**: Add pagination support for large datasets
- **Advanced filtering**: More complex filter combinations
- **Export functionality**: Mock data export capabilities

### Integration Roadmap

- **React Query integration**: Optimize for React Query patterns
- **GraphQL simulation**: Mock GraphQL endpoints
- **WebSocket simulation**: Real-time data streaming
- **Offline support**: Local storage integration

## Support

For questions or issues with the Audit Dashboard API Simulator:

1. Check the test suite for examples
2. Review the integration examples
3. Validate your data structure usage
4. Contact the development team

---

**The Audit Dashboard API Simulator provides a complete, realistic testing environment for frontend development without backend dependencies.** 🚀✨
