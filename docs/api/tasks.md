# Tasks API

The Tasks API provides read-only access to TaskMaster tasks from the `.taskmaster/tasks/tasks.json` file.

## Base URL

All task endpoints are prefixed with `/api/tasks`

## Endpoints

### GET /api/tasks

Get all tasks from TaskMaster.

#### Request

- **Method**: `GET`
- **URL**: `/api/tasks`
- **Query Parameters**: None

#### Response

**Status**: `200 OK`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": "1",
      "title": "Setup project infrastructure",
      "description": "Initialize project with necessary tools",
      "status": "done",
      "priority": "high",
      "dependencies": [],
      "subtasks": [
        {
          "id": "1.1",
          "title": "Initialize npm project",
          "description": "Create package.json and install dependencies",
          "status": "done",
          "priority": "high",
          "dependencies": []
        }
      ]
    },
    {
      "id": "2",
      "title": "Implement authentication",
      "description": "Add JWT-based authentication",
      "status": "in-progress",
      "priority": "high",
      "dependencies": ["1"]
    }
  ]
}
```

**Error Response (500)**:
```json
{
  "success": false,
  "message": "Failed to load tasks: tasks.json not found"
}
```

#### Example

```bash
curl http://localhost:5000/api/tasks
```

---

### GET /api/tasks/current

Get the current task to work on (first task with status "in-progress" or "pending").

#### Request

- **Method**: `GET`
- **URL**: `/api/tasks/current`
- **Query Parameters**: None

#### Response

**Status**: `200 OK` or `404 Not Found`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "task": {
    "id": "2.1",
    "title": "Implement JWT middleware",
    "description": "Create Express middleware for JWT validation",
    "status": "in-progress",
    "priority": "high",
    "dependencies": ["2"]
  }
}
```

**Error Response (404 - No Current Task)**:
```json
{
  "success": false,
  "message": "No current task found"
}
```

#### Logic

1. Search for any task with status `"in-progress"` (including subtasks)
2. If none found, search for first task with status `"pending"`
3. If none found, return 404

#### Example

```bash
curl http://localhost:5000/api/tasks/current
```

---

### GET /api/tasks/:id

Get a specific task by ID. Supports both main tasks and subtasks (including nested subtasks).

#### Request

- **Method**: `GET`
- **URL**: `/api/tasks/:id`
- **Path Parameters**:
  - `id` (required): Task ID (string or number)
    - Main task: `"1"`, `"2"`, etc.
    - Subtask: `"1.1"`, `"2.3"`, etc.
    - Nested subtask: `"1.1.2"`, `"2.3.1"`, etc.

#### Response

**Status**: `200 OK` or `404 Not Found`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "task": {
    "id": "2.1",
    "title": "Implement JWT middleware",
    "description": "Create Express middleware for JWT validation",
    "status": "pending",
    "priority": "high",
    "dependencies": ["2"],
    "subtasks": []
  }
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "Task 99 not found"
}
```

#### Examples

**Get main task**:
```bash
curl http://localhost:5000/api/tasks/1
```

**Get subtask**:
```bash
curl http://localhost:5000/api/tasks/2.1
```

**Get nested subtask**:
```bash
curl http://localhost:5000/api/tasks/1.2.3
```

---

## Task Schema

### Task Object

```typescript
{
  id: number | string,           // Task ID (e.g., "1", "1.2", "1.2.3")
  title: string,                 // Task title
  description: string,           // Task description
  status: TaskStatus,            // Task status
  priority?: TaskPriority,       // Optional priority
  dependencies?: (number|string)[], // Optional dependencies
  subtasks?: Task[]              // Optional nested subtasks
}
```

### TaskStatus

Valid values:
- `"pending"` - Ready to work on
- `"in-progress"` - Currently being worked on
- `"done"` - Completed
- `"blocked"` - Blocked by dependencies or external factors
- `"deferred"` - Postponed
- `"cancelled"` - No longer needed

### TaskPriority

Valid values:
- `"high"` - High priority
- `"medium"` - Medium priority
- `"low"` - Low priority

---

## Real-Time Updates

Tasks are watched for changes using file system monitoring. When `tasks.json` changes, all connected WebSocket clients receive an update event.

See [WebSocket Documentation](./websocket.md) for details on subscribing to task updates.

---

## Data Source

Tasks are read from `.taskmaster/tasks/tasks.json` in the project root.

The service expects the following file structure:

```json
{
  "master": {
    "tasks": [
      { "id": "1", "title": "...", ... }
    ]
  }
}
```

Or the simplified format:

```json
{
  "tasks": [
    { "id": "1", "title": "...", ... }
  ]
}
```

---

## Notes

- **Read-Only**: The Tasks API is read-only. Tasks must be modified using TaskMaster CLI commands.
- **Recursive Search**: Task lookups search through all levels of subtasks.
- **ID Format**: Task IDs can be strings or numbers. Subtask IDs use dot notation (e.g., "1.2.3").
- **Validation**: All task data is validated using Zod schemas before being returned.

---

## Error Handling

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| `404` | "No current task found" | All tasks are done or cancelled |
| `404` | "Task {id} not found" | Invalid task ID |
| `500` | "Failed to load tasks" | tasks.json missing or invalid |
| `500` | "Task validation failed" | tasks.json contains invalid data |

### Example Error Response

```json
{
  "success": false,
  "message": "Task validation failed: Invalid enum value for status"
}
```
