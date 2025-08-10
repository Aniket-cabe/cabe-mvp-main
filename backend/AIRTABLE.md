# Airtable Integration

This backend includes Airtable integration for data management and synchronization.

## 📁 File Structure

```
backend/src/lib/
├── airtable.ts             # Airtable utility functions
├── supabase-admin.ts       # Supabase admin client
├── supabase-utils.ts       # Database utility functions
└── ai.ts                   # AI utility functions
```

## 🔧 Configuration

### Environment Variables

The Airtable integration requires these environment variables:

```env
AIRTABLE_API_KEY=your-airtable-api-key-here
AIRTABLE_BASE_ID=your-airtable-base-id-here
AIRTABLE_TABLE_NAME=your-airtable-table-name-here
```

### Getting Airtable Credentials

1. **Create an account** at [Airtable](https://airtable.com/)
2. **Create a base** with your data
3. **Go to Account > API** to generate an API key
4. **Get your Base ID** from the API documentation
5. **Note your table name** (case-sensitive)

## 🎯 Core Functions

### 1. `getAllAirtableRecords()`

Fetches all records from the configured Airtable table.

**Returns:** `Promise<AirtableResult<AirtableRecord[]>>`

**Example:**

```typescript
import { getAllAirtableRecords } from './lib/airtable';

const result = await getAllAirtableRecords();
if (result.success) {
  console.log(`Fetched ${result.data?.length} records`);
} else {
  console.error('Error:', result.error);
}
```

**Success Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "rec1234567890",
      "fields": {
        "Name": "John Doe",
        "Email": "john@example.com",
        "Status": "Active"
      },
      "createdTime": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. `getAirtableRecord(recordId: string)`

Fetches a single record by ID.

**Parameters:**

- `recordId` (string): The Airtable record ID

**Returns:** `Promise<AirtableResult<AirtableRecord>>`

### 3. `createAirtableRecord(fields: Record<string, any>)`

Creates a new record in Airtable.

**Parameters:**

- `fields` (object): The fields to create the record with

**Returns:** `Promise<AirtableResult<AirtableRecord>>`

**Example:**

```typescript
import { createAirtableRecord } from './lib/airtable';

const result = await createAirtableRecord({
  Name: 'Jane Doe',
  Email: 'jane@example.com',
  Status: 'Active',
});
```

### 4. `updateAirtableRecord(recordId: string, fields: Record<string, any>)`

Updates an existing record in Airtable.

**Parameters:**

- `recordId` (string): The Airtable record ID to update
- `fields` (object): The fields to update

**Returns:** `Promise<AirtableResult<AirtableRecord>>`

### 5. `deleteAirtableRecord(recordId: string)`

Deletes a record from Airtable.

**Parameters:**

- `recordId` (string): The Airtable record ID to delete

**Returns:** `Promise<AirtableResult<boolean>>`

### 6. `testAirtableConnection()`

Tests the Airtable connection by attempting to fetch a single record.

**Returns:** `Promise<AirtableResult<boolean>>`

## 🧪 Test Endpoints

The application includes test endpoints to verify Airtable functionality:

### Get All Records

```bash
GET /api/test/airtable
```

**Success Response:**

```json
{
  "success": true,
  "message": "Airtable records fetched successfully",
  "recordCount": 5,
  "records": [
    {
      "id": "rec1234567890",
      "fields": {
        "Name": "John Doe",
        "Email": "john@example.com"
      },
      "createdTime": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Connection

```bash
GET /api/test/airtable/connection
```

**Success Response:**

```json
{
  "success": true,
  "message": "Airtable connection test successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📝 TypeScript Types

### AirtableRecord Interface

```typescript
export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}
```

### AirtableResult Interface

```typescript
export interface AirtableResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 🔧 Usage in Routes

### Example Route Implementation

```typescript
import express from 'express';
import { getAllAirtableRecords, createAirtableRecord } from './lib/airtable';

const router = express.Router();

// Get all records route
router.get('/records', async (req, res) => {
  const result = await getAllAirtableRecords();

  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Create record route
router.post('/records', async (req, res) => {
  const { fields } = req.body;

  if (!fields) {
    return res.status(400).json({ error: 'Fields are required' });
  }

  const result = await createAirtableRecord(fields);

  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});
```

## 🔒 Error Handling

### Common Error Scenarios

1. **Invalid API Key**: `Invalid API key`
2. **Invalid Base ID**: `Base not found`
3. **Invalid Table Name**: `Table not found`
4. **Rate Limiting**: `Rate limit exceeded`
5. **Network Issues**: `Network timeout`

### Error Handling Example

```typescript
const result = await getAllAirtableRecords();

if (!result.success) {
  if (result.error?.includes('API key')) {
    logger.error('Airtable API key is invalid');
    return res.status(401).json({ error: 'Authentication failed' });
  } else if (result.error?.includes('not found')) {
    logger.error('Airtable base or table not found');
    return res.status(404).json({ error: 'Resource not found' });
  } else {
    logger.error('Airtable error:', result.error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## 📊 Logging and Monitoring

### Log Messages

The Airtable functions log the following:

- **Fetch Start**: `📊 Fetching all records from Airtable table: TableName`
- **Success**: `✅ Successfully fetched 5 records from Airtable`
- **Create**: `📝 Creating new Airtable record with fields: [Name, Email]`
- **Update**: `📝 Updating Airtable record: rec1234567890`
- **Delete**: `🗑️ Deleting Airtable record: rec1234567890`
- **Connection Test**: `🔍 Testing Airtable connection...`
- **Errors**: `❌ Failed to fetch Airtable records: {error details}`

### Performance Monitoring

Monitor these metrics:

- **Response Time**: Time to fetch/update records
- **Success Rate**: Percentage of successful operations
- **Error Rate**: Frequency of API errors
- **Record Count**: Number of records processed

## 🚀 Best Practices

### 1. Error Handling

```typescript
const result = await getAllAirtableRecords();
if (!result.success) {
  // Handle error appropriately
  logger.error('Airtable operation failed:', result.error);
  return;
}
// Use result.data
```

### 2. Batch Operations

For large datasets, consider batching operations:

```typescript
// Fetch records in batches
const batchSize = 100;
let offset = 0;
let allRecords: AirtableRecord[] = [];

while (true) {
  const records = await table
    .select({
      maxRecords: batchSize,
      offset: offset,
    })
    .all();

  if (records.length === 0) break;

  allRecords.push(...records);
  offset += batchSize;
}
```

### 3. Field Validation

Validate fields before creating/updating records:

```typescript
function validateAirtableFields(fields: Record<string, any>): boolean {
  const requiredFields = ['Name', 'Email'];

  for (const field of requiredFields) {
    if (!fields[field]) {
      return false;
    }
  }

  return true;
}
```

### 4. Rate Limiting

Airtable has rate limits. Implement rate limiting for production:

```typescript
const rateLimiter = new Map();

function checkAirtableRateLimit(): boolean {
  const now = Date.now();
  const recentRequests = rateLimiter.get('airtable') || [];
  const validRequests = recentRequests.filter((time) => now - time < 60000);

  if (validRequests.length >= 5) {
    // 5 requests per minute
    return false;
  }

  validRequests.push(now);
  rateLimiter.set('airtable', validRequests);
  return true;
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check `AIRTABLE_API_KEY` is correct
   - Verify key has required permissions
   - Ensure key hasn't expired

2. **"Base not found"**
   - Check `AIRTABLE_BASE_ID` is correct
   - Verify base exists and is accessible
   - Check API key has access to the base

3. **"Table not found"**
   - Check `AIRTABLE_TABLE_NAME` spelling
   - Verify table exists in the base
   - Check case sensitivity

4. **"Rate limit exceeded"**
   - Wait before making more requests
   - Implement rate limiting
   - Check Airtable rate limits

5. **"Network timeout"**
   - Check internet connection
   - Verify firewall settings
   - Check Airtable service status

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
```

This will provide detailed Airtable request/response logs for troubleshooting.

## 📈 Performance Optimization

### 1. Selective Field Fetching

Only fetch the fields you need:

```typescript
const records = await table
  .select({
    fields: ['Name', 'Email', 'Status'],
  })
  .all();
```

### 2. Filtering Records

Use filters to reduce data transfer:

```typescript
const records = await table
  .select({
    filterByFormula: "{Status} = 'Active'",
  })
  .all();
```

### 3. Caching

Cache frequently accessed data:

```typescript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedRecords(): Promise<AirtableRecord[]> {
  const cached = cache.get('records');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const result = await getAllAirtableRecords();
  if (result.success) {
    cache.set('records', {
      data: result.data,
      timestamp: Date.now(),
    });
    return result.data;
  }

  throw new Error(result.error);
}
```

## 🔄 Data Synchronization

### Sync with Supabase

You can sync Airtable data with your Supabase database:

```typescript
import { getAllAirtableRecords } from './lib/airtable';
import { createUser } from './lib/supabase-utils';

async function syncAirtableToSupabase() {
  const airtableResult = await getAllAirtableRecords();

  if (!airtableResult.success) {
    throw new Error(airtableResult.error);
  }

  for (const record of airtableResult.data || []) {
    const { Name, Email } = record.fields;

    // Create user in Supabase
    await createUser(Email);
  }
}
```
