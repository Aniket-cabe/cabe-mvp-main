# Supabase Utility Functions

This document describes the utility functions available in `backend/src/lib/supabase-utils.ts` for common database operations.

## 📁 File Structure

```
backend/src/lib/
├── supabase-admin.ts    # Supabase admin client
└── supabase-utils.ts    # Utility functions for database operations
```

## 🎯 Core Functions

### 1. `createUser(email: string)`

Creates a new user with default points (0).

**Parameters:**

- `email` (string): User's email address (must be unique)

**Returns:** `Promise<DbResult<User>>`

**Example:**

```typescript
import { createUser } from './lib/supabase-utils';

const result = await createUser('user@example.com');
if (result.success) {
  console.log('User created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "points": 0,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. `createTask(title: string, description: string, skill_area: string)`

Creates a new task with the specified details.

**Parameters:**

- `title` (string): Task title
- `description` (string): Task description
- `skill_area` (string): Skill area (e.g., 'frontend', 'backend', 'database')

**Returns:** `Promise<DbResult<Task>>`

**Example:**

```typescript
import { createTask } from './lib/supabase-utils';

const result = await createTask(
  'Build React Component',
  'Create a reusable button component',
  'frontend'
);
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Build React Component",
    "description": "Create a reusable button component",
    "skill_area": "frontend",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. `createSubmission(user_id: string, task_id: string)`

Creates a new submission with default status "pending" and score null.

**Parameters:**

- `user_id` (string): User UUID
- `task_id` (string): Task UUID

**Returns:** `Promise<DbResult<Submission>>`

**Example:**

```typescript
import { createSubmission } from './lib/supabase-utils';

const result = await createSubmission(userId, taskId);
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "user_id": "user-uuid",
    "task_id": "task-uuid",
    "status": "pending",
    "score": null,
    "submitted_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📊 Additional Functions

### 4. `getUsers()`

Retrieves all users ordered by creation date (newest first).

**Returns:** `Promise<DbResult<User[]>>`

### 5. `getTasks()`

Retrieves all tasks ordered by creation date (newest first).

**Returns:** `Promise<DbResult<Task[]>>`

### 6. `updateSubmission(submission_id: string, status: string, score?: number)`

Updates a submission's status and optionally its score.

**Parameters:**

- `submission_id` (string): Submission UUID
- `status` (string): New status
- `score` (number, optional): New score

**Returns:** `Promise<DbResult<Submission>>`

## 🧪 Test Endpoints

The application includes test endpoints to verify the utility functions:

### Create User Test

```bash
POST /api/test/create-user
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Create Task Test

```bash
POST /api/test/create-task
Content-Type: application/json

{
  "title": "Test Task",
  "description": "Test Description",
  "skill_area": "frontend"
}
```

### Create Submission Test

```bash
POST /api/test/create-submission
Content-Type: application/json

{
  "user_id": "user-uuid-here",
  "task_id": "task-uuid-here"
}
```

### Get Users Test

```bash
GET /api/test/users
```

### Get Tasks Test

```bash
GET /api/test/tasks
```

## 🔧 Usage in Routes

### Example Route Implementation

```typescript
import express from 'express';
import { createUser, createTask, getUsers } from './lib/supabase-utils';

const router = express.Router();

// Create user route
router.post('/users', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const result = await createUser(email);

  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Get all users route
router.get('/users', async (req, res) => {
  const result = await getUsers();

  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});
```

## 📝 TypeScript Types

### Database Types

```typescript
export interface User {
  id: string;
  email: string;
  points: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  skill_area: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  task_id: string;
  status: string;
  score: number | null;
  submitted_at: string;
}
```

### Result Type

```typescript
export interface DbResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 🔒 Error Handling

All functions return a consistent `DbResult<T>` type that includes:

- **Success Case**: `{ success: true, data: T }`
- **Error Case**: `{ success: false, error: string }`

### Common Error Scenarios

1. **Duplicate Email**: When creating a user with an existing email
2. **Invalid UUID**: When referencing non-existent users or tasks
3. **Database Connection**: Network or authentication issues
4. **Validation Errors**: Missing required fields

### Error Handling Example

```typescript
const result = await createUser('existing@email.com');

if (!result.success) {
  // Handle error
  logger.error('User creation failed:', result.error);

  if (result.error.includes('duplicate')) {
    return res.status(409).json({ error: 'User already exists' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

// Handle success
logger.info('User created:', result.data);
```

## 🚀 Best Practices

### 1. Always Check Success

```typescript
const result = await createUser(email);
if (!result.success) {
  // Handle error appropriately
  return;
}
// Use result.data
```

### 2. Use TypeScript Types

```typescript
import { User, Task, Submission } from './lib/supabase-utils';

// Type-safe usage
const user: User = result.data!;
```

### 3. Log Operations

The utility functions include built-in logging. Monitor logs for:

- Successful operations
- Failed operations with error details
- Performance insights

### 4. Handle Edge Cases

- Check for required parameters before calling functions
- Handle database constraint violations
- Implement proper error responses

## 🔍 Monitoring

### Log Messages

The utility functions log the following:

- **Success**: `✅ User created successfully: email@example.com`
- **Error**: `Failed to create user: [error details]`

### Performance Monitoring

Monitor these metrics:

- Function execution time
- Database connection success rate
- Error frequency by function type
- Most common error types
