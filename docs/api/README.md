# TaskMaster Web Integration API Documentation

Complete API reference for the TaskMaster Web Integration backend service.

## Overview

The TaskMaster Web Integration API provides REST endpoints for managing tasks and issues in TaskMaster projects. It includes real-time WebSocket support for live updates.

**Base URL**: `http://localhost:5000`

**Content Type**: `application/json` (unless otherwise specified)

**Authentication**: None (currently unauthenticated)

## API Endpoints

### Tasks API
- [Tasks Endpoints](./tasks.md) - View and query TaskMaster tasks

### Issues API
- [Issues Endpoints](./issues.md) - Create, read, update, and delete issues

### WebSocket API
- [WebSocket Documentation](./websocket.md) - Real-time task updates

### Common Usage Examples
- [Examples & Use Cases](./examples.md) - Common API usage patterns

## Quick Start

### Get All Tasks
```bash
curl http://localhost:5000/api/tasks
```

### Get Current Task
```bash
curl http://localhost:5000/api/tasks/current
```

### Create an Issue
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug in authentication",
    "description": "Users cannot log in",
    "severity": "critical",
    "status": "open"
  }'
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional validation errors
}
```

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | OK - Request succeeded |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request data |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error - Server error |

## Data Schemas

### Task Schema
```typescript
{
  id: number | string,           // Task ID (e.g., "1", "1.2", "1.2.3")
  title: string,                 // Task title
  description: string,           // Task description
  status: TaskStatus,            // "pending" | "in-progress" | "done" | "blocked" | "deferred" | "cancelled"
  priority?: TaskPriority,       // "high" | "medium" | "low"
  dependencies?: (number|string)[], // Array of task IDs
  subtasks?: Task[]              // Nested subtasks
}
```

### Issue Schema
```typescript
{
  id: string,                    // Unique ID (e.g., "issue-1234567890-abc12")
  title: string,                 // Issue title
  description: string,           // Issue description
  severity: IssueSeverity,       // "critical" | "high" | "medium" | "low"
  status: IssueStatus,           // "open" | "in-progress" | "resolved"
  relatedTaskId?: string,        // Optional task ID
  tags: string[],                // Array of tags
  attachments: string[],         // Array of attachment filenames
  createdAt: string,             // ISO 8601 timestamp
  updatedAt: string              // ISO 8601 timestamp
}
```

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

## CORS

CORS is enabled for all origins in development mode. Production deployments should configure CORS appropriately.

## Error Handling

All endpoints use a consistent error handling middleware. Errors include:

1. **Validation Errors** - Invalid request data (400)
2. **Not Found Errors** - Resource not found (404)
3. **Server Errors** - Internal server errors (500)

Example error response:
```json
{
  "success": false,
  "message": "Invalid issue data",
  "errors": [
    {
      "path": ["severity"],
      "message": "Invalid enum value. Expected 'critical' | 'high' | 'medium' | 'low'"
    }
  ]
}
```

## File Storage

### Tasks
Tasks are read from `.taskmaster/tasks/tasks.json` and watched for real-time updates.

### Issues
Issues are stored as individual JSON files in `.taskmaster/issues/` with the format:
```
.taskmaster/issues/issue-{timestamp}-{random}.json
```

### Attachments
Issue attachments are stored in `.taskmaster/issues/attachments/` with unique filenames.

## Development

### Starting the Server
```bash
npm run dev
```

The server will start on port 5000 (or PORT environment variable).

### Environment Variables
- `PORT` - Server port (default: 5000)
- `PROJECT_ROOT` - TaskMaster project root (default: current directory)

## Further Reading

- [Tasks API Documentation](./tasks.md)
- [Issues API Documentation](./issues.md)
- [WebSocket Documentation](./websocket.md)
- [Usage Examples](./examples.md)
