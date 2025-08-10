# Arena API Routes

This document describes the Arena API routes for managing tasks, users, submissions, and arena statistics.

## 📁 File Structure

```
backend/src/
├── routes/
│   └── arena.ts           # Arena API routes
├── lib/
│   ├── supabase-utils.ts  # Database utility functions
│   └── supabase-admin.ts  # Supabase admin client
└── app.ts                 # Main application with mounted routes
```

## 🎯 API Endpoints

All Arena API routes are prefixed with `/api/arena`.

### Base URL

```
http://localhost:3001/api/arena
```

## 📋 Core Endpoints

### 1. GET /tasks

Fetches active Arena tasks with optional filters and pagination.

**URL:** `GET /api/arena/tasks`

**Query Parameters:**

- `limit` (number, optional, default: 20, max: 50): Number of tasks to return
- `offset` (number, optional, default: 0): Number of tasks to skip for pagination
- `skill` (string, optional): Filter by skill area (e.g., "frontend", "backend", "database", "algorithm", "system")

**Success Response (200):**

```json
{
  "success": true,
  "message": "Active tasks fetched successfully",
  "tasks": [
    {
      "id": "task-uuid-1",
      "title": "Build a Navbar",
      "description": "Create a responsive navbar using TailwindCSS",
      "skill_area": "frontend",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "task-uuid-2",
      "title": "API Authentication",
      "description": "Implement JWT authentication for REST API",
      "skill_area": "backend",
      "is_active": true,
      "created_at": "2024-01-02T00:00:00.000Z"
    },
    {
      "id": "task-uuid-3",
      "title": "Database Schema Design",
      "description": "Design normalized database schema for e-commerce",
      "skill_area": "database",
      "is_active": true,
      "created_at": "2024-01-03T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 134,
    "hasNextPage": true
  },
  "filters": {
    "skill": null
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "skillFilter": "none",
    "dataPoints": {
      "tasks": 3,
      "totalTasks": 134
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Example Response with Skill Filter:**

```json
{
  "success": true,
  "message": "Active tasks fetched successfully",
  "tasks": [
    {
      "id": "task-uuid-1",
      "title": "Build a Navbar",
      "description": "Create a responsive navbar using TailwindCSS",
      "skill_area": "frontend",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "task-uuid-4",
      "title": "React Component Library",
      "description": "Build a reusable component library with Storybook",
      "skill_area": "frontend",
      "is_active": true,
      "created_at": "2024-01-04T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45,
    "hasNextPage": true
  },
  "filters": {
    "skill": "frontend"
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "skillFilter": "frontend",
    "dataPoints": {
      "tasks": 2,
      "totalTasks": 45
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Example Response with Pagination:**

```json
{
  "success": true,
  "message": "Active tasks fetched successfully",
  "tasks": [
    {
      "id": "task-uuid-21",
      "title": "Advanced Algorithm Implementation",
      "description": "Implement Dijkstra's shortest path algorithm",
      "skill_area": "algorithm",
      "is_active": true,
      "created_at": "2024-01-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 20,
    "total": 134,
    "hasNextPage": true
  },
  "filters": {
    "skill": null
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "skillFilter": "none",
    "dataPoints": {
      "tasks": 1,
      "totalTasks": 134
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Invalid Parameters:**

```json
{
  "success": false,
  "error": "Limit must be a number between 1 and 50",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Offset must be a non-negative number",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch tasks",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

#### 📋 Task Features

**Active Status Filtering:**

- **Only Active Tasks**: Returns only tasks where `is_active = true`
- **Status Validation**: Ensures only available tasks are shown to users
- **Database Filtering**: Efficient filtering at the database level

**Skill Area Filtering:**

- **Skill Filter**: Filter tasks by specific skill areas
- **Valid Skills**: frontend, backend, database, algorithm, system
- **No Filter**: Show all active tasks across all skill areas
- **Dynamic Counts**: Accurate pagination counts for filtered results

**Pagination Support:**

- **Limit Control**: Control number of results per page (1-50)
- **Offset Support**: Skip results for pagination
- **Total Count**: Total number of active tasks matching criteria
- **Next Page Indicator**: Boolean flag for pagination navigation

**Sorting:**

- **Creation Date**: Tasks sorted by `created_at` in descending order
- **Latest First**: Most recently created tasks appear first
- **Consistent Ordering**: Stable sorting for pagination

**Response Structure:**

- **Tasks Array**: List of active tasks with full details
- **Pagination Info**: Limit, offset, total count, and next page flag
- **Filter Info**: Applied skill filter (if any)
- **Metadata**: Calculation timestamp and data point counts

### 2. GET /task/:id/summary

Fetches comprehensive summary of a single task including metadata and aggregate statistics.

**URL:** `GET /api/arena/task/:id/summary`

**Path Parameters:**

- `id` (string, required): Task ID to fetch summary for

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task summary fetched successfully",
  "task": {
    "id": "task-uuid-1",
    "title": "Create a responsive navbar",
    "description": "Build a responsive navigation bar using modern CSS techniques",
    "skill_area": "frontend",
    "created_at": "2024-01-01T00:00:00.000Z",
    "is_active": true
  },
  "stats": {
    "total_submissions": 25,
    "total_users": 20,
    "scored_submissions": 18,
    "average_score": 82.5,
    "top_score": 95,
    "lowest_score": 65,
    "last_submission_at": "2024-01-15T14:30:00.000Z",
    "top_performers": [
      {
        "user_id": "user-uuid-1",
        "username": "jane",
        "email": "jane@example.com",
        "score": 95,
        "submitted_at": "2024-01-10T09:15:00.000Z",
        "scored_at": "2024-01-10T10:30:00.000Z"
      },
      {
        "user_id": "user-uuid-2",
        "username": "john",
        "email": "john@example.com",
        "score": 92,
        "submitted_at": "2024-01-12T11:20:00.000Z",
        "scored_at": "2024-01-12T12:45:00.000Z"
      },
      {
        "user_id": "user-uuid-3",
        "username": "alice",
        "email": "alice@example.com",
        "score": 88,
        "submitted_at": "2024-01-08T16:45:00.000Z",
        "scored_at": "2024-01-08T18:00:00.000Z"
      }
    ]
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "task_id": "task-uuid-1",
    "dataPoints": {
      "totalSubmissions": 25,
      "totalUsers": 20,
      "scoredSubmissions": 18,
      "topPerformers": 3
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Task ID:**

```json
{
  "success": false,
  "error": "Task ID is required",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**404 Not Found - Task Not Found:**

```json
{
  "success": false,
  "error": "Task not found",
  "task_id": "invalid-uuid",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch task summary",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

#### 📊 Task Summary Features

**Comprehensive Task Information:**

- **Task Details**: Complete task metadata including title, description, skill area
- **Active Status**: Shows whether the task is currently active
- **Creation Date**: When the task was created

**Submission Statistics:**

- **Total Submissions**: Count of all active submissions (excluding soft-deleted)
- **Total Users**: Number of unique users who submitted to this task
- **Scored Submissions**: Count of submissions that have been scored
- **Average Score**: Mean score across all scored submissions (rounded to 2 decimal places)

**Performance Metrics:**

- **Top Score**: Highest score achieved on this task
- **Lowest Score**: Lowest score achieved on this task
- **Last Submission**: Timestamp of the most recent submission

**Top Performers:**

- **Top 3 Users**: Best performing users with their scores
- **User Details**: Username, email, and submission timestamps
- **Score Ranking**: Sorted by score in descending order
- **Only Scored Submissions**: Only includes submissions that have been scored

**Data Integrity:**

- **Soft-Delete Exclusion**: Automatically excludes soft-deleted submissions
- **Null Safety**: Handles missing scores and user data gracefully
- **Type Safety**: Proper validation and error handling

**Example Usage:**

**Using curl:**

```bash
# Get task summary
curl "http://localhost:3001/api/arena/task/task-uuid-1/summary"

# Get summary for different task
curl "http://localhost:3001/api/arena/task/task-uuid-2/summary"
```

**Using JavaScript:**

```javascript
// Get task summary
const response = await fetch(
  'http://localhost:3001/api/arena/task/task-uuid-1/summary'
);
const data = await response.json();

if (data.success) {
  console.log(`Task: ${data.task.title}`);
  console.log(`Total Submissions: ${data.stats.total_submissions}`);
  console.log(`Average Score: ${data.stats.average_score}`);
  console.log(`Top Score: ${data.stats.top_score}`);

  console.log('Top Performers:');
  data.stats.top_performers.forEach((performer, index) => {
    console.log(`${index + 1}. ${performer.username} - ${performer.score}`);
  });
} else {
  console.error(`Error: ${data.error}`);
}
```

### 3. GET /users

Fetches all users from the database.

**URL:** `GET /api/arena/users`

**Response:**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "count": 2,
  "users": [
    {
      "id": "uuid-here",
      "email": "user@example.com",
      "points": 100,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. GET /submissions

Fetches user's own submissions with optional filters and pagination.

**URL:** `GET /api/arena/submissions`

**Query Parameters:**

- `user_id` (string, required): User ID to fetch submissions for (TODO: Will be extracted from JWT token in production)
- `limit` (number, optional, default: 20, max: 50): Number of submissions to return
- `offset` (number, optional, default: 0): Number of submissions to skip for pagination
- `status` (string, optional): Filter by submission status (pending, scored, flagged, deleted)
- `skill` (string, optional): Filter by skill area (frontend, backend, database, algorithm, system)

**Success Response (200):**

```json
{
  "success": true,
  "message": "User submissions fetched successfully",
  "submissions": [
    {
      "id": "submission-uuid-1",
      "user_id": "user-uuid-here",
      "task_id": "task-uuid-1",
      "status": "scored",
      "score": 85,
      "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
      "feedback": "Great work! The code is well-structured and follows best practices.",
      "proof": "https://github.com/user/react-component-repo",
      "submitted_at": "2024-01-15T10:30:00.000Z",
      "edited_at": null,
      "flagged_reason": null,
      "flagged_at": null,
      "deleted_at": null,
      "isFlagged": false,
      "flaggedReason": null,
      "flaggedAt": null,
      "tasks": {
        "id": "task-uuid-1",
        "title": "Build React Component",
        "description": "Create a reusable button component with TypeScript",
        "skill_area": "frontend",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    },
    {
      "id": "submission-uuid-2",
      "user_id": "user-uuid-here",
      "task_id": "task-uuid-2",
      "status": "pending",
      "score": null,
      "breakdown": null,
      "feedback": null,
      "proof": "https://github.com/user/api-endpoint-repo",
      "submitted_at": "2024-01-16T14:20:00.000Z",
      "edited_at": null,
      "flagged_reason": null,
      "flagged_at": null,
      "deleted_at": null,
      "isFlagged": false,
      "flaggedReason": null,
      "flaggedAt": null,
      "tasks": {
        "id": "task-uuid-2",
        "title": "API Authentication",
        "description": "Implement JWT authentication for REST API",
        "skill_area": "backend",
        "created_at": "2024-01-02T00:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 15,
    "hasNextPage": false
  },
  "filters": {
    "status": null,
    "skill": null
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "user_id": "user-uuid-here",
    "statusFilter": "none",
    "skillFilter": "none",
    "dataPoints": {
      "submissions": 2,
      "totalSubmissions": 15
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Example Response with Status Filter:**

```json
{
  "success": true,
  "message": "User submissions fetched successfully",
  "submissions": [
    {
      "id": "submission-uuid-1",
      "user_id": "user-uuid-here",
      "task_id": "task-uuid-1",
      "status": "scored",
      "score": 85,
      "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
      "feedback": "Great work! The code is well-structured and follows best practices.",
      "proof": "https://github.com/user/react-component-repo",
      "submitted_at": "2024-01-15T10:30:00.000Z",
      "edited_at": null,
      "flagged_reason": null,
      "flagged_at": null,
      "deleted_at": null,
      "isFlagged": false,
      "flaggedReason": null,
      "flaggedAt": null,
      "tasks": {
        "id": "task-uuid-1",
        "title": "Build React Component",
        "description": "Create a reusable button component with TypeScript",
        "skill_area": "frontend",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 8,
    "hasNextPage": false
  },
  "filters": {
    "status": "scored",
    "skill": null
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "user_id": "user-uuid-here",
    "statusFilter": "scored",
    "skillFilter": "none",
    "dataPoints": {
      "submissions": 1,
      "totalSubmissions": 8
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Example Response with Skill Filter:**

```json
{
  "success": true,
  "message": "User submissions fetched successfully",
  "submissions": [
    {
      "id": "submission-uuid-1",
      "user_id": "user-uuid-here",
      "task_id": "task-uuid-1",
      "status": "scored",
      "score": 85,
      "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
      "feedback": "Great work! The code is well-structured and follows best practices.",
      "proof": "https://github.com/user/react-component-repo",
      "submitted_at": "2024-01-15T10:30:00.000Z",
      "edited_at": null,
      "flagged_reason": null,
      "flagged_at": null,
      "deleted_at": null,
      "isFlagged": false,
      "flaggedReason": null,
      "flaggedAt": null,
      "tasks": {
        "id": "task-uuid-1",
        "title": "Build React Component",
        "description": "Create a reusable button component with TypeScript",
        "skill_area": "frontend",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 5,
    "hasNextPage": false
  },
  "filters": {
    "status": null,
    "skill": "frontend"
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "user_id": "user-uuid-here",
    "statusFilter": "none",
    "skillFilter": "frontend",
    "dataPoints": {
      "submissions": 1,
      "totalSubmissions": 5
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Invalid Parameters:**

```json
{
  "success": false,
  "error": "Limit must be a number between 1 and 50",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Offset must be a non-negative number",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Status must be one of: pending, scored, flagged, deleted",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Skill must be one of: frontend, backend, database, algorithm, system",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch user submissions",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

#### 📝 User Submissions Features

**Security & Access Control:**

- **User-Specific**: Users can only access their own submissions
- **Token-Based**: In production, user_id will be extracted from JWT token
- **Self-Access**: Designed for users to view their own submission history
- **Data Isolation**: Complete separation between user data

**Status Filtering:**

- **Pending**: Submissions awaiting scoring
- **Scored**: Submissions that have been evaluated
- **Flagged**: Submissions flagged for manual review
- **Deleted**: Soft-deleted submissions (excluded by default)
- **Default Behavior**: Excludes soft-deleted submissions unless explicitly requested

**Skill Area Filtering:**

- **Frontend**: React, Vue, Angular, CSS, UI/UX tasks
- **Backend**: API development, server-side logic
- **Database**: Schema design, query optimization
- **Algorithm**: Data structures, algorithms, problem-solving
- **System**: System design, architecture, scalability

**Pagination Support:**

- **Limit Control**: Control number of results per page (1-50)
- **Offset Support**: Skip results for pagination
- **Total Count**: Total number of user submissions matching criteria
- **Next Page Indicator**: Boolean flag for pagination navigation

**Sorting:**

- **Submission Date**: Submissions sorted by `submitted_at` in descending order
- **Latest First**: Most recently submitted items appear first
- **Consistent Ordering**: Stable sorting for pagination

**Response Structure:**

- **Submissions Array**: List of user submissions with full details
- **Pagination Info**: Limit, offset, total count, and next page flag
- **Filter Info**: Applied status and skill filters
- **Metadata**: Calculation timestamp, user ID, and data point counts

### 5. GET /submission/:id

Fetches a single submission by ID with full metadata.

**URL:** `GET /api/arena/submission/:id`

**URL Parameters:**

- `id` (string, required): The UUID of the submission to fetch

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission fetched successfully",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "scored",
    "score": 85,
    "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
    "feedback": "Great structure, clean code, well-commented.",
    "flagged_reason": null,
    "flagged_at": null,
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "isFlagged": false,
    "flaggedReason": null,
    "flaggedAt": null
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 185,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "metadata": {
    "isFlagged": false,
    "hasScore": true,
    "hasFeedback": true,
    "hasBreakdown": true,
    "daysSinceSubmission": 2
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Response for Flagged Submission:**

```json
{
  "success": true,
  "message": "Submission fetched successfully",
  "submission": {
    "id": "flagged-submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "flagged",
    "score": null,
    "breakdown": null,
    "feedback": null,
    "flagged_reason": "AI scoring failed - ambiguous task requirements",
    "flagged_at": "2024-01-01T12:00:00.000Z",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "isFlagged": true,
    "flaggedReason": "AI scoring failed - ambiguous task requirements",
    "flaggedAt": "2024-01-01T12:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "metadata": {
    "isFlagged": true,
    "hasScore": false,
    "hasFeedback": false,
    "hasBreakdown": false,
    "daysSinceSubmission": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing ID:**

```json
{
  "success": false,
  "error": "Submission ID is required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "submission_id": "non-existent-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 📊 Response Fields

**Submission Object:**

- **`id`** (string): Submission UUID
- **`user_id`** (string): User UUID
- **`task_id`** (string): Task UUID
- **`status`** (string): Submission status ("pending", "scored", "flagged")
- **`score`** (number | null): Submission score (0-100) if scored
- **`breakdown`** (string | null): AI scoring breakdown if available
- **`feedback`** (string | null): AI feedback if available
- **`flagged_reason`** (string | null): Reason for flagging if flagged
- **`flagged_at`** (string | null): Timestamp when flagged
- **`submitted_at`** (string): Submission timestamp
- **`isFlagged`** (boolean): Flag status indicator
- **`flaggedReason`** (string | null): Flag reason (convenience field)
- **`flaggedAt`** (string | null): Flag timestamp (convenience field)

**User Object:**

- **`id`** (string): User UUID
- **`email`** (string): User email address
- **`points`** (number): User's total points
- **`created_at`** (string): User creation timestamp

**Task Object:**

- **`id`** (string): Task UUID
- **`title`** (string): Task title
- **`description`** (string): Task description
- **`skill_area`** (string): Task skill area
- **`created_at`** (string): Task creation timestamp

**Metadata Object:**

- **`isFlagged`** (boolean): Whether submission is flagged
- **`hasScore`** (boolean): Whether submission has a score
- **`hasFeedback`** (boolean): Whether submission has feedback
- **`hasBreakdown`** (boolean): Whether submission has breakdown
- **`daysSinceSubmission`** (number): Days since submission was created

### 6. POST /submit

Submit a task for review.

**URL:** `POST /api/arena/submit`

**Request Body:**

```json
{
  "user_id": "user-uuid-here",
  "task_id": "task-uuid-here",
  "description": "Optional description of the submission",
  "proof": "https://github.com/user/repo or base64-encoded content"
}
```

**Required Fields:**

- `user_id` (string): The UUID of the user submitting
- `task_id` (string): The UUID of the task being submitted
- `proof` (string): Link or base64-encoded proof of completion

**Optional Fields:**

- `description` (string): Additional description of the submission

**Success Response (201):**

```json
{
  "success": true,
  "message": "Task submission created successfully",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "pending",
    "submitted_at": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "skill_area": "frontend"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "user_id, task_id, and proof are required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - User/Task Not Found:**

```json
{
  "success": false,
  "error": "User not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Duplicate Submission:**

```json
{
  "success": false,
  "error": "Submission already exists for this user and task",
  "submissionId": "existing-submission-uuid",
  "status": "pending",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to create submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 7. POST /auto-score

Automatically score a submission using AI.

**URL:** `POST /api/arena/auto-score`

**Request Body:**

```json
{
  "submission_id": "submission-uuid-here"
}
```

**Required Fields:**

- `submission_id` (string): The UUID of the submission to auto-score

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission auto-scored and user points updated",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "scored",
    "score": 85,
    "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
    "feedback": "Great structure, clean code, well-commented.",
    "submitted_at": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 185,
    "pointsAdded": 85,
    "previousPoints": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component",
    "skill_area": "frontend"
  },
  "detailedScore": {
    "score": 85,
    "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
    "feedback": "Great structure, clean code, well-commented."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "submission_id is required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**400 Bad Request - Missing Data:**

```json
{
  "success": false,
  "error": "Submission missing task title or user code",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Submission already scored",
  "currentScore": 85,
  "currentStatus": "scored",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to auto-score submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 8. POST /score

Score a submission and update user points.

**URL:** `POST /api/arena/score`

**Request Body:**

```json
{
  "submission_id": "submission-uuid-here",
  "score": 85,
  "status": "scored"
}
```

**Required Fields:**

- `submission_id` (string): The UUID of the submission to score
- `score` (number): The score to assign (0-100)

**Optional Fields:**

- `status` (string): The status to set (defaults to "scored")

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission scored and user points updated",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "scored",
    "score": 85,
    "submitted_at": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 185,
    "pointsAdded": 85,
    "previousPoints": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "skill_area": "frontend"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "submission_id and score are required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**400 Bad Request - Invalid Score:**

```json
{
  "success": false,
  "error": "Score must be a number between 0 and 100",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Submission already scored",
  "currentScore": 85,
  "currentStatus": "scored",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to score submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 9. POST /review-flag

Flag a submission for manual review.

**URL:** `POST /api/arena/review-flag`

**Request Body:**

```json
{
  "submission_id": "submission-uuid-here",
  "reason": "AI scoring failed - ambiguous task requirements"
}
```

**Required Fields:**

- `submission_id` (string): The UUID of the submission to flag

**Optional Fields:**

- `reason` (string): Reason for flagging (defaults to "Manual review requested")

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission flagged for manual review",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "flagged",
    "flagged_reason": "AI scoring failed - ambiguous task requirements",
    "flagged_at": "2024-01-01T00:00:00.000Z",
    "submitted_at": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component",
    "skill_area": "frontend"
  },
  "flagDetails": {
    "reason": "AI scoring failed - ambiguous task requirements",
    "flaggedAt": "2024-01-01T00:00:00.000Z",
    "previousStatus": "pending"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "submission_id is required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Flagged:**

```json
{
  "success": false,
  "error": "Submission already flagged for review",
  "currentStatus": "flagged",
  "flaggedReason": "Previous flag reason",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Cannot flag already scored submission",
  "currentStatus": "scored",
  "currentScore": 85,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to flag submission for review",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 10. POST /manual-score

Manually score a flagged submission (admin only).

**URL:** `POST /api/arena/manual-score`

**Request Body:**

```json
{
  "submission_id": "flagged-submission-uuid-here",
  "score": 85,
  "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
  "feedback": "Great work! The code is well-structured and follows best practices."
}
```

**Required Fields:**

- `submission_id` (string): The UUID of the flagged submission to score
- `score` (number): The manual score to assign (0-100)

**Optional Fields:**

- `breakdown` (string): Detailed scoring breakdown
- `feedback` (string): Manual review feedback

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission manually scored and user points updated",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "scored",
    "score": 85,
    "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
    "feedback": "Great work! The code is well-structured and follows best practices.",
    "flagged_reason": "AI scoring failed - ambiguous task requirements",
    "flagged_at": "2024-01-01T12:00:00.000Z",
    "reviewed_at": "2024-01-01T14:00:00.000Z",
    "submitted_at": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 185,
    "pointsAdded": 85,
    "previousPoints": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "reviewDetails": {
    "score": 85,
    "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
    "feedback": "Great work! The code is well-structured and follows best practices.",
    "reviewedAt": "2024-01-01T14:00:00.000Z",
    "previousStatus": "flagged",
    "flagReason": "AI scoring failed - ambiguous task requirements"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "submission_id and score are required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**400 Bad Request - Invalid Score:**

```json
{
  "success": false,
  "error": "Score must be a number between 0 and 100",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "submission_id": "non-existent-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Not Flagged:**

```json
{
  "success": false,
  "error": "Can only manually score flagged submissions",
  "currentStatus": "pending",
  "expectedStatus": "flagged",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Submission already scored",
  "currentScore": 85,
  "currentStatus": "scored",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to manually score submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 📊 Manual Scoring Workflow

**Prerequisites:**

1. Submission must be flagged for review
2. Submission must not be already scored
3. Admin must have proper permissions

**Process:**

1. **Validation**: Check submission exists and is flagged
2. **Scoring**: Assign manual score (0-100)
3. **Documentation**: Add breakdown and feedback
4. **Status Update**: Change from "flagged" to "scored"
5. **Points Update**: Add score to user's total points
6. **Audit Trail**: Record review timestamp and details

**Response Fields:**

- **Submission**: Updated submission with score, breakdown, feedback
- **User**: Updated user with new points total
- **Task**: Related task information
- **Review Details**: Complete review audit trail

#### 🚩 Common Flag Reasons

**AI Scoring Issues:**

- `"AI scoring failed - ambiguous task requirements"`
- `"AI scoring failed - code too complex for automated evaluation"`
- `"AI scoring failed - network timeout"`
- `"AI scoring failed - API rate limit exceeded"`
- `"AI scoring failed - invalid response format"`

**Task Ambiguity:**

- `"Task requirements unclear - needs clarification"`
- `"Task scope too broad - requires human judgment"`
- `"Task involves subjective evaluation criteria"`
- `"Task requires domain-specific knowledge"`

**Code Quality Issues:**

- `"Code submission incomplete"`
- `"Code contains security vulnerabilities"`
- `"Code violates best practices"`
- `"Code requires manual security review"`

**User Requests:**

- `"User requested manual review"`
- `"User disputes AI score"`
- `"User provided additional context"`
- `"User requested clarification"`

**System Issues:**

- `"Database connection error during scoring"`
- `"System maintenance required"`
- `"Unexpected error during processing"`
- `"Manual review required due to system issue"`

#### 🔄 Review Workflow

1. **Submission Status Flow:**

   ```
   pending → flagged → reviewed → scored
   ```

2. **Flagging Triggers:**
   - AI scoring failure
   - User request for manual review
   - System detects ambiguous content
   - Quality assurance requirements

3. **Review Process:**
   - Admin reviews flagged submission
   - Manual scoring applied
   - Status updated to "scored"
   - User points updated

4. **Audit Trail:**
   - All flag actions logged
   - Reason and timestamp recorded
   - Previous status preserved
   - Full submission history maintained

### 11. PATCH /submission/edit

Edit a submission (only if not scored yet).

**URL:** `PATCH /api/arena/submission/edit`

**Request Body:**

```json
{
  "submission_id": "submission-uuid-here",
  "new_content": "https://github.com/user/updated-repo or updated code content"
}
```

**Required Fields:**

- `submission_id` (string): The UUID of the submission to edit
- `new_content` (string): Updated content (URL, code, or text)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission content updated successfully",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "pending",
    "proof": "https://github.com/user/updated-repo",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "edited_at": "2024-01-01T15:00:00.000Z",
    "flagged_reason": null,
    "flagged_at": null
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "editDetails": {
    "previousContentLength": 45,
    "newContentLength": 52,
    "editedAt": "2024-01-01T15:00:00.000Z",
    "currentStatus": "pending",
    "isFlagged": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Response for Flagged Submission:**

```json
{
  "success": true,
  "message": "Submission content updated successfully",
  "submission": {
    "id": "flagged-submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "flagged",
    "proof": "Updated code content with improvements",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "edited_at": "2024-01-01T15:00:00.000Z",
    "flagged_reason": "AI scoring failed - ambiguous task requirements",
    "flagged_at": "2024-01-01T12:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "editDetails": {
    "previousContentLength": 120,
    "newContentLength": 150,
    "editedAt": "2024-01-01T15:00:00.000Z",
    "currentStatus": "flagged",
    "isFlagged": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "submission_id and new_content are required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "submission_id": "non-existent-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Cannot edit already scored submission",
  "currentStatus": "scored",
  "currentScore": 85,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Invalid Status:**

```json
{
  "success": false,
  "error": "Can only edit submissions with status \"pending\" or \"flagged\"",
  "currentStatus": "reviewing",
  "allowedStatuses": ["pending", "flagged"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to edit submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 📊 Submission Editing Rules

**Editable States:**

- **`pending`**: Submission is waiting for scoring
- **`flagged`**: Submission is flagged for manual review

**Non-Editable States:**

- **`scored`**: Submission has been scored (final state)

**Content Types Supported:**

- **URLs**: GitHub repository links, file sharing links
- **Code**: Direct code content
- **Text**: Written explanations or documentation

**Update Behavior:**

- **Content Update**: Replaces existing `proof` field
- **Timestamp**: Updates `edited_at` timestamp
- **Status Preservation**: Maintains current submission status
- **Audit Trail**: Logs content change details

### 12. DELETE /submission/delete

Soft delete a submission (only if pending or flagged).

**URL:** `DELETE /api/arena/submission/delete`

**Request Body:**

```json
{
  "submission_id": "submission-uuid-here"
}
```

**Required Fields:**

- `submission_id` (string): The UUID of the submission to delete

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission deleted successfully",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "pending",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": "2024-01-01T16:00:00.000Z",
    "flagged_reason": null,
    "flagged_at": null
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "deletionDetails": {
    "deletedAt": "2024-01-01T16:00:00.000Z",
    "previousStatus": "pending",
    "wasFlagged": false,
    "flagReason": null
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Response for Flagged Submission:**

```json
{
  "success": true,
  "message": "Submission deleted successfully",
  "submission": {
    "id": "flagged-submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "flagged",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": "2024-01-01T16:00:00.000Z",
    "flagged_reason": "AI scoring failed - ambiguous task requirements",
    "flagged_at": "2024-01-01T12:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "deletionDetails": {
    "deletedAt": "2024-01-01T16:00:00.000Z",
    "previousStatus": "flagged",
    "wasFlagged": true,
    "flagReason": "AI scoring failed - ambiguous task requirements"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "submission_id is required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "submission_id": "non-existent-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Deleted:**

```json
{
  "success": false,
  "error": "Submission already deleted",
  "deletedAt": "2024-01-01T15:00:00.000Z",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Cannot delete already scored submission",
  "currentStatus": "scored",
  "currentScore": 85,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Invalid Status:**

```json
{
  "success": false,
  "error": "Can only delete submissions with status \"pending\" or \"flagged\"",
  "currentStatus": "reviewing",
  "allowedStatuses": ["pending", "flagged"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to delete submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 📊 Submission Deletion Rules

**Deletable States:**

- **`pending`**: Submission is waiting for scoring
- **`flagged`**: Submission is flagged for manual review

**Non-Deletable States:**

- **`scored`**: Submission has been scored (final state)
- **`deleted`**: Submission is already soft deleted

**Soft Delete Behavior:**

- **Data Preservation**: Submission remains in database
- **Timestamp Update**: Sets `deleted_at` timestamp
- **Status Preservation**: Maintains current submission status
- **Audit Trail**: Logs deletion details and metadata

**Authorization Requirements:**

- **User Ownership**: Users can only delete their own submissions
- **Admin Override**: Admins can delete any submission (future enhancement)
- **Audit Logging**: All deletion actions are logged for compliance

### 13. PATCH /submission/restore

Restore a soft-deleted submission.

**URL:** `PATCH /api/arena/submission/restore`

**Request Body:**

```json
{
  "submission_id": "submission-uuid-here"
}
```

**Required Fields:**

- `submission_id` (string): The UUID of the soft-deleted submission to restore

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission restored successfully",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "pending",
    "proof": "https://github.com/user/repo",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "edited_at": "2024-01-01T15:00:00.000Z",
    "deleted_at": null,
    "flagged_reason": null,
    "flagged_at": null
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "restoreDetails": {
    "restoredAt": "2024-01-01T17:00:00.000Z",
    "previousDeletedAt": "2024-01-01T16:00:00.000Z",
    "currentStatus": "pending",
    "wasFlagged": false,
    "flagReason": null,
    "daysDeleted": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Response for Flagged Submission:**

```json
{
  "success": true,
  "message": "Submission restored successfully",
  "submission": {
    "id": "flagged-submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "flagged",
    "proof": "Updated code content with improvements",
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "edited_at": "2024-01-01T15:00:00.000Z",
    "deleted_at": null,
    "flagged_reason": "AI scoring failed - ambiguous task requirements",
    "flagged_at": "2024-01-01T12:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "restoreDetails": {
    "restoredAt": "2024-01-01T17:00:00.000Z",
    "previousDeletedAt": "2024-01-01T16:00:00.000Z",
    "currentStatus": "flagged",
    "wasFlagged": true,
    "flagReason": "AI scoring failed - ambiguous task requirements",
    "daysDeleted": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
  "success": false,
  "error": "submission_id is required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "submission_id": "non-existent-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Cannot restore already scored submission",
  "currentStatus": "scored",
  "currentScore": 85,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**409 Conflict - Not Soft-Deleted:**

```json
{
  "success": false,
  "error": "Submission is not soft-deleted",
  "currentStatus": "pending",
  "deletedAt": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to restore submission",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 📊 Submission Restoration Rules

**Restorable States:**

- **`pending`**: Submission was pending when deleted
- **`flagged`**: Submission was flagged when deleted

**Non-Restorable States:**

- **`scored`**: Submission has been scored (final state)

**Restoration Behavior:**

- **Data Preservation**: All submission data is preserved
- **Timestamp Update**: Sets `deleted_at` to `null`
- **Status Preservation**: Maintains original submission status
- **Audit Trail**: Logs restoration details and metadata

**Restoration Requirements:**

- **Soft-Deleted**: Submission must have `deleted_at` timestamp
- **Not Scored**: Cannot restore already scored submissions
- **Data Integrity**: All original data is preserved during restoration

### 14. GET /submission/:id/history

Fetch complete submission lifecycle history.

**URL:** `GET /api/arena/submission/:id/history`

**URL Parameters:**

- `id` (string, required): The UUID of the submission to fetch history for

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission history fetched successfully",
  "submission": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "scored",
    "score": 85,
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "edited_at": "2024-01-01T15:00:00.000Z",
    "flagged_at": "2024-01-01T12:00:00.000Z",
    "flagged_reason": "AI scoring failed - ambiguous task requirements",
    "deleted_at": null,
    "reviewed_at": "2024-01-01T14:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 185
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "history": [
    {
      "event": "submission_created",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "description": "Task submission created",
      "details": {
        "status": "pending",
        "proof": "https://github.com/user/initial-repo",
        "description": "Initial submission"
      },
      "metadata": {
        "daysAgo": 2
      }
    },
    {
      "event": "content_edited",
      "timestamp": "2024-01-01T15:00:00.000Z",
      "description": "Submission content was edited",
      "details": {
        "proof": "https://github.com/user/improved-repo",
        "hasDescription": true
      },
      "metadata": {
        "daysAgo": 1,
        "daysAfterSubmission": 1
      }
    },
    {
      "event": "review_flagged",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "description": "Submission flagged for manual review",
      "details": {
        "reason": "AI scoring failed - ambiguous task requirements",
        "status": "flagged"
      },
      "metadata": {
        "daysAgo": 1,
        "daysAfterSubmission": 1
      }
    },
    {
      "event": "manually_reviewed",
      "timestamp": "2024-01-01T14:00:00.000Z",
      "description": "Submission manually reviewed and scored",
      "details": {
        "score": 85,
        "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
        "feedback": "Great work! The code is well-structured and follows best practices.",
        "status": "scored",
        "previousStatus": "flagged"
      },
      "metadata": {
        "daysAgo": 1,
        "daysAfterSubmission": 1
      }
    }
  ],
  "lifecycleStats": {
    "totalEvents": 4,
    "currentStatus": "scored",
    "isDeleted": false,
    "isFlagged": false,
    "isScored": true,
    "hasEdits": true,
    "hasFlags": true,
    "hasManualReview": true,
    "daysSinceSubmission": 2,
    "daysDeleted": 0
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Response for Deleted Submission:**

```json
{
  "success": true,
  "message": "Submission history fetched successfully",
  "submission": {
    "id": "deleted-submission-uuid",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "pending",
    "score": null,
    "submitted_at": "2024-01-01T00:00:00.000Z",
    "edited_at": "2024-01-01T15:00:00.000Z",
    "flagged_at": null,
    "flagged_reason": null,
    "deleted_at": "2024-01-01T16:00:00.000Z",
    "reviewed_at": null
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "points": 100
  },
  "task": {
    "id": "task-uuid",
    "title": "Build React Component",
    "description": "Create a reusable button component with TypeScript",
    "skill_area": "frontend"
  },
  "history": [
    {
      "event": "submission_created",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "description": "Task submission created",
      "details": {
        "status": "pending",
        "proof": "https://github.com/user/repo",
        "description": "Initial submission"
      },
      "metadata": {
        "daysAgo": 2
      }
    },
    {
      "event": "content_edited",
      "timestamp": "2024-01-01T15:00:00.000Z",
      "description": "Submission content was edited",
      "details": {
        "proof": "https://github.com/user/updated-repo",
        "hasDescription": true
      },
      "metadata": {
        "daysAgo": 1,
        "daysAfterSubmission": 1
      }
    },
    {
      "event": "submission_deleted",
      "timestamp": "2024-01-01T16:00:00.000Z",
      "description": "Submission soft deleted",
      "details": {
        "status": "pending",
        "wasFlagged": false,
        "flagReason": null
      },
      "metadata": {
        "daysAgo": 1,
        "daysAfterSubmission": 1
      }
    }
  ],
  "lifecycleStats": {
    "totalEvents": 3,
    "currentStatus": "pending",
    "isDeleted": true,
    "isFlagged": false,
    "isScored": false,
    "hasEdits": true,
    "hasFlags": false,
    "hasManualReview": false,
    "daysSinceSubmission": 2,
    "daysDeleted": 1
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing ID:**

```json
{
  "success": false,
  "error": "Submission ID is required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "submission_id": "non-existent-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch submission history",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 📊 History Event Types

**Event Types:**

- **`submission_created`**: Initial submission creation
- **`content_edited`**: Submission content was modified
- **`review_flagged`**: Submission flagged for manual review
- **`submission_deleted`**: Submission soft deleted
- **`manually_reviewed`**: Manual review and scoring
- **`auto_scored`**: AI auto-scoring (estimated timestamp)

**Event Details:**
Each history event includes:

- **`event`**: Type of event
- **`timestamp`**: When the event occurred
- **`description`**: Human-readable description
- **`details`**: Event-specific data
- **`metadata`**: Calculated time-based metadata

**Lifecycle Statistics:**

- **`totalEvents`**: Total number of history events
- **`currentStatus`**: Current submission status
- **`isDeleted`**: Whether submission is soft-deleted
- **`isFlagged`**: Whether submission is flagged
- **`isScored`**: Whether submission is scored
- **`hasEdits`**: Whether submission has been edited
- **`hasFlags`**: Whether submission has been flagged
- **`hasManualReview`**: Whether submission was manually reviewed
- **`daysSinceSubmission`**: Days since initial submission
- **`daysDeleted`**: Days since deletion (if applicable)

## 📊 Statistics Endpoints

### 15. GET /stats

Fetches comprehensive arena statistics.

**URL:** `GET /api/arena/stats`

**Response:**

```json
{
  "success": true,
  "message": "Arena statistics fetched successfully",
  "stats": {
    "tasks": {
      "total": 5,
      "bySkillArea": {
        "frontend": 2,
        "backend": 2,
        "database": 1
      }
    },
    "users": {
      "total": 10,
      "totalPoints": 1250
    },
    "submissions": {
      "total": 15,
      "pending": 8,
      "completed": 7
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 16. GET /leaderboard

Fetches the top 10 users by points.

**URL:** `GET /api/arena/leaderboard`

**Response:**

```json
{
  "success": true,
  "message": "Leaderboard fetched successfully",
  "leaderboard": [
    {
      "rank": 1,
      "id": "uuid-here",
      "email": "top-user@example.com",
      "points": 500,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "rank": 2,
      "id": "uuid-here",
      "email": "second-user@example.com",
      "points": 350,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 17. GET /score-formula-preview

Get current AI scoring formula and configuration.

**URL:** `GET /api/arena/score-formula-preview`

**Success Response (200):**

```json
{
  "success": true,
  "message": "AI scoring formula preview fetched successfully",
  "formula": {
    "name": "Cabe Arena AI Scoring Formula v1.0",
    "description": "Multi-factor scoring system for code submissions with task-type specific weights",
    "version": "1.0.0",
    "lastUpdated": "2024-01-01T00:00:00.000Z",

    "formula": {
      "expression": "Score = (Correctness × Wc + Readability × Wr + Adherence × Wa + Innovation × Wi) × TaskMultiplier",
      "description": "Weighted sum of four primary factors multiplied by task-specific multiplier",
      "maxScore": 100,
      "minScore": 0,
      "rounding": "nearest integer"
    },

    "factors": {
      "correctness": {
        "name": "Correctness",
        "description": "How well the solution solves the given problem",
        "maxPoints": 40,
        "weight": 0.4,
        "criteria": [
          "Functional requirements met",
          "Edge cases handled",
          "Error handling implemented",
          "Output accuracy"
        ]
      },
      "readability": {
        "name": "Readability",
        "description": "Code clarity, structure, and maintainability",
        "maxPoints": 30,
        "weight": 0.3,
        "criteria": [
          "Clear variable names",
          "Logical code structure",
          "Appropriate comments",
          "Consistent formatting"
        ]
      },
      "adherence": {
        "name": "Adherence",
        "description": "Following best practices and requirements",
        "maxPoints": 20,
        "weight": 0.2,
        "criteria": [
          "Language-specific conventions",
          "Architecture patterns",
          "Performance considerations",
          "Security practices"
        ]
      },
      "innovation": {
        "name": "Innovation",
        "description": "Creative problem-solving and advanced techniques",
        "maxPoints": 10,
        "weight": 0.1,
        "criteria": [
          "Elegant solutions",
          "Advanced algorithms",
          "Creative approaches",
          "Optimization techniques"
        ]
      }
    },

    "taskMultipliers": {
      "frontend": {
        "name": "Frontend Development",
        "multiplier": 1.0,
        "description": "Standard scoring for frontend tasks",
        "focusAreas": [
          "UI/UX",
          "Responsive design",
          "Accessibility",
          "Performance"
        ]
      },
      "backend": {
        "name": "Backend Development",
        "multiplier": 1.1,
        "description": "Slightly higher scoring for backend complexity",
        "focusAreas": [
          "API design",
          "Database efficiency",
          "Security",
          "Scalability"
        ]
      },
      "database": {
        "name": "Database Design",
        "multiplier": 1.05,
        "description": "Moderate multiplier for database tasks",
        "focusAreas": [
          "Schema design",
          "Query optimization",
          "Data integrity",
          "Performance"
        ]
      },
      "algorithm": {
        "name": "Algorithm & Data Structures",
        "multiplier": 1.15,
        "description": "Higher scoring for algorithmic complexity",
        "focusAreas": [
          "Time complexity",
          "Space efficiency",
          "Algorithm choice",
          "Implementation"
        ]
      },
      "system": {
        "name": "System Design",
        "multiplier": 1.2,
        "description": "Highest multiplier for system design tasks",
        "focusAreas": [
          "Architecture",
          "Scalability",
          "Reliability",
          "Trade-offs"
        ]
      }
    },

    "rules": {
      "minimumScore": 0,
      "maximumScore": 100,
      "bonusPoints": {
        "documentation": 5,
        "tests": 5,
        "deployment": 3
      },
      "penalties": {
        "plagiarism": -50,
        "incomplete": -20,
        "poorFormatting": -10
      },
      "rounding": "nearest integer",
      "decimalPlaces": 0
    },

    "examples": [
      {
        "name": "Frontend React Component",
        "taskType": "frontend",
        "scores": {
          "correctness": 35,
          "readability": 28,
          "adherence": 18,
          "innovation": 8
        },
        "calculation": {
          "weightedSum": "(35 × 0.4) + (28 × 0.3) + (18 × 0.2) + (8 × 0.1) = 14 + 8.4 + 3.6 + 0.8 = 26.8",
          "multiplier": "26.8 × 1.0 = 26.8",
          "finalScore": 27
        }
      },
      {
        "name": "Backend API Endpoint",
        "taskType": "backend",
        "scores": {
          "correctness": 38,
          "readability": 25,
          "adherence": 19,
          "innovation": 9
        },
        "calculation": {
          "weightedSum": "(38 × 0.4) + (25 × 0.3) + (19 × 0.2) + (9 × 0.1) = 15.2 + 7.5 + 3.8 + 0.9 = 27.4",
          "multiplier": "27.4 × 1.1 = 30.14",
          "finalScore": 30
        }
      },
      {
        "name": "Algorithm Implementation",
        "taskType": "algorithm",
        "scores": {
          "correctness": 40,
          "readability": 30,
          "adherence": 20,
          "innovation": 10
        },
        "calculation": {
          "weightedSum": "(40 × 0.4) + (30 × 0.3) + (20 × 0.2) + (10 × 0.1) = 16 + 9 + 4 + 1 = 30",
          "multiplier": "30 × 1.15 = 34.5",
          "finalScore": 35
        }
      }
    ],

    "aiModel": {
      "provider": "OpenRouter",
      "model": "mistralai/mistral-7b-instruct",
      "temperature": 0.3,
      "maxTokens": 1000,
      "promptTemplate": "Rate the following code submission on a scale of 0-100 based on correctness, readability, adherence to best practices, and innovation. Provide a breakdown of scores for each factor.",
      "responseFormat": "JSON with score and breakdown"
    },

    "maintenance": {
      "lastReview": "2024-01-01T00:00:00.000Z",
      "nextReview": "2024-04-01T00:00:00.000Z",
      "reviewCycle": "quarterly",
      "versionHistory": [
        {
          "version": "1.0.0",
          "date": "2024-01-01T00:00:00.000Z",
          "changes": "Initial formula implementation"
        }
      ]
    }
  },
  "metadata": {
    "totalFactors": 4,
    "taskTypes": 5,
    "examples": 3,
    "maxScore": 100,
    "minScore": 0
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Failed to fetch scoring formula",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 📊 Scoring Formula Structure

**Core Formula:**

```
Score = (Correctness × 0.4 + Readability × 0.3 + Adherence × 0.2 + Innovation × 0.1) × TaskMultiplier
```

**Scoring Factors:**

- **Correctness (40%)**: Problem-solving accuracy and completeness
- **Readability (30%)**: Code clarity and maintainability
- **Adherence (20%)**: Best practices and requirements compliance
- **Innovation (10%)**: Creative problem-solving and advanced techniques

**Task-Type Multipliers:**

- **Frontend**: 1.0x (standard)
- **Backend**: 1.1x (slightly higher for complexity)
- **Database**: 1.05x (moderate multiplier)
- **Algorithm**: 1.15x (higher for algorithmic complexity)
- **System**: 1.2x (highest for system design)

**Scoring Rules:**

- **Range**: 0-100 points
- **Rounding**: Nearest integer
- **Bonus Points**: Documentation (+5), Tests (+5), Deployment (+3)
- **Penalties**: Plagiarism (-50), Incomplete (-20), Poor Formatting (-10)

### 18. GET /user/:id/analytics

Fetches comprehensive user analytics and performance metrics.

**URL:** `GET /api/arena/user/:id/analytics`

**Path Parameters:**

- `id` (string, required): User ID to fetch analytics for

**Success Response (200):**

```json
{
  "success": true,
  "message": "User analytics fetched successfully",
  "user_id": "user-uuid-1",
  "aggregate_stats": {
    "total_submissions": 25,
    "total_scored": 20,
    "average_score": 82.5,
    "best_score": 95,
    "lowest_score": 65,
    "first_submission_at": "2024-01-01T10:00:00.000Z",
    "last_submission_at": "2024-01-15T14:30:00.000Z",
    "days_active": 14
  },
  "skill_analytics": [
    {
      "skill_area": "frontend",
      "submissions": 8,
      "total_points": 680,
      "average_score": 85.0
    },
    {
      "skill_area": "backend",
      "submissions": 6,
      "total_points": 480,
      "average_score": 80.0
    },
    {
      "skill_area": "database",
      "submissions": 4,
      "total_points": 320,
      "average_score": 80.0
    },
    {
      "skill_area": "algorithm",
      "submissions": 2,
      "total_points": 160,
      "average_score": 80.0
    }
  ],
  "timeline": [
    {
      "date": "2024-01-01",
      "submissions": 2,
      "average_score": 85.5
    },
    {
      "date": "2024-01-03",
      "submissions": 1,
      "average_score": 78.0
    },
    {
      "date": "2024-01-05",
      "submissions": 3,
      "average_score": 82.3
    },
    {
      "date": "2024-01-08",
      "submissions": 2,
      "average_score": 88.0
    },
    {
      "date": "2024-01-12",
      "submissions": 4,
      "average_score": 79.8
    },
    {
      "date": "2024-01-15",
      "submissions": 2,
      "average_score": 85.0
    }
  ],
  "gamification_summary": {
    "current_points": 1640,
    "current_rank": "Gold",
    "next_rank": "Platinum",
    "points_to_next_rank": 3360,
    "estimated_submissions_to_next_rank": 41
  },
  "anomalies": {
    "sudden_drops": false,
    "spammy_patterns": false
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "dataPoints": {
      "totalSubmissions": 25,
      "totalScored": 20,
      "skillAreas": 4,
      "timelineDays": 6
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing User ID:**

```json
{
  "success": false,
  "error": "User ID is required",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**404 Not Found - User Not Found:**

```json
{
  "success": false,
  "error": "User not found",
  "user_id": "invalid-uuid",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch user analytics",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

#### 📊 User Analytics Features

**Aggregate Statistics:**

- **Total Submissions**: Count of all user submissions (excluding soft-deleted)
- **Total Scored**: Count of submissions that have been scored
- **Average Score**: Mean score across all scored submissions (rounded to 2 decimal places)
- **Best Score**: Highest score achieved by the user
- **Lowest Score**: Lowest score achieved by the user
- **First Submission**: Timestamp of the user's first submission
- **Last Submission**: Timestamp of the user's most recent submission
- **Days Active**: Number of days since first submission

**Skill Analytics:**

- **Per-Skill Breakdown**: Submissions, total points, and average score per skill area
- **Performance Comparison**: Compare performance across different skill areas
- **Sorted by Points**: Skills ranked by total points earned
- **Only Scored Submissions**: Only includes submissions that have been scored

**Timeline Analysis:**

- **Daily Breakdown**: Submissions and average scores grouped by date
- **Chronological Order**: Timeline sorted by submission date
- **Performance Trends**: Track performance over time
- **Activity Patterns**: Identify submission frequency patterns

**Gamification Summary:**

- **Current Points**: User's total points earned
- **Current Rank**: User's current rank (Bronze/Silver/Gold/Platinum)
- **Next Rank**: Target rank for progression
- **Points to Next Rank**: Points needed to reach the next rank
- **Estimated Submissions**: Estimated submissions needed based on average score

**Anomaly Detection:**

- **Sudden Drops**: Detects if score drops >20% within 3 consecutive tasks
- **Spammy Patterns**: Detects if 5+ low-score submissions (<40) occur consecutively
- **Performance Monitoring**: Helps identify unusual patterns in user behavior

**Data Integrity:**

- **Soft-Delete Exclusion**: Automatically excludes soft-deleted submissions
- **Scored Submissions Only**: Only includes submissions with non-null scores for scoring metrics
- **Null Safety**: Handles missing data gracefully
- **Type Safety**: Proper validation and error handling

**CaBE Point System v3 Integration:**

- **Rank Calculation**: Uses official CaBE rank thresholds
- **Progression Tracking**: Shows path to next rank
- **Point Estimation**: Calculates submissions needed for rank progression

**Example Usage:**

**Using curl:**

```bash
# Get user analytics
curl "http://localhost:3001/api/arena/user/user-uuid-1/analytics"

# Get analytics for different user
curl "http://localhost:3001/api/arena/user/user-uuid-2/analytics"
```

**Using JavaScript:**

```javascript
// Get user analytics
const response = await fetch(
  'http://localhost:3001/api/arena/user/user-uuid-1/analytics'
);
const data = await response.json();

if (data.success) {
  console.log('Aggregate Statistics:');
  console.log(`Total Submissions: ${data.aggregate_stats.total_submissions}`);
  console.log(`Total Scored: ${data.aggregate_stats.total_scored}`);
  console.log(`Average Score: ${data.aggregate_stats.average_score}`);
  console.log(`Best Score: ${data.aggregate_stats.best_score}`);
  console.log(`Days Active: ${data.aggregate_stats.days_active}`);

  console.log('\nSkill Analytics:');
  data.skill_analytics.forEach((skill) => {
    console.log(
      `${skill.skill_area}: ${skill.submissions} submissions, ${skill.total_points} points, avg: ${skill.average_score}`
    );
  });

  console.log('\nGamification:');
  const gam = data.gamification_summary;
  console.log(
    `Current Rank: ${gam.current_rank} (${gam.current_points} points)`
  );
  console.log(
    `Next Rank: ${gam.next_rank} (${gam.points_to_next_rank} points needed)`
  );
  console.log(
    `Estimated Submissions: ${gam.estimated_submissions_to_next_rank}`
  );

  console.log('\nAnomalies:');
  console.log(`Sudden Drops: ${data.anomalies.sudden_drops}`);
  console.log(`Spammy Patterns: ${data.anomalies.spammy_patterns}`);

  console.log('\nTimeline (Last 5 days):');
  data.timeline.slice(-5).forEach((day) => {
    console.log(
      `${day.date}: ${day.submissions} submissions, avg: ${day.average_score}`
    );
  });
} else {
  console.error(`Error: ${data.error}`);
}
```

### 19. GET /stats

Get Arena statistics and overview.

**URL:** `GET /api/arena/stats`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Arena statistics fetched successfully",
  "stats": {
    "tasks": {
      "total": 15,
      "bySkillArea": {
        "frontend": 6,
        "backend": 5,
        "database": 3,
        "algorithm": 1
      }
    },
    "users": {
      "total": 25,
      "totalPoints": 1250
    },
    "submissions": {
      "total": 45,
      "pending": 5,
      "completed": 40
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

### 20. GET /leaderboard

Get global Arena leaderboard sorted by total points with optional filtering and pagination.

**URL:** `GET /api/arena/leaderboard`

**Query Parameters:**

- `skill_area` (string, optional): Filter leaderboard by skill area (frontend, backend, database, algorithm, system)
- `limit` (number, optional, default: 10, max: 100): Number of users to return
- `offset` (number, optional, default: 0): Number of users to skip for pagination

**Success Response (200):**

```json
{
  "success": true,
  "message": "Leaderboard fetched successfully",
  "leaderboard": [
    {
      "user_id": "user-uuid-1",
      "username": "jane",
      "email": "jane@example.com",
      "total_points": 8500,
      "rank": "Gold",
      "top_skill_area": "frontend",
      "total_submissions": 25,
      "average_score": 85.2,
      "last_submission_at": "2024-01-15T14:30:00.000Z"
    },
    {
      "user_id": "user-uuid-2",
      "username": "john",
      "email": "john@example.com",
      "total_points": 7200,
      "rank": "Gold",
      "top_skill_area": "backend",
      "total_submissions": 18,
      "average_score": 82.5,
      "last_submission_at": "2024-01-14T11:20:00.000Z"
    },
    {
      "user_id": "user-uuid-3",
      "username": "alice",
      "email": "alice@example.com",
      "total_points": 4800,
      "rank": "Silver",
      "top_skill_area": "database",
      "total_submissions": 12,
      "average_score": 88.0,
      "last_submission_at": "2024-01-13T09:15:00.000Z"
    }
  ],
  "count": 45,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 45,
    "hasNextPage": true,
    "currentPage": 1,
    "totalPages": 5
  },
  "filters": {
    "skill_area": null
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "rankSystem": {
      "name": "CaBE Point System v3",
      "thresholds": {
        "Bronze": "0-999 points",
        "Silver": "1,000-4,999 points",
        "Gold": "5,000-9,999 points",
        "Platinum": "10,000+ points"
      }
    },
    "dataPoints": {
      "totalUsers": 45,
      "returnedUsers": 10,
      "skillAreaFilter": "none"
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Example Response with Skill Filter:**

```json
{
  "success": true,
  "message": "Leaderboard fetched successfully",
  "leaderboard": [
    {
      "user_id": "user-uuid-1",
      "username": "jane",
      "email": "jane@example.com",
      "total_points": 8500,
      "rank": "Gold",
      "top_skill_area": "frontend",
      "total_submissions": 15,
      "average_score": 87.5,
      "last_submission_at": "2024-01-15T14:30:00.000Z"
    },
    {
      "user_id": "user-uuid-4",
      "username": "bob",
      "email": "bob@example.com",
      "total_points": 6200,
      "rank": "Gold",
      "top_skill_area": "frontend",
      "total_submissions": 12,
      "average_score": 84.2,
      "last_submission_at": "2024-01-14T16:45:00.000Z"
    }
  ],
  "count": 12,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 12,
    "hasNextPage": false,
    "currentPage": 1,
    "totalPages": 2
  },
  "filters": {
    "skill_area": "frontend"
  },
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "rankSystem": {
      "name": "CaBE Point System v3",
      "thresholds": {
        "Bronze": "0-999 points",
        "Silver": "1,000-4,999 points",
        "Gold": "5,000-9,999 points",
        "Platinum": "10,000+ points"
      }
    },
    "dataPoints": {
      "totalUsers": 12,
      "returnedUsers": 10,
      "skillAreaFilter": "frontend"
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Invalid Parameters:**

```json
{
  "success": false,
  "error": "Limit must be a number between 1 and 100",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Offset must be a non-negative number",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Invalid skill area. Valid options: frontend, backend, database, algorithm, system",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to fetch leaderboard",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

#### 🏆 Leaderboard Features

**Global Ranking:**

- **Total Points**: Users ranked by total points earned
- **CaBE Rank System**: Official rank calculation (Bronze/Silver/Gold/Platinum)
- **Performance Metrics**: Average scores and submission counts
- **Activity Tracking**: Last submission timestamps

**Skill Area Filtering:**

- **Optional Filter**: Filter leaderboard by specific skill area
- **Valid Skills**: frontend, backend, database, algorithm, system
- **Top Skill Area**: Shows user's highest performing skill area
- **Cross-Skill Comparison**: Compare performance across skill areas

**Pagination Support:**

- **Limit Control**: Control number of results per page (1-100)
- **Offset Support**: Skip results for pagination
- **Total Count**: Total number of users in leaderboard
- **Page Navigation**: Current page, total pages, and next page indicator

**User Information:**

- **Username**: Extracted from email address
- **Email**: Full email address for identification
- **Rank**: Current CaBE rank based on points
- **Top Skill**: User's highest performing skill area
- **Statistics**: Total submissions and average score
- **Activity**: Last submission timestamp

**Data Integrity:**

- **Soft-Delete Exclusion**: Automatically excludes soft-deleted users
- **Scored Submissions Only**: Only includes users with scored submissions
- **Null Safety**: Handles missing data gracefully
- **Type Safety**: Proper validation and error handling

**Example Usage:**

**Using curl:**

```bash
# Get global leaderboard (top 10)
curl "http://localhost:3001/api/arena/leaderboard"

# Get leaderboard with custom limit
curl "http://localhost:3001/api/arena/leaderboard?limit=20"

# Get leaderboard with pagination
curl "http://localhost:3001/api/arena/leaderboard?limit=10&offset=10"

# Get frontend skill leaderboard
curl "http://localhost:3001/api/arena/leaderboard?skill_area=frontend"

# Get backend skill leaderboard with pagination
curl "http://localhost:3001/api/arena/leaderboard?skill_area=backend&limit=5&offset=5"
```

**Using JavaScript:**

```javascript
// Get global leaderboard
const response = await fetch('http://localhost:3001/api/arena/leaderboard');
const data = await response.json();

if (data.success) {
  console.log('Global Leaderboard:');
  data.leaderboard.forEach((user, index) => {
    console.log(
      `${index + 1}. ${user.username} - ${user.total_points} points (${user.rank})`
    );
    console.log(
      `   Top Skill: ${user.top_skill_area}, Avg Score: ${user.average_score}`
    );
  });

  console.log(
    `\nPagination: Page ${data.pagination.currentPage} of ${data.pagination.totalPages}`
  );
  console.log(`Total Users: ${data.count}`);
} else {
  console.error(`Error: ${data.error}`);
}

// Get skill-specific leaderboard
const frontendResponse = await fetch(
  'http://localhost:3001/api/arena/leaderboard?skill_area=frontend&limit=5'
);
const frontendData = await frontendResponse.json();

if (frontendData.success) {
  console.log('\nFrontend Leaderboard:');
  frontendData.leaderboard.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} - ${user.total_points} points`);
  });
}
```

## 🧪 Testing the API

### Using curl

```bash
# Get all tasks
curl http://localhost:3001/api/arena/tasks

# Get all users
curl http://localhost:3001/api/arena/users

# Get all submissions
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here"

# Get a specific submission by ID
curl http://localhost:3001/api/arena/submission/submission-uuid-here

# Submit a task
curl -X POST http://localhost:3001/api/arena/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid-here",
    "task_id": "task-uuid-here",
    "description": "I completed the React component task",
    "proof": "https://github.com/user/react-component-repo"
  }'

# Auto-score a submission
curl -X POST http://localhost:3001/api/arena/auto-score \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-here"
  }'

# Manually score a submission
curl -X POST http://localhost:3001/api/arena/score \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-here",
    "score": 85
  }'

# Flag a submission for review
curl -X POST http://localhost:3001/api/arena/review-flag \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-here",
    "reason": "AI scoring failed - ambiguous task requirements"
  }'

# Manually score a flagged submission
curl -X POST http://localhost:3001/api/arena/manual-score \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "flagged-submission-uuid-here",
    "score": 85,
    "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 30/30",
    "feedback": "Great work! The code is well-structured and follows best practices."
  }'

# Edit a submission
curl -X PATCH http://localhost:3001/api/arena/submission/edit \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-here",
    "new_content": "https://github.com/user/updated-repo"
  }'

# Delete a submission
curl -X DELETE http://localhost:3001/api/arena/submission/delete \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-here"
  }'

# Restore a submission
curl -X PATCH http://localhost:3001/api/arena/submission/restore \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-here"
  }'

# Get submission history
curl http://localhost:3001/api/arena/submission/submission-uuid-here/history

# Get AI scoring formula preview
curl http://localhost:3001/api/arena/score-formula-preview

# Get arena statistics
curl http://localhost:3001/api/arena/stats

# Get leaderboard
curl http://localhost:3001/api/arena/leaderboard

# Get leaderboard with pagination
curl "http://localhost:3001/api/arena/leaderboard?limit=10&offset=20"

# Get leaderboard filtered by skill
curl "http://localhost:3001/api/arena/leaderboard?skill=frontend"

# Get leaderboard for backend skill with pagination
curl "http://localhost:3001/api/arena/leaderboard?skill=backend&limit=10&offset=0"

# Get tasks with pagination
curl "http://localhost:3001/api/arena/tasks?limit=10&offset=20"

# Get tasks filtered by skill
curl "http://localhost:3001/api/arena/tasks?skill=frontend"

# Get tasks with custom limit
curl "http://localhost:3001/api/arena/tasks?limit=5"

# Get backend tasks with pagination
curl "http://localhost:3001/api/arena/tasks?skill=backend&limit=10&offset=0"

# Get algorithm tasks
curl "http://localhost:3001/api/arena/tasks?skill=algorithm"

# Get database tasks
curl "http://localhost:3001/api/arena/tasks?skill=database"

# Get system design tasks
curl "http://localhost:3001/api/arena/tasks?skill=system"

# Test invalid limit parameter
curl "http://localhost:3001/api/arena/tasks?limit=100"

# Test invalid offset parameter
curl "http://localhost:3001/api/arena/tasks?offset=-5"

# Test non-existent skill filter
curl "http://localhost:3001/api/arena/tasks?skill=nonexistent-skill"

# Get tasks with verbose output
curl -v http://localhost:3001/api/arena/tasks

# Get tasks and save to file
curl http://localhost:3001/api/arena/tasks > tasks.json

# Get user submissions (requires user_id parameter)
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here"

# Get user submissions with pagination
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&limit=10&offset=20"

# Get user submissions filtered by status
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=scored"

# Get user submissions filtered by skill
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&skill=frontend"

# Get user submissions with multiple filters
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=scored&skill=backend&limit=10&offset=0"

# Get pending submissions
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=pending"

# Get flagged submissions
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=flagged"

# Get deleted submissions
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=deleted"

# Test invalid parameters
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&limit=100"
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&offset=-5"
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=invalid-status"
curl "http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&skill=invalid-skill"
```

### Using JavaScript/Fetch

```javascript
// Get all tasks
const response = await fetch('http://localhost:3001/api/arena/tasks');
const data = await response.json();
console.log(data);

// Get a specific submission by ID
const submissionResponse = await fetch(
  'http://localhost:3001/api/arena/submission/submission-uuid-here'
);
const submissionData = await submissionResponse.json();
console.log(submissionData);

// Submit a task
const submitResponse = await fetch('http://localhost:3001/api/arena/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 'user-uuid-here',
    task_id: 'task-uuid-here',
    description: 'I completed the React component task',
    proof: 'https://github.com/user/react-component-repo',
  }),
});
const submitData = await submitResponse.json();
console.log(submitData);

// Auto-score a submission
const autoScoreResponse = await fetch(
  'http://localhost:3001/api/arena/auto-score',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: 'submission-uuid-here',
    }),
  }
);
const autoScoreData = await autoScoreResponse.json();
console.log(autoScoreData);

// Manually score a submission
const scoreResponse = await fetch('http://localhost:3001/api/arena/score', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    submission_id: 'submission-uuid-here',
    score: 85,
  }),
});
const scoreData = await scoreResponse.json();
console.log(scoreData);

// Flag a submission for review
const reviewFlagResponse = await fetch(
  'http://localhost:3001/api/arena/review-flag',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: 'submission-uuid-here',
      reason: 'AI scoring failed - ambiguous task requirements',
    }),
  }
);
const reviewFlagData = await reviewFlagResponse.json();
console.log(reviewFlagData);

// Manually score a flagged submission
const manualScoreResponse = await fetch(
  'http://localhost:3001/api/arena/manual-score',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: 'flagged-submission-uuid-here',
      score: 85,
      breakdown: 'Correctness: 30/40, Readability: 25/30, Adherence: 30/30',
      feedback:
        'Great work! The code is well-structured and follows best practices.',
    }),
  }
);
const manualScoreData = await manualScoreResponse.json();
console.log(manualScoreData);

// Edit a submission
const editResponse = await fetch(
  'http://localhost:3001/api/arena/submission/edit',
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: 'submission-uuid-here',
      new_content: 'https://github.com/user/updated-repo',
    }),
  }
);
const editData = await editResponse.json();
console.log(editData);

// Delete a submission
const deleteResponse = await fetch(
  'http://localhost:3001/api/arena/submission/delete',
  {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: 'submission-uuid-here',
    }),
  }
);
const deleteData = await deleteResponse.json();
console.log(deleteData);

// Restore a submission
const restoreResponse = await fetch(
  'http://localhost:3001/api/arena/submission/restore',
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: 'submission-uuid-here',
    }),
  }
);
const restoreData = await restoreResponse.json();
console.log(restoreData);

// Restore a submission with reason
const restoreWithReasonResponse = await fetch(
  'http://localhost:3001/api/arena/submission/restore',
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: 'submission-uuid-here',
      reason: 'User requested restoration after fixing issues',
    }),
  }
);
const restoreWithReasonData = await restoreWithReasonResponse.json();
console.log(restoreWithReasonData);

// Get submission history
const historyResponse = await fetch(
  'http://localhost:3001/api/arena/submission/submission-uuid-here/history'
);
const historyData = await historyResponse.json();
console.log(historyData);

// Get AI scoring formula preview
const formulaResponse = await fetch(
  'http://localhost:3001/api/arena/score-formula-preview'
);
const formulaData = await formulaResponse.json();
console.log(formulaData);

// Get user analytics
const analyticsResponse = await fetch(
  'http://localhost:3001/api/arena/user/user-uuid-here/analytics'
);
const analyticsData = await analyticsResponse.json();
console.log(analyticsData);

// Get leaderboard
const leaderboardResponse = await fetch(
  'http://localhost:3001/api/arena/leaderboard'
);
const leaderboardData = await leaderboardResponse.json();
console.log(leaderboardData);

// Get leaderboard with pagination
const paginatedLeaderboardResponse = await fetch(
  'http://localhost:3001/api/arena/leaderboard?limit=10&offset=20'
);
const paginatedLeaderboardData = await paginatedLeaderboardResponse.json();
console.log(paginatedLeaderboardData);

// Get leaderboard filtered by skill
const skillLeaderboardResponse = await fetch(
  'http://localhost:3001/api/arena/leaderboard?skill=frontend'
);
const skillLeaderboardData = await skillLeaderboardResponse.json();
console.log(skillLeaderboardData);

// Get tasks with pagination
const paginatedResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?limit=10&offset=20'
);
const paginatedData = await paginatedResponse.json();
console.log(paginatedData);

// Get tasks filtered by skill
const skillResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?skill=frontend'
);
const skillData = await skillResponse.json();
console.log(skillData);

// Get tasks with custom limit
const limitResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?limit=5'
);
const limitData = await limitResponse.json();
console.log(limitData);

// Get backend tasks with pagination
const backendResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?skill=backend&limit=10&offset=0'
);
const backendData = await backendResponse.json();
console.log(backendData);

// Get algorithm tasks
const algorithmResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?skill=algorithm'
);
const algorithmData = await algorithmResponse.json();
console.log(algorithmData);

// Get database tasks
const databaseResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?skill=database'
);
const databaseData = await databaseResponse.json();
console.log(databaseData);

// Get system design tasks
const systemResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?skill=system'
);
const systemData = await systemResponse.json();
console.log(systemData);

// Test invalid limit parameter
const invalidLimitResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?limit=100'
);
const invalidLimitData = await invalidLimitResponse.json();
console.log(invalidLimitData);

// Test invalid offset parameter
const invalidOffsetResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?offset=-5'
);
const invalidOffsetData = await invalidOffsetResponse.json();
console.log(invalidOffsetData);

// Test non-existent skill filter
const nonexistentSkillResponse = await fetch(
  'http://localhost:3001/api/arena/tasks?skill=nonexistent-skill'
);
const nonexistentSkillData = await nonexistentSkillResponse.json();
console.log(nonexistentSkillData);

// Get tasks with verbose output
const verboseResponse = await fetch('http://localhost:3001/api/arena/tasks');
const verboseData = await verboseResponse.text();
console.log(verboseData);

// Get tasks and save to file
const saveToFileResponse = await fetch('http://localhost:3001/api/arena/tasks');
const blob = await saveToFileResponse.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'tasks.json';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);

// Get user submissions (requires user_id parameter)
const userSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here'
);
const userSubmissionsData = await userSubmissionsResponse.json();
console.log(userSubmissionsData);

// Get user submissions with pagination
const paginatedUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&limit=10&offset=20'
);
const paginatedUserSubmissionsData =
  await paginatedUserSubmissionsResponse.json();
console.log(paginatedUserSubmissionsData);

// Get user submissions filtered by status
const filteredUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=scored'
);
const filteredUserSubmissionsData =
  await filteredUserSubmissionsResponse.json();
console.log(filteredUserSubmissionsData);

// Get user submissions filtered by skill
const skillFilteredUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&skill=frontend'
);
const skillFilteredUserSubmissionsData =
  await skillFilteredUserSubmissionsResponse.json();
console.log(skillFilteredUserSubmissionsData);

// Get user submissions with multiple filters
const multiFilteredUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=scored&skill=backend&limit=10&offset=0'
);
const multiFilteredUserSubmissionsData =
  await multiFilteredUserSubmissionsResponse.json();
console.log(multiFilteredUserSubmissionsData);

// Get pending submissions
const pendingUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=pending'
);
const pendingUserSubmissionsData = await pendingUserSubmissionsResponse.json();
console.log(pendingUserSubmissionsData);

// Get flagged submissions
const flaggedUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=flagged'
);
const flaggedUserSubmissionsData = await flaggedUserSubmissionsResponse.json();
console.log(flaggedUserSubmissionsData);

// Get deleted submissions
const deletedUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=deleted'
);
const deletedUserSubmissionsData = await deletedUserSubmissionsResponse.json();
console.log(deletedUserSubmissionsData);

// Test invalid parameters
const invalidUserSubmissionsResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&limit=100'
);
const invalidUserSubmissionsData = await invalidUserSubmissionsResponse.json();
console.log(invalidUserSubmissionsData);

const invalidUserSubmissionsOffsetResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&offset=-5'
);
const invalidUserSubmissionsOffsetData =
  await invalidUserSubmissionsOffsetResponse.json();
console.log(invalidUserSubmissionsOffsetData);

const invalidUserSubmissionsStatusResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&status=invalid-status'
);
const invalidUserSubmissionsStatusData =
  await invalidUserSubmissionsStatusResponse.json();
console.log(invalidUserSubmissionsStatusData);

const invalidUserSubmissionsSkillResponse = await fetch(
  'http://localhost:3001/api/arena/submissions?user_id=user-uuid-here&skill=invalid-skill'
);
const invalidUserSubmissionsSkillData =
  await invalidUserSubmissionsSkillResponse.json();
console.log(invalidUserSubmissionsSkillData);

// Get user analytics
const analyticsResponse = await fetch(
  'http://localhost:3001/api/arena/user/user-uuid-here/analytics'
);
const analyticsData = await analyticsResponse.json();
console.log(analyticsData);

// Get analytics for active user
const activeUserResponse = await fetch(
  'http://localhost:3001/api/arena/user/active-user-uuid-here/analytics'
);
const activeUserData = await activeUserResponse.json();
console.log(activeUserData);

// Get analytics for new user
const newUserResponse = await fetch(
  'http://localhost:3001/api/arena/user/new-user-uuid-here/analytics'
);
const newUserData = await newUserResponse.json();
console.log(newUserData);

// Test with verbose output
const verboseResponse = await fetch(
  'http://localhost:3001/api/arena/user/user-uuid-here/analytics'
);
const verboseData = await verboseResponse.text();
console.log(verboseData);

// Try to get analytics for non-existent user
const nonExistentResponse = await fetch(
  'http://localhost:3001/api/arena/user/non-existent-uuid/analytics'
);
const nonExistentData = await nonExistentResponse.json();
console.log(nonExistentData);

// Try with invalid user ID format
const invalidResponse = await fetch(
  'http://localhost:3001/api/arena/user/invalid-uuid-format/analytics'
);
const invalidData = await invalidResponse.json();
console.log(invalidData);

// Access specific analytics data
const analyticsData = await analyticsResponse.json();

// Access core metrics
const { submissions, performance, streaks, frequency, skills, timeline } =
  analyticsData.analytics;

console.log(`Total submissions: ${submissions.total}`);
console.log(`Scored submissions: ${submissions.scoredCount}`);
console.log(`Average score: ${submissions.averageScore}`);
console.log(`Total points: ${submissions.totalPointsEarned}`);

// Access performance data
if (performance.bestTask) {
  console.log(
    `Best task: ${performance.bestTask.title} (${performance.bestTask.score})`
  );
}

// Access streak information
console.log(`Current streak: ${streaks.current}`);
console.log(`Max streak: ${streaks.max}`);

// Access skill participation
console.log(
  `Top skill: ${skills.topSkill?.skill} (${skills.topSkill?.count} submissions)`
);
```

### 3. GET /tasks/analytics

Fetches global analytics across all tasks in the Arena system.

**URL:** `GET /api/arena/tasks/analytics`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Global task analytics fetched successfully",
  "analytics": [
    {
      "task_id": "task-uuid-1",
      "title": "Create a responsive navbar",
      "skill_area": "frontend",
      "total_submissions": 25,
      "average_score": 82.5
    },
    {
      "task_id": "task-uuid-2",
      "title": "API Authentication",
      "skill_area": "backend",
      "total_submissions": 18,
      "average_score": 78.3
    },
    {
      "task_id": "task-uuid-3",
      "title": "Database Schema Design",
      "skill_area": "database",
      "total_submissions": 12,
      "average_score": 85.7
    }
  ],
  "global_stats": {
    "total_tasks": 15,
    "total_submissions": 245,
    "tasks_with_submissions": 12,
    "average_submissions_per_task": 16.33,
    "global_average_score": 81.2
  },
  "skill_area_distribution": {
    "frontend": {
      "task_count": 5,
      "total_submissions": 85,
      "average_score": 82.1
    },
    "backend": {
      "task_count": 4,
      "total_submissions": 72,
      "average_score": 78.5
    },
    "database": {
      "task_count": 3,
      "total_submissions": 48,
      "average_score": 85.3
    },
    "algorithm": {
      "task_count": 2,
      "total_submissions": 28,
      "average_score": 79.8
    },
    "system": {
      "task_count": 1,
      "total_submissions": 12,
      "average_score": 76.2
    }
  },
  "count": 15,
  "metadata": {
    "calculatedAt": "2024-01-20T10:00:00.000Z",
    "dataPoints": {
      "tasks": 15,
      "submissions": 245,
      "skillAreas": 5
    }
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Failed to fetch task analytics",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

#### 📊 Global Task Analytics Features

**Task-Level Analytics:**

- **Individual Task Stats**: Each task with submission count and average score
- **Skill Area Classification**: Tasks grouped by skill area
- **Performance Metrics**: Average scores per task
- **Engagement Metrics**: Total submissions per task

**Global Statistics:**

- **Total Tasks**: Count of all active tasks
- **Total Submissions**: Sum of all submissions across tasks
- **Tasks with Submissions**: Count of tasks that have received submissions
- **Average Submissions per Task**: Mean submissions across all tasks
- **Global Average Score**: Overall average score across all submissions

**Skill Area Distribution:**

- **Per-Skill Statistics**: Task count, total submissions, and average score per skill area
- **Performance Comparison**: Compare performance across different skill areas
- **Engagement Analysis**: See which skill areas are most popular

**Data Integrity:**

- **Active Tasks Only**: Only includes tasks where `is_active = true`
- **Scored Submissions Only**: Only includes submissions with non-null scores
- **Soft-Delete Exclusion**: Automatically excludes soft-deleted submissions
- **Null Safety**: Handles missing data gracefully

**Example Usage:**

**Using curl:**

```bash
# Get global task analytics
curl "http://localhost:3001/api/arena/tasks/analytics"
```

**Using JavaScript:**

```javascript
// Get global task analytics
const response = await fetch('http://localhost:3001/api/arena/tasks/analytics');
const data = await response.json();

if (data.success) {
  console.log('Global Statistics:');
  console.log(`Total Tasks: ${data.global_stats.total_tasks}`);
  console.log(`Total Submissions: ${data.global_stats.total_submissions}`);
  console.log(
    `Global Average Score: ${data.global_stats.global_average_score}`
  );

  console.log('\nSkill Area Distribution:');
  Object.entries(data.skill_area_distribution).forEach(([skill, stats]) => {
    console.log(
      `${skill}: ${stats.task_count} tasks, ${stats.total_submissions} submissions, avg: ${stats.average_score}`
    );
  });

  console.log('\nTop Performing Tasks:');
  const topTasks = data.analytics
    .filter((task) => task.average_score !== null)
    .sort((a, b) => b.average_score - a.average_score)
    .slice(0, 5);

  topTasks.forEach((task, index) => {
    console.log(
      `${index + 1}. ${task.title} - ${task.average_score} (${task.skill_area})`
    );
  });
} else {
  console.error(`Error: ${data.error}`);
}
```

### 4. GET /users

### 21. POST /tasks/:id/score

Admin/Auto scoring for task submissions.

**URL:** `POST /api/arena/tasks/:id/score`

**Path Parameters:**

- `id` (string, required): Task ID for the submission being scored

**Request Body:**

```json
{
  "submission_id": "submission-uuid-1",
  "score": 85,
  "review_notes": "Excellent implementation with clean code structure and good error handling."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Submission scored successfully",
  "submission_id": "submission-uuid-1",
  "score": 85,
  "points_awarded": 85,
  "metadata": {
    "task_id": "task-uuid-1",
    "task_title": "Create a responsive navbar",
    "user_id": "user-uuid-1",
    "user_email": "jane@example.com",
    "previous_points": 1640,
    "new_total_points": 1725,
    "review_notes": "Excellent implementation with clean code structure and good error handling.",
    "scored_at": "2024-01-20T10:00:00.000Z"
  },
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing Parameters:**

```json
{
  "success": false,
  "error": "Task ID is required",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "submission_id is required",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "score is required",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**400 Bad Request - Invalid Score:**

```json
{
  "success": false,
  "error": "score must be a number between 0 and 100",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**400 Bad Request - Inactive Task:**

```json
{
  "success": false,
  "error": "Cannot score submissions for inactive tasks",
  "task_id": "task-uuid-1",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**400 Bad Request - Wrong Task:**

```json
{
  "success": false,
  "error": "Submission does not belong to the specified task",
  "submission_id": "submission-uuid-1",
  "submission_task_id": "task-uuid-2",
  "requested_task_id": "task-uuid-1",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**400 Bad Request - Soft-Deleted Submission:**

```json
{
  "success": false,
  "error": "Cannot score soft-deleted submissions",
  "submission_id": "submission-uuid-1",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**404 Not Found - Task Not Found:**

```json
{
  "success": false,
  "error": "Task not found",
  "task_id": "invalid-task-uuid",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**404 Not Found - Submission Not Found:**

```json
{
  "success": false,
  "error": "Submission not found",
  "submission_id": "invalid-submission-uuid",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**409 Conflict - Already Scored:**

```json
{
  "success": false,
  "error": "Submission is already scored",
  "submission_id": "submission-uuid-1",
  "current_score": 85,
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to score submission",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

#### 🎯 Task Scoring Features

**Admin/Auto Scoring:**

- **Manual Scoring**: Admin can manually assign scores to submissions
- **Auto Scoring**: Automated scoring systems can use this endpoint
- **Review Notes**: Optional review notes for detailed feedback
- **Point Calculation**: Automatic point calculation and user updates

**Validation Logic:**

- **Task Validation**: Ensures task exists and is active
- **Submission Validation**: Verifies submission exists and belongs to task
- **Score Validation**: Score must be between 0 and 100
- **Status Validation**: Prevents scoring already scored submissions
- **Soft-Delete Protection**: Prevents scoring soft-deleted submissions

**Point System Integration:**

- **Direct Point Award**: Score value equals points awarded
- **User Point Update**: Automatically updates user's total points
- **Point Tracking**: Tracks previous and new point totals
- **Gamification Ready**: Integrates with CaBE Point System v3

**Data Integrity:**

- **Atomic Operations**: Ensures both submission and user updates succeed
- **Timestamp Tracking**: Records scoring timestamp
- **Audit Trail**: Comprehensive logging of all scoring actions
- **Error Handling**: Robust error handling with detailed messages

**Security Constraints:**

- **Admin Only**: Designed for administrative use (assume internal token)
- **Active Task Requirement**: Only active tasks can be scored
- **Submission Ownership**: Ensures submission belongs to specified task
- **Status Protection**: Prevents double-scoring of submissions

**Example Usage:**

**Using curl:**

```bash
# Score a submission for a task
curl -X POST "http://localhost:3001/api/arena/tasks/task-uuid-1/score" \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-1",
    "score": 85,
    "review_notes": "Excellent implementation with clean code structure."
  }'

# Score without review notes
curl -X POST "http://localhost:3001/api/arena/tasks/task-uuid-1/score" \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-2",
    "score": 92
  }'

# Score with perfect score
curl -X POST "http://localhost:3001/api/arena/tasks/task-uuid-1/score" \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-3",
    "score": 100,
    "review_notes": "Perfect implementation! Outstanding work."
  }'
```

**Using JavaScript:**

```javascript
// Score a submission
const scoreSubmission = async (
  taskId,
  submissionId,
  score,
  reviewNotes = null
) => {
  const response = await fetch(
    `http://localhost:3001/api/arena/tasks/${taskId}/score`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission_id: submissionId,
        score: score,
        review_notes: reviewNotes,
      }),
    }
  );

  const data = await response.json();

  if (data.success) {
    console.log('✅ Submission scored successfully!');
    console.log(`Score: ${data.score}`);
    console.log(`Points Awarded: ${data.points_awarded}`);
    console.log(`User: ${data.metadata.user_email}`);
    console.log(`Previous Points: ${data.metadata.previous_points}`);
    console.log(`New Total Points: ${data.metadata.new_total_points}`);

    if (data.metadata.review_notes) {
      console.log(`Review Notes: ${data.metadata.review_notes}`);
    }
  } else {
    console.error(`❌ Scoring failed: ${data.error}`);
  }
};

// Example usage
await scoreSubmission(
  'task-uuid-1',
  'submission-uuid-1',
  85,
  'Great work! Clean code and good documentation.'
);

// Score without review notes
await scoreSubmission('task-uuid-1', 'submission-uuid-2', 92);
```

**Error Handling Examples:**

```javascript
// Handle different error scenarios
try {
  const response = await fetch(
    'http://localhost:3001/api/arena/tasks/task-uuid-1/score',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_id: 'submission-uuid-1',
        score: 85,
      }),
    }
  );

  const data = await response.json();

  if (!data.success) {
    switch (response.status) {
      case 400:
        console.error('Bad Request:', data.error);
        break;
      case 404:
        console.error('Not Found:', data.error);
        break;
      case 409:
        console.error('Conflict - Already Scored:', data.error);
        break;
      case 500:
        console.error('Server Error:', data.error);
        break;
      default:
        console.error('Unknown Error:', data.error);
    }
  }
} catch (error) {
  console.error('Network Error:', error.message);
}
```
