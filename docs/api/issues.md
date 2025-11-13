# Issues API

The Issues API provides full CRUD (Create, Read, Update, Delete) operations for managing issues in TaskMaster projects.

## Base URL

All issue endpoints are prefixed with `/api/issues`

## Endpoints

### GET /api/issues

Get all issues, optionally filtered by task ID.

#### Request

- **Method**: `GET`
- **URL**: `/api/issues`
- **Query Parameters**:
  - `taskId` (optional): Filter issues by related task ID

#### Response

**Status**: `200 OK`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "issues": [
    {
      "id": "issue-1736849462123-abc12",
      "title": "Authentication bug",
      "description": "Users cannot log in with correct credentials",
      "severity": "critical",
      "status": "open",
      "relatedTaskId": "2.1",
      "tags": ["bug", "security"],
      "attachments": ["1736849462123-abc12-screenshot.png"],
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    }
  ]
}
```

#### Examples

**Get all issues**:
```bash
curl http://localhost:5000/api/issues
```

**Filter by task ID**:
```bash
curl "http://localhost:5000/api/issues?taskId=2.1"
```

---

### GET /api/issues/:id

Get a specific issue by ID.

#### Request

- **Method**: `GET`
- **URL**: `/api/issues/:id`
- **Path Parameters**:
  - `id` (required): Issue ID (e.g., `"issue-1736849462123-abc12"`)

#### Response

**Status**: `200 OK` or `404 Not Found`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "issue": {
    "id": "issue-1736849462123-abc12",
    "title": "Authentication bug",
    "description": "Users cannot log in with correct credentials",
    "severity": "critical",
    "status": "open",
    "relatedTaskId": "2.1",
    "tags": ["bug", "security"],
    "attachments": [],
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "Issue issue-1736849462123-abc12 not found"
}
```

#### Example

```bash
curl http://localhost:5000/api/issues/issue-1736849462123-abc12
```

---

### POST /api/issues

Create a new issue.

#### Request

- **Method**: `POST`
- **URL**: `/api/issues`
- **Content-Type**: `application/json`
- **Request Body**:

```typescript
{
  title: string,                 // Required: Issue title
  description: string,           // Required: Issue description
  severity: IssueSeverity,       // Required: "critical" | "high" | "medium" | "low"
  status: IssueStatus,           // Required: "open" | "in-progress" | "resolved"
  relatedTaskId?: string,        // Optional: Related task ID
  tags?: string[],               // Optional: Array of tags (default: [])
  attachments?: string[]         // Optional: Array of attachment filenames (default: [])
}
```

#### Response

**Status**: `201 Created` or `400 Bad Request`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "issue": {
    "id": "issue-1736849462123-abc12",
    "title": "Authentication bug",
    "description": "Users cannot log in with correct credentials",
    "severity": "critical",
    "status": "open",
    "relatedTaskId": "2.1",
    "tags": ["bug"],
    "attachments": [],
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**Error Response (400 - Validation Error)**:
```json
{
  "success": false,
  "message": "Invalid issue data",
  "errors": [
    {
      "path": ["severity"],
      "message": "Invalid enum value. Expected 'critical' | 'high' | 'medium' | 'low', received 'urgent'"
    }
  ]
}
```

#### Examples

**Create basic issue**:
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Authentication bug",
    "description": "Users cannot log in",
    "severity": "critical",
    "status": "open"
  }'
```

**Create issue with all fields**:
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Performance issue",
    "description": "API response time is slow",
    "severity": "medium",
    "status": "open",
    "relatedTaskId": "3.2",
    "tags": ["performance", "api"],
    "attachments": ["profile-report.txt"]
  }'
```

---

### PUT /api/issues/:id

Update an existing issue.

#### Request

- **Method**: `PUT`
- **URL**: `/api/issues/:id`
- **Path Parameters**:
  - `id` (required): Issue ID
- **Content-Type**: `application/json`
- **Request Body**: (all fields optional)

```typescript
{
  title?: string,
  description?: string,
  severity?: IssueSeverity,      // "critical" | "high" | "medium" | "low"
  status?: IssueStatus,          // "open" | "in-progress" | "resolved"
  relatedTaskId?: string,
  tags?: string[]
}
```

#### Response

**Status**: `200 OK`, `400 Bad Request`, or `404 Not Found`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "issue": {
    "id": "issue-1736849462123-abc12",
    "title": "Authentication bug",
    "description": "Users cannot log in with correct credentials",
    "severity": "high",
    "status": "in-progress",
    "relatedTaskId": "2.1",
    "tags": ["bug", "security", "urgent"],
    "attachments": [],
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T11:45:00.000Z"
  }
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "Issue not found: issue-1736849462123-abc12"
}
```

#### Examples

**Update status**:
```bash
curl -X PUT http://localhost:5000/api/issues/issue-1736849462123-abc12 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

**Update multiple fields**:
```bash
curl -X PUT http://localhost:5000/api/issues/issue-1736849462123-abc12 \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "high",
    "status": "in-progress",
    "tags": ["bug", "security", "urgent"]
  }'
```

---

### DELETE /api/issues/:id

Delete an issue.

#### Request

- **Method**: `DELETE`
- **URL**: `/api/issues/:id`
- **Path Parameters**:
  - `id` (required): Issue ID

#### Response

**Status**: `200 OK` or `404 Not Found`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "Issue issue-1736849462123-abc12 not found"
}
```

#### Example

```bash
curl -X DELETE http://localhost:5000/api/issues/issue-1736849462123-abc12
```

---

### POST /api/issues/upload

Upload attachments for an issue.

#### Request

- **Method**: `POST`
- **URL**: `/api/issues/upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `attachments`: File(s) to upload (up to 5 files, 10MB each)

**Allowed File Types**:
- Images: `.jpeg`, `.jpg`, `.png`, `.gif`
- Documents: `.pdf`, `.txt`, `.md`

#### Response

**Status**: `200 OK` or `400 Bad Request`

**Content-Type**: `application/json`

**Success Response Body**:
```json
{
  "success": true,
  "files": [
    {
      "name": "1736849462123-abc12-screenshot.png",
      "originalName": "screenshot.png",
      "size": 245678
    }
  ]
}
```

**Error Response (400 - No Files)**:
```json
{
  "success": false,
  "message": "No files uploaded"
}
```

**Error Response (400 - Invalid File Type)**:
```json
{
  "success": false,
  "message": "Invalid file type. Allowed: jpeg, jpg, png, gif, pdf, txt, md"
}
```

#### Examples

**Upload single file**:
```bash
curl -X POST http://localhost:5000/api/issues/upload \
  -F "attachments=@screenshot.png"
```

**Upload multiple files**:
```bash
curl -X POST http://localhost:5000/api/issues/upload \
  -F "attachments=@screenshot.png" \
  -F "attachments=@error-log.txt"
```

**Use uploaded files in issue creation**:
```bash
# 1. Upload files
RESPONSE=$(curl -X POST http://localhost:5000/api/issues/upload \
  -F "attachments=@screenshot.png")

# 2. Extract filename (requires jq)
FILENAME=$(echo $RESPONSE | jq -r '.files[0].name')

# 3. Create issue with attachment
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"UI Bug\",
    \"description\": \"See attached screenshot\",
    \"severity\": \"medium\",
    \"status\": \"open\",
    \"attachments\": [\"$FILENAME\"]
  }"
```

---

## Issue Schema

### Issue Object

```typescript
{
  id: string,                    // Unique ID (e.g., "issue-1736849462123-abc12")
  title: string,                 // Issue title
  description: string,           // Issue description
  severity: IssueSeverity,       // Severity level
  status: IssueStatus,           // Current status
  relatedTaskId?: string,        // Optional related task ID
  tags: string[],                // Array of tags (default: [])
  attachments: string[],         // Array of attachment filenames (default: [])
  createdAt: string,             // ISO 8601 timestamp
  updatedAt: string              // ISO 8601 timestamp
}
```

### IssueSeverity

Valid values:
- `"critical"` - System down, data loss, security breach
- `"high"` - Major functionality broken
- `"medium"` - Feature partially broken
- `"low"` - Minor issue, cosmetic

### IssueStatus

Valid values:
- `"open"` - New issue, not yet started
- `"in-progress"` - Currently being worked on
- `"resolved"` - Fixed and verified

---

## Data Storage

### Issue Files

Issues are stored as individual JSON files in `.taskmaster/issues/`:

```
.taskmaster/issues/
├── issue-1736849462123-abc12.json
├── issue-1736849567890-xyz78.json
└── attachments/
    ├── 1736849462123-abc12-screenshot.png
    └── 1736849567890-xyz78-log.txt
```

### ID Format

Issue IDs use the format: `issue-{timestamp}-{random5chars}`

Example: `issue-1736849462123-abc12`

### Attachments

Attachments are stored in `.taskmaster/issues/attachments/` with the format:
`{timestamp}-{random}-{originalname}`

Example: `1736849462123-abc12-screenshot.png`

---

## Error Handling

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| `400` | "Invalid issue data" | Request body validation failed |
| `400` | "No files uploaded" | Upload request without files |
| `400` | "Invalid file type" | Unsupported file extension |
| `404` | "Issue {id} not found" | Invalid issue ID |
| `500` | "Failed to create issue" | File system error |
| `500` | "Failed to update issue" | File system error |
| `500` | "Failed to delete issue" | File system error |

### Validation Errors

When request data is invalid, the API returns detailed Zod validation errors:

```json
{
  "success": false,
  "message": "Invalid issue data",
  "errors": [
    {
      "path": ["severity"],
      "message": "Invalid enum value. Expected 'critical' | 'high' | 'medium' | 'low', received 'urgent'"
    },
    {
      "path": ["title"],
      "message": "Required"
    }
  ]
}
```

---

## Notes

- **CRUD Operations**: Issues support full Create, Read, Update, Delete operations
- **File Attachments**: Attachments must be uploaded separately before referencing in issues
- **Timestamps**: `createdAt` is set on creation, `updatedAt` updates on every modification
- **Validation**: All data is validated using Zod schemas
- **File Limits**: Maximum 5 files per upload, 10MB per file
