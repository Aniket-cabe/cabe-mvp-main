# Arena Audit CSV Export Guide

This guide explains how to use the Arena audit CSV export API to download audit results for analysis and reporting.

## 🚀 Quick Start

### Basic Export (Last 30 Days)

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "audit_export_30days.csv"
```

### Export Specific Audit Run

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?runId=audit_2024_08_01_1234567890" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "audit_export_run.csv"
```

## 📋 API Reference

### Endpoint

```
GET /api/admin/audit/export
```

### Authentication

- **Required**: Platinum rank or higher
- **Headers**: `Authorization: Bearer <token>`

### Query Parameters

| Parameter             | Type   | Required | Default | Description                                             |
| --------------------- | ------ | -------- | ------- | ------------------------------------------------------- |
| `runId`               | string | No       | -       | Export specific audit run by ID                         |
| `days`                | number | No       | 30      | Export results from last N days                         |
| `skill_area`          | string | No       | all     | Filter by skill area (frontend, backend, content, data) |
| `status`              | string | No       | all     | Filter by status (pass, minor, major, critical)         |
| `deviation_threshold` | number | No       | -       | Filter by minimum deviation                             |

### Response

- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="audit_export_<date>.csv"`
- **Body**: CSV file with audit results

## 📊 CSV Structure

### Headers

```csv
task_id,user_id,skill_area,original_score,new_score,deviation,status,critical_issue,timestamp,audit_run_id
```

### Data Fields

| Field            | Type    | Description                                   |
| ---------------- | ------- | --------------------------------------------- |
| `task_id`        | string  | Unique task identifier                        |
| `user_id`        | string  | User who submitted the task                   |
| `skill_area`     | string  | Skill area (frontend, backend, content, data) |
| `original_score` | number  | Original AI score                             |
| `new_score`      | number  | Re-scored AI score                            |
| `deviation`      | number  | Absolute difference between scores            |
| `status`         | string  | Audit status (pass, minor, major, critical)   |
| `critical_issue` | boolean | Whether this is flagged as critical           |
| `timestamp`      | string  | ISO timestamp of audit                        |
| `audit_run_id`   | string  | ID of the audit run                           |

### Example CSV Output

```csv
task_id,user_id,skill_area,original_score,new_score,deviation,status,critical_issue,timestamp,audit_run_id
task-001,user-123,frontend,85,82,3,pass,false,2024-08-01T10:00:00Z,audit_2024_08_01_123456
task-002,user-456,backend,80,65,15,critical,true,2024-08-01T11:00:00Z,audit_2024_08_01_123456
task-003,user-789,content,90,85,5,minor,false,2024-08-01T12:00:00Z,audit_2024_08_01_123456
```

## 🔍 Usage Examples

### 1. Export Last 7 Days

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "audit_export_7days.csv"
```

### 2. Export Frontend Only

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?skill_area=frontend" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "frontend_audit_export.csv"
```

### 3. Export Critical Issues Only

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?status=critical" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "critical_issues_export.csv"
```

### 4. Export High Deviation Results (>10 points)

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?deviation_threshold=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "high_deviation_export.csv"
```

### 5. Export Backend Critical Issues

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?skill_area=backend&status=critical" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "backend_critical_export.csv"
```

### 6. Export High Deviation Frontend Results

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?skill_area=frontend&deviation_threshold=15" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "frontend_high_deviation_export.csv"
```

### 7. Export Last 90 Days

```bash
curl -X GET "https://cabe.ai/api/admin/audit/export?days=90" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "audit_export_90days.csv"
```

## 🛠️ JavaScript/Node.js Examples

### Using Fetch API

```javascript
async function exportAuditData(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `https://cabe.ai/api/admin/audit/export?${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${YOUR_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }

  const blob = await response.blob();
  const filename =
    response.headers.get('content-disposition')?.split('filename=')[1] ||
    'audit_export.csv';

  // Download the file
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Usage examples
exportAuditData({ days: 7, skill_area: 'frontend' });
exportAuditData({ status: 'critical', deviation_threshold: 10 });
```

### Using Axios

```javascript
import axios from 'axios';

async function exportAuditData(params = {}) {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://cabe.ai/api/admin/audit/export',
      params,
      headers: {
        Authorization: `Bearer ${YOUR_TOKEN}`,
      },
      responseType: 'blob',
    });

    // Extract filename from headers
    const contentDisposition = response.headers['content-disposition'];
    const filename =
      contentDisposition?.split('filename=')[1] || 'audit_export.csv';

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
}
```

## 📈 Data Analysis Examples

### Using Python with pandas

```python
import pandas as pd
import requests

def download_audit_data(params=None):
    url = "https://cabe.ai/api/admin/audit/export"
    headers = {"Authorization": f"Bearer {YOUR_TOKEN}"}

    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()

    # Save to file
    filename = f"audit_export_{pd.Timestamp.now().strftime('%Y%m%d')}.csv"
    with open(filename, 'wb') as f:
        f.write(response.content)

    return pd.read_csv(filename)

# Load data
df = download_audit_data({'days': 30})

# Analysis examples
print(f"Total audit results: {len(df)}")
print(f"Average deviation: {df['deviation'].mean():.2f}")
print(f"Critical issues: {df['critical_issue'].sum()}")

# Group by skill area
skill_analysis = df.groupby('skill_area').agg({
    'deviation': ['mean', 'std', 'count'],
    'critical_issue': 'sum'
}).round(2)

print("\nSkill Area Analysis:")
print(skill_analysis)

# Status distribution
status_dist = df['status'].value_counts()
print(f"\nStatus Distribution:\n{status_dist}")
```

### Using R

```r
library(httr)
library(readr)
library(dplyr)

download_audit_data <- function(params = list()) {
  url <- "https://cabe.ai/api/admin/audit/export"
  headers <- add_headers(Authorization = paste("Bearer", YOUR_TOKEN))

  response <- GET(url, query = params, headers)
  stop_for_status(response)

  # Save to temporary file
  temp_file <- tempfile(fileext = ".csv")
  writeBin(content(response, "raw"), temp_file)

  # Read and return data
  data <- read_csv(temp_file)
  unlink(temp_file)

  return(data)
}

# Load data
df <- download_audit_data(list(days = 30))

# Analysis
cat("Total audit results:", nrow(df), "\n")
cat("Average deviation:", mean(df$deviation), "\n")
cat("Critical issues:", sum(df$critical_issue), "\n")

# Skill area analysis
skill_analysis <- df %>%
  group_by(skill_area) %>%
  summarise(
    mean_deviation = mean(deviation),
    sd_deviation = sd(deviation),
    count = n(),
    critical_count = sum(critical_issue)
  )

print(skill_analysis)
```

## 🔒 Security Considerations

### Access Control

- **Platinum+ Required**: Only users with platinum rank or higher can access
- **Audit Logging**: All export requests are logged with user details
- **Rate Limiting**: Exports are subject to rate limiting to prevent abuse

### Data Privacy

- **User Anonymization**: Consider anonymizing user IDs for external analysis
- **Data Retention**: Exported data should be handled according to privacy policies
- **Secure Storage**: Store exported files securely and delete when no longer needed

## 📊 Best Practices

### 1. File Management

```bash
# Create organized directory structure
mkdir -p audit_exports/{daily,weekly,monthly}
mkdir -p audit_exports/{frontend,backend,content,data}
mkdir -p audit_exports/{critical,high_deviation,all}
```

### 2. Automated Downloads

```bash
#!/bin/bash
# Daily audit export script

DATE=$(date +%Y%m%d)
TOKEN="YOUR_TOKEN"

# Export last 7 days
curl -X GET "https://cabe.ai/api/admin/audit/export?days=7" \
  -H "Authorization: Bearer $TOKEN" \
  -o "audit_exports/daily/audit_export_7days_$DATE.csv"

# Export critical issues
curl -X GET "https://cabe.ai/api/admin/audit/export?status=critical" \
  -H "Authorization: Bearer $TOKEN" \
  -o "audit_exports/critical/critical_issues_$DATE.csv"

echo "Audit exports completed for $DATE"
```

### 3. Data Validation

```python
def validate_audit_export(csv_file):
    df = pd.read_csv(csv_file)

    # Check required columns
    required_columns = [
        'task_id', 'user_id', 'skill_area', 'original_score',
        'new_score', 'deviation', 'status', 'critical_issue',
        'timestamp', 'audit_run_id'
    ]

    missing_columns = set(required_columns) - set(df.columns)
    if missing_columns:
        raise ValueError(f"Missing columns: {missing_columns}")

    # Validate data types
    assert df['deviation'].dtype in ['int64', 'float64'], "Deviation must be numeric"
    assert df['critical_issue'].dtype == 'bool', "Critical issue must be boolean"

    # Validate ranges
    assert df['deviation'].min() >= 0, "Deviation cannot be negative"
    assert df['original_score'].between(0, 100).all(), "Original score must be 0-100"
    assert df['new_score'].between(0, 100).all(), "New score must be 0-100"

    print(f"✅ Audit export validation passed: {len(df)} records")
    return df
```

## 🚨 Troubleshooting

### Common Issues

#### 403 Forbidden

```
Error: You can only view your own task analytics or must be an admin
```

**Solution**: Ensure you have platinum rank or higher

#### 404 Not Found

```
Error: No audit results found for the specified criteria
```

**Solution**: Check your filter parameters and date ranges

#### Large File Downloads

```
Error: Request timeout or memory issues
```

**Solution**:

- Use smaller date ranges
- Apply filters to reduce data size
- Use pagination if available

#### CSV Parsing Issues

```
Error: Malformed CSV or encoding issues
```

**Solution**:

- Check for proper CSV escaping
- Verify UTF-8 encoding
- Validate CSV structure

### Debug Mode

```bash
# Enable debug logging
curl -X GET "https://cabe.ai/api/admin/audit/export?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Debug: true" \
  -v
```

## 📞 Support

For issues with the audit export API:

1. **Check Logs**: Review server logs for detailed error messages
2. **Validate Parameters**: Ensure all query parameters are correct
3. **Test Permissions**: Verify your user rank and permissions
4. **Contact Admin**: Reach out to system administrators for assistance

## 🔄 Integration Examples

### GitHub Actions Workflow

```yaml
name: Daily Audit Export
on:
  schedule:
    - cron: '0 6 * * *' # Daily at 6 AM

jobs:
  export-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Export Audit Data
        run: |
          curl -X GET "https://cabe.ai/api/admin/audit/export?days=1" \
            -H "Authorization: Bearer ${{ secrets.AUDIT_TOKEN }}" \
            -o "audit_export_$(date +%Y%m%d).csv"

      - name: Upload to Artifacts
        uses: actions/upload-artifact@v2
        with:
          name: audit-export-${{ github.run_number }}
          path: audit_export_*.csv
```

### Slack Integration

```javascript
// Slack bot command to trigger export
app.command('/export-audit', async ({ command, ack, respond }) => {
  await ack();

  try {
    const response = await fetch(
      'https://cabe.ai/api/admin/audit/export?days=7',
      {
        headers: { Authorization: `Bearer ${AUDIT_TOKEN}` },
      }
    );

    if (response.ok) {
      await respond({
        text: '✅ Audit export completed! Check your email for the CSV file.',
        response_type: 'ephemeral',
      });
    } else {
      await respond({
        text: '❌ Audit export failed. Please try again later.',
        response_type: 'ephemeral',
      });
    }
  } catch (error) {
    await respond({
      text: '❌ Export request failed. Please contact an administrator.',
      response_type: 'ephemeral',
    });
  }
});
```

This comprehensive guide covers all aspects of the Arena audit CSV export functionality! 🚀
