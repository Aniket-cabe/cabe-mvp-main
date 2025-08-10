# Admin API Router

## Overview

The **Admin API Router** is a centralized Express.js router for the CaBE Arena backend that provides a complete REST API for all audit-related admin operations. It serves as the primary interface for the ArenaAuditDashboard and SubmissionInspector admin tools.

## Features

### 🎯 **Core Functionality**

- **Audit Result Viewing**: Fetch full audit runs and summaries
- **Override Logging**: Log manual override actions with review messages
- **Audit Exporting**: Export audit data to CSV or JSON formats
- **Metadata Fetching**: Get available audit runs and statistics
- **Health Monitoring**: System health checks and status reporting

### 🔧 **Advanced Features**

- **Authentication Middleware**: Secure endpoint access (dummy implementation)
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Consistent error responses with detailed messages
- **Response Time Tracking**: Performance monitoring for all requests
- **Type Safety**: Full TypeScript support with proper interfaces

## API Endpoints

### Base URL

```
/api/admin
```

### Authentication

All endpoints require authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

### Response Format

All endpoints return a consistent response format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
```

## Endpoint Reference

### 1. Health Check

**GET** `/api/admin/audit/health`

Returns system health status and uptime information.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:00:00Z",
    "uptime": 3600.5,
    "version": "1.0.0"
  },
  "message": "Admin API is healthy",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/admin/audit/health" \
  -H "Authorization: Bearer your-token"
```

### 2. Get Available Audit Runs

**GET** `/api/admin/audit/available`

Returns a list of all available audit run IDs.

**Response:**

```json
{
  "success": true,
  "data": {
    "runs": ["run-001", "run-002", "run-003"],
    "count": 3
  },
  "message": "Found 3 available audit runs",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/admin/audit/available" \
  -H "Authorization: Bearer your-token"
```

### 3. Get Audit Run Summary

**GET** `/api/admin/audit/summary/:runId`

Returns summary metadata for a specific audit run.

**Parameters:**

- `runId` (path): Audit run ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "run-001",
    "reviewer": "admin-1",
    "startedAt": "2024-01-15T10:00:00Z",
    "completedAt": "2024-01-15T12:30:00Z",
    "taskTitle": "Build a responsive navigation bar",
    "taskDifficulty": "medium",
    "skillArea": "frontend",
    "status": "completed",
    "totalSubmissions": 5,
    "averageDeviation": 15.8,
    "criticalFlags": 2,
    "deviationBreakdown": {
      "none": 1,
      "minor": 2,
      "major": 1,
      "critical": 1
    },
    "actionBreakdown": {
      "allow": 2,
      "flag_for_review": 1,
      "escalate": 1,
      "override": 1
    }
  },
  "message": "Successfully fetched audit summary for run-001",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/admin/audit/summary/run-001" \
  -H "Authorization: Bearer your-token"
```

### 4. Get Full Audit Run

**GET** `/api/admin/audit/:runId`

Returns complete audit run data including all submission results.

**Parameters:**

- `runId` (path): Audit run ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "run-001",
    "reviewer": "admin-1",
    "startedAt": "2024-01-15T10:00:00Z",
    "completedAt": "2024-01-15T12:30:00Z",
    "taskTitle": "Build a responsive navigation bar",
    "taskDifficulty": "medium",
    "skillArea": "frontend",
    "status": "completed",
    "totalSubmissions": 5,
    "averageDeviation": 15.8,
    "criticalFlags": 2,
    "results": [
      {
        "id": "result-1",
        "submissionId": "sub-001",
        "userId": "user-123",
        "userScore": 85,
        "aiScore": 78,
        "deviation": 7,
        "deviationType": "minor",
        "suggestedAction": "flag_for_review",
        "actionTaken": "allow",
        "taskTitle": "Build a responsive navigation bar",
        "skillArea": "frontend",
        "taskDifficulty": "medium",
        "timestamp": "2024-01-15T10:15:00Z",
        "reviewer": "admin-1",
        "notes": "Code quality exceeds AI assessment"
      }
    ]
  },
  "message": "Successfully fetched audit run run-001",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/admin/audit/run-001" \
  -H "Authorization: Bearer your-token"
```

### 5. Log Override Action

**POST** `/api/admin/audit/override`

Logs a manual override action taken by a reviewer.

**Request Body:**

```typescript
interface OverrideRequest {
  submissionId: string;
  reviewer: string;
  actionTaken: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  notes?: string;
  userScore?: number;
  aiScore?: number;
  taskTitle?: string;
  skillArea?: string;
  deviationType?: 'none' | 'minor' | 'major' | 'critical';
}
```

**Example Request:**

```json
{
  "submissionId": "sub-001",
  "reviewer": "admin-1",
  "actionTaken": "override",
  "notes": "Code quality exceeds AI assessment",
  "userScore": 85,
  "aiScore": 60,
  "taskTitle": "Build a responsive navigation bar",
  "skillArea": "frontend",
  "deviationType": "major"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "logEntry": {
      "auditLogId": "log-123",
      "submissionId": "sub-001",
      "reviewer": "admin-1",
      "actionTaken": "override",
      "timestamp": "2024-01-15T10:00:00Z",
      "notes": "Code quality exceeds AI assessment"
    },
    "reviewMessage": "Reviewer admin-1 has overridden submission sub-001 for task \"Build a responsive navigation bar\" (frontend development) - medium-level task. Manual override applied based on reviewer expertise. [AI: 60, User: 85, Deviation: 25]"
  },
  "message": "Successfully logged override action: override",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Example:**

```bash
curl -X POST "http://localhost:3000/api/admin/audit/override" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "sub-001",
    "reviewer": "admin-1",
    "actionTaken": "override",
    "notes": "Code quality exceeds AI assessment",
    "userScore": 85,
    "aiScore": 60,
    "taskTitle": "Build a responsive navigation bar",
    "skillArea": "frontend",
    "deviationType": "major"
  }'
```

### 6. Export Audit Run

**GET** `/api/admin/audit/export/:runId`

Exports an audit run to CSV or JSON format.

**Parameters:**

- `runId` (path): Audit run ID
- `format` (query): Export format (`csv` or `json`)
- `outputDir` (query, optional): Custom output directory
- `flattenResults` (query, optional): Flatten JSON structure (`true` or `false`)

**Response:**

```json
{
  "success": true,
  "data": {
    "filepath": "exports/audit-run-run-001-2024-01-15.csv",
    "filename": "audit-run-run-001-2024-01-15.csv",
    "format": "csv",
    "stats": {
      "totalFiles": 5,
      "csvFiles": 3,
      "jsonFiles": 2,
      "totalSize": "45.2 KB",
      "recentExports": ["audit-run-run-001-2024-01-15.csv"]
    }
  },
  "message": "Successfully exported audit run run-001 as CSV",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Examples:**

```bash
# Export as CSV
curl -X GET "http://localhost:3000/api/admin/audit/export/run-001?format=csv" \
  -H "Authorization: Bearer your-token"

# Export as JSON with flattened results
curl -X GET "http://localhost:3000/api/admin/audit/export/run-001?format=json&flattenResults=true" \
  -H "Authorization: Bearer your-token"

# Export to custom directory
curl -X GET "http://localhost:3000/api/admin/audit/export/run-001?format=csv&outputDir=custom-exports" \
  -H "Authorization: Bearer your-token"
```

### 7. Get Export Statistics

**GET** `/api/admin/audit/stats`

Returns statistics about exported files.

**Query Parameters:**

- `outputDir` (optional): Directory to get stats for

**Response:**

```json
{
  "success": true,
  "data": {
    "totalFiles": 10,
    "csvFiles": 6,
    "jsonFiles": 4,
    "totalSize": "125.8 KB",
    "recentExports": [
      "audit-run-run-001-2024-01-15.csv",
      "audit-run-run-002-2024-01-15.json",
      "audit-run-run-003-2024-01-15.csv"
    ]
  },
  "message": "Successfully fetched export statistics",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/admin/audit/stats" \
  -H "Authorization: Bearer your-token"

# Get stats for specific directory
curl -X GET "http://localhost:3000/api/admin/audit/stats?outputDir=custom-exports" \
  -H "Authorization: Bearer your-token"
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Common Error Codes

| Status | Error Type              | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| 400    | Invalid run ID          | Run ID format is invalid                |
| 400    | Missing required fields | Required request fields are missing     |
| 400    | Invalid action          | Action type is not valid                |
| 400    | Invalid export format   | Export format must be csv or json       |
| 401    | Authentication required | Missing or invalid authorization header |
| 404    | Route not found         | Endpoint does not exist                 |
| 500    | Internal server error   | Unexpected server error                 |

### Error Examples

**Invalid Run ID:**

```json
{
  "success": false,
  "error": "Invalid run ID format",
  "message": "Run ID contains invalid characters",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Missing Authentication:**

```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Missing authorization header",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Invalid Override Data:**

```json
{
  "success": false,
  "error": "Missing required fields",
  "message": "submissionId, reviewer, and actionTaken are required",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Integration Examples

### Frontend Integration (React)

```typescript
// API client for frontend
class AdminApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/admin${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Get available audit runs
  async getAvailableRuns() {
    return this.request<{ runs: string[]; count: number }>('/audit/available');
  }

  // Get audit run summary
  async getAuditSummary(runId: string) {
    return this.request(`/audit/summary/${runId}`);
  }

  // Get full audit run
  async getAuditRun(runId: string) {
    return this.request(`/audit/${runId}`);
  }

  // Log override action
  async logOverride(overrideData: OverrideRequest) {
    return this.request('/audit/override', {
      method: 'POST',
      body: JSON.stringify(overrideData),
    });
  }

  // Export audit run
  async exportAuditRun(runId: string, format: 'csv' | 'json', options?: ExportOptions) {
    const params = new URLSearchParams({ format });
    if (options?.outputDir) params.append('outputDir', options.outputDir);
    if (options?.flattenResults) params.append('flattenResults', 'true');

    return this.request(`/audit/export/${runId}?${params}`);
  }

  // Get export statistics
  async getExportStats(outputDir?: string) {
    const params = outputDir ? `?outputDir=${outputDir}` : '';
    return this.request(`/audit/stats${params}`);
  }
}

// Usage in React component
const AdminDashboard: React.FC = () => {
  const [auditRuns, setAuditRuns] = useState<string[]>([]);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any>(null);

  const apiClient = new AdminApiClient('http://localhost:3000', 'your-token');

  useEffect(() => {
    // Load available audit runs
    apiClient.getAvailableRuns()
      .then(data => setAuditRuns(data.runs))
      .catch(error => console.error('Failed to load audit runs:', error));
  }, []);

  const handleRunSelect = async (runId: string) => {
    try {
      const data = await apiClient.getAuditRun(runId);
      setAuditData(data.data);
      setSelectedRun(runId);
    } catch (error) {
      console.error('Failed to load audit run:', error);
    }
  };

  const handleOverride = async (overrideData: OverrideRequest) => {
    try {
      const result = await apiClient.logOverride(overrideData);
      console.log('Override logged:', result.data.reviewMessage);
      // Refresh audit data
      if (selectedRun) {
        handleRunSelect(selectedRun);
      }
    } catch (error) {
      console.error('Failed to log override:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!selectedRun) return;

    try {
      const result = await apiClient.exportAuditRun(selectedRun, format);
      console.log('Export completed:', result.data.filepath);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  return (
    <div>
      {/* Dashboard UI */}
    </div>
  );
};
```

### Backend Integration

```typescript
// Integration with main Express app
import express from 'express';
import adminApiRouter from './routes/admin-api-router';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// Mount admin API router
app.use('/api/admin', adminApiRouter);

// Error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Admin API server running on port ${PORT}`);
});
```

## Middleware

### Authentication Middleware

Currently implements a dummy authentication check. In production, replace with real JWT validation:

```typescript
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Missing authorization header',
      timestamp: new Date().toISOString(),
    });
  }

  // TODO: Implement real JWT validation
  // const token = authHeader.replace('Bearer ', '');
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // req.user = decoded;

  next();
};
```

### Response Time Tracking

Logs response times for all requests:

```typescript
const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
};
```

### Input Validation

Validates and sanitizes request parameters:

```typescript
const validateRunId = (req: Request, res: Response, next: NextFunction) => {
  const { runId } = req.params;

  if (!runId || typeof runId !== 'string' || runId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid run ID',
      message: 'Run ID is required and must be a non-empty string',
      timestamp: new Date().toISOString(),
    });
  }

  // Sanitize run ID
  if (!/^[a-zA-Z0-9-_]+$/.test(runId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid run ID format',
      message: 'Run ID contains invalid characters',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};
```

## Testing

Run the comprehensive test suite:

```bash
cd backend
npx ts-node scripts/test-admin-api-router.ts
```

The test suite covers:

- All API endpoints
- Authentication and authorization
- Input validation
- Error handling
- Response time tracking
- Performance testing
- API response structure validation

## Security Considerations

### Input Validation

- All run IDs are validated and sanitized
- Request bodies are validated for required fields
- Export formats are restricted to allowed values

### Authentication

- All endpoints require authentication
- Authorization header validation
- Ready for JWT token implementation

### Error Handling

- No sensitive information leaked in error messages
- Consistent error response format
- Proper HTTP status codes

### Rate Limiting

Consider implementing rate limiting for production:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/admin', limiter, adminApiRouter);
```

## Performance Considerations

### Response Time Tracking

All requests are tracked for performance monitoring:

- Logs method, path, status code, and duration
- Helps identify slow endpoints
- Enables performance optimization

### Caching

Consider implementing caching for frequently accessed data:

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// Cache audit run data
const cachedAuditRun = cache.get(runId);
if (cachedAuditRun) {
  return res.json(cachedAuditRun);
}
```

### Database Optimization

- Use database indexes for run ID lookups
- Implement pagination for large result sets
- Consider read replicas for heavy read workloads

## Future Enhancements

### Planned Features

- **Real Authentication**: JWT token validation
- **Rate Limiting**: Request throttling
- **Caching**: Redis-based caching
- **Pagination**: Large result set handling
- **Filtering**: Query-based filtering
- **Sorting**: Result sorting options
- **WebSocket Support**: Real-time updates
- **File Upload**: Direct file upload support

### Extension Points

- **Custom Middleware**: Plugin system for custom middleware
- **Response Transformers**: Custom response formatting
- **Validation Schemas**: JSON Schema validation
- **API Versioning**: Versioned API endpoints
- **Documentation**: Auto-generated API docs

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure Authorization header is present
   - Check token format: `Bearer <token>`
   - Verify token validity

2. **Validation Errors**
   - Check request body format
   - Ensure all required fields are present
   - Validate data types and formats

3. **Export Errors**
   - Verify run ID exists
   - Check file system permissions
   - Ensure sufficient disk space

4. **Performance Issues**
   - Monitor response times in logs
   - Check database query performance
   - Consider implementing caching

### Debug Mode

Enable debug logging:

```typescript
// Add to your environment
DEBUG=admin-api:*

// Or enable in code
console.log('Debug info:', { req: req.path, body: req.body });
```

## Support

For issues and questions:

- Check the test suite for usage examples
- Review error messages and logs
- Verify authentication and permissions
- Test with minimal data first
- Check API documentation

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: CaBE Arena Development Team
