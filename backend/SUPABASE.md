# Supabase Integration

This backend includes a Supabase admin client with service role access for database operations.

## 📁 File Structure

```
backend/src/
├── lib/
│   └── supabase-admin.ts  # Supabase admin client
├── config/
│   └── env.ts            # Environment configuration
└── app.ts                # Express app with Supabase routes
```

## 🔧 Configuration

### Environment Variables

The Supabase client requires these environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Service Role Access

The admin client uses the service role key, which provides:

- **Full Database Access**: Bypass Row Level Security (RLS)
- **Admin Operations**: Create, read, update, delete any data
- **Schema Management**: Modify database schema
- **User Management**: Manage user accounts and permissions

⚠️ **Security Warning**: The service role key has full access. Use it only in trusted server environments.

## 🚀 Usage

### Import the Admin Client

```typescript
import supabaseAdmin from './lib/supabase-admin';

// Or import the named export
import { supabaseAdmin } from './lib/supabase-admin';
```

### Basic Database Operations

```typescript
// Select data
const { data, error } = await supabaseAdmin
  .from('your_table')
  .select('*')
  .eq('column', 'value');

// Insert data
const { data, error } = await supabaseAdmin
  .from('your_table')
  .insert({ column: 'value' })
  .select();

// Update data
const { data, error } = await supabaseAdmin
  .from('your_table')
  .update({ column: 'new_value' })
  .eq('id', 1)
  .select();

// Delete data
const { error } = await supabaseAdmin.from('your_table').delete().eq('id', 1);
```

### User Management

```typescript
// Create a new user
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'user@example.com',
  password: 'secure-password',
  email_confirm: true,
});

// Get user by ID
const { data, error } = await supabaseAdmin.auth.admin.getUserById('user-id');

// Update user
const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
  'user-id',
  {
    email: 'new-email@example.com',
  }
);

// Delete user
const { error } = await supabaseAdmin.auth.admin.deleteUser('user-id');
```

### Row Level Security (RLS)

```typescript
// Enable RLS on a table
const { error } = await supabaseAdmin.rpc('enable_rls', {
  table_name: 'your_table',
});

// Create RLS policies
const { error } = await supabaseAdmin.rpc('create_policy', {
  table_name: 'your_table',
  policy_name: 'users_can_read_own_data',
  definition: 'SELECT USING (auth.uid() = user_id)',
});
```

## 🧪 Testing

### Test Endpoints

The application includes two test endpoints to verify Supabase connectivity:

#### 1. Connection Test (`/api/supabase/test`)

Tests basic Supabase connectivity:

```bash
curl http://localhost:3001/api/supabase/test
```

**Success Response:**

```json
{
  "message": "Supabase admin client is working",
  "connection": "success",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Read Test (`/api/test/supabase`)

Performs an actual read operation on the `users` table:

```bash
curl http://localhost:3001/api/test/supabase
```

**Success Response:**

```json
{
  "success": true,
  "message": "Supabase read test completed successfully",
  "rowCount": 1
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

### Manual Testing

You can test the client directly in your code:

```typescript
import supabaseAdmin from './lib/supabase-admin';

// Test read operation
const { data, error } = await supabaseAdmin.from('users').select('*').limit(1);

if (error) {
  console.error('Read test failed:', error);
} else {
  console.log('Read test successful, found', data?.length, 'rows');
}
```

## 🔒 Security Best Practices

### 1. Environment Variables

- Never commit service role keys to version control
- Use different keys for different environments
- Rotate keys regularly

### 2. Access Control

- Use RLS policies for user data
- Limit service role usage to admin operations
- Implement proper authentication for user-facing operations

### 3. Error Handling

- Don't expose internal errors to clients
- Log errors for debugging
- Use environment-specific error messages

### 4. Connection Management

- The client is configured with `persistSession: false`
- No session tokens are stored
- Suitable for server-side operations only

## 📊 Monitoring

### Logging

The Supabase client initialization and test results are logged:

```
✅ Supabase admin client initialized with service role access
✅ Supabase read test successful - connection working
❌ Supabase read test error: [error details]
```

### Error Tracking

Monitor these common issues:

- **Connection failures**: Check URL and network connectivity
- **Authentication errors**: Verify service role key
- **Permission errors**: Check RLS policies and table permissions
- **Rate limiting**: Monitor API usage limits

## 🔧 Configuration Options

The admin client is configured with:

```typescript
{
  auth: {
    autoRefreshToken: false,  // No token refresh needed
    persistSession: false,    // No session persistence
  },
  db: {
    schema: 'public',         // Default schema
  },
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Ensure key has service role permissions

2. **"Invalid URL"**
   - Check `SUPABASE_URL` format
   - Ensure URL includes `https://` and `.supabase.co`

3. **"Connection timeout"**
   - Check network connectivity
   - Verify firewall settings
   - Check Supabase service status

4. **"Permission denied"**
   - Verify service role has required permissions
   - Check RLS policies if applicable
   - Ensure table exists and is accessible

5. **"Table does not exist"**
   - Ensure the `users` table exists in your Supabase database
   - Check table name spelling and case sensitivity
   - Verify the table is in the `public` schema

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
```

This will provide detailed Supabase client logs for troubleshooting.
