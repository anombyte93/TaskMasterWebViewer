# API Usage Examples

Common use cases and example workflows for the TaskMaster Web Integration API.

## Table of Contents

- [Task Queries](#task-queries)
- [Issue Management](#issue-management)
- [File Uploads](#file-uploads)
- [Real-Time Updates](#real-time-updates)
- [Error Handling](#error-handling)
- [Integration Patterns](#integration-patterns)

---

## Task Queries

### Get All Tasks and Display

```bash
curl -s http://localhost:5000/api/tasks | jq '.'
```

**Example Response**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": "1",
      "title": "Setup project infrastructure",
      "status": "done",
      "priority": "high"
    }
  ]
}
```

### Find Current Task to Work On

```bash
curl -s http://localhost:5000/api/tasks/current | jq '.task | {id, title, status}'
```

**Example Response**:
```json
{
  "id": "2.1",
  "title": "Implement JWT middleware",
  "status": "in-progress"
}
```

### Get Specific Task Details

```bash
# Get main task
curl -s http://localhost:5000/api/tasks/1 | jq '.task'

# Get subtask
curl -s http://localhost:5000/api/tasks/2.1 | jq '.task'

# Get nested subtask
curl -s http://localhost:5000/api/tasks/1.2.3 | jq '.task'
```

### Count Tasks by Status

```bash
curl -s http://localhost:5000/api/tasks | \
  jq '[.tasks[] | .status] | group_by(.) | map({status: .[0], count: length})'
```

**Example Output**:
```json
[
  { "status": "done", "count": 5 },
  { "status": "in-progress", "count": 2 },
  { "status": "pending", "count": 10 }
]
```

### List All Subtasks of a Task

```bash
curl -s http://localhost:5000/api/tasks/1 | jq '.task.subtasks[]'
```

---

## Issue Management

### Create a Simple Issue

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug in login form",
    "description": "Submit button does not work",
    "severity": "high",
    "status": "open"
  }'
```

### Create Issue Linked to Task

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Performance issue in API",
    "description": "Response time > 5 seconds",
    "severity": "medium",
    "status": "open",
    "relatedTaskId": "3.2",
    "tags": ["performance", "api"]
  }'
```

### List All Open Issues

```bash
curl -s http://localhost:5000/api/issues | \
  jq '.issues[] | select(.status == "open") | {id, title, severity}'
```

### List Issues for Specific Task

```bash
curl -s "http://localhost:5000/api/issues?taskId=2.1" | jq '.issues'
```

### Update Issue Status

```bash
curl -X PUT http://localhost:5000/api/issues/issue-1736849462123-abc12 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### Add Tags to Issue

```bash
curl -X PUT http://localhost:5000/api/issues/issue-1736849462123-abc12 \
  -H "Content-Type: application/json" \
  -d '{"tags": ["bug", "urgent", "security"]}'
```

### Resolve Issue

```bash
curl -X PUT http://localhost:5000/api/issues/issue-1736849462123-abc12 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "description": "Fixed by implementing rate limiting in auth endpoint"
  }'
```

### Delete Issue

```bash
curl -X DELETE http://localhost:5000/api/issues/issue-1736849462123-abc12
```

---

## File Uploads

### Upload Single File

```bash
curl -X POST http://localhost:5000/api/issues/upload \
  -F "attachments=@screenshot.png"
```

**Response**:
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

### Upload Multiple Files

```bash
curl -X POST http://localhost:5000/api/issues/upload \
  -F "attachments=@screenshot.png" \
  -F "attachments=@error-log.txt" \
  -F "attachments=@report.pdf"
```

### Create Issue with Attachments

```bash
# Step 1: Upload files
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5000/api/issues/upload \
  -F "attachments=@screenshot.png")

# Step 2: Extract filenames
FILENAMES=$(echo $UPLOAD_RESPONSE | jq -r '.files | map(.name) | @json')

# Step 3: Create issue with attachments
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"UI Bug in Dashboard\",
    \"description\": \"See attached screenshot\",
    \"severity\": \"medium\",
    \"status\": \"open\",
    \"attachments\": $FILENAMES
  }"
```

---

## Real-Time Updates

### Basic WebSocket Connection (Node.js)

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5000/ws');

ws.on('open', () => {
  console.log('Connected to TaskMaster WebSocket');
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);

  // Handle task updates
  if (message.type === 'tasks:update') {
    console.log(`Tasks updated: ${message.data.tasksCount} tasks`);
    // Fetch updated tasks
    fetch('http://localhost:5000/api/tasks')
      .then(res => res.json())
      .then(data => console.log('Updated tasks:', data.tasks.length));
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### WebSocket with Reconnection (Browser)

```javascript
let ws = null;
let reconnectAttempts = 0;

function connect() {
  ws = new WebSocket('ws://localhost:5000/ws');

  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case 'connected':
        console.log('Connection acknowledged');
        break;

      case 'tasks:update':
        console.log('Tasks updated, fetching new data...');
        fetchTasks();
        break;

      case 'tasks:error':
        console.error('Task error:', message.error);
        break;

      case 'pong':
        console.log('Pong received');
        break;
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');

    if (reconnectAttempts < 10) {
      const delay = 1000 * Math.pow(2, reconnectAttempts);
      console.log(`Reconnecting in ${delay}ms...`);

      setTimeout(() => {
        reconnectAttempts++;
        connect();
      }, delay);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

function fetchTasks() {
  fetch('http://localhost:5000/api/tasks')
    .then(res => res.json())
    .then(data => {
      console.log('Fetched tasks:', data.tasks);
      updateUI(data.tasks);
    });
}

function updateUI(tasks) {
  // Update your UI with new tasks
}

// Start connection
connect();

// Send periodic pings
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
```

---

## Error Handling

### Handle 404 Not Found

```bash
# Task not found
curl -s http://localhost:5000/api/tasks/999 | jq '.'
```

**Response**:
```json
{
  "success": false,
  "message": "Task 999 not found"
}
```

**JavaScript Handler**:
```javascript
fetch('http://localhost:5000/api/tasks/999')
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => {
        throw new Error(err.message);
      });
    }
    return res.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error.message));
```

### Handle Validation Errors

```bash
# Invalid severity value
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test",
    "severity": "urgent",
    "status": "open"
  }'
```

**Response**:
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

### Handle Network Errors

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

// Usage
fetchWithRetry('http://localhost:5000/api/tasks')
  .then(data => console.log(data))
  .catch(error => console.error('Failed after retries:', error));
```

---

## Integration Patterns

### Dashboard Data Aggregation

```bash
#!/bin/bash

# Fetch all data
TASKS=$(curl -s http://localhost:5000/api/tasks)
CURRENT=$(curl -s http://localhost:5000/api/tasks/current)
ISSUES=$(curl -s http://localhost:5000/api/issues)

# Aggregate statistics
echo "=== TaskMaster Dashboard ==="
echo ""
echo "Total Tasks:" $(echo $TASKS | jq '.tasks | length')
echo "Current Task:" $(echo $CURRENT | jq -r '.task.title // "None"')
echo ""
echo "Tasks by Status:"
echo $TASKS | jq -r '[.tasks[] | .status] | group_by(.) | map("  \(.[0]): \(length)") | .[]'
echo ""
echo "Open Issues:" $(echo $ISSUES | jq '[.issues[] | select(.status == "open")] | length')
echo "Critical Issues:" $(echo $ISSUES | jq '[.issues[] | select(.severity == "critical")] | length')
```

### Task Progress Calculator

```javascript
async function calculateProgress() {
  const response = await fetch('http://localhost:5000/api/tasks');
  const { tasks } = await response.json();

  // Count all tasks (including subtasks)
  function countTasks(tasks) {
    let count = { total: 0, done: 0, inProgress: 0, pending: 0 };

    for (const task of tasks) {
      count.total++;

      if (task.status === 'done') count.done++;
      else if (task.status === 'in-progress') count.inProgress++;
      else if (task.status === 'pending') count.pending++;

      if (task.subtasks && task.subtasks.length > 0) {
        const subtaskCount = countTasks(task.subtasks);
        count.total += subtaskCount.total;
        count.done += subtaskCount.done;
        count.inProgress += subtaskCount.inProgress;
        count.pending += subtaskCount.pending;
      }
    }

    return count;
  }

  const stats = countTasks(tasks);
  const progress = Math.round((stats.done / stats.total) * 100);

  console.log(`Progress: ${progress}%`);
  console.log(`Done: ${stats.done}/${stats.total}`);
  console.log(`In Progress: ${stats.inProgress}`);
  console.log(`Pending: ${stats.pending}`);

  return { stats, progress };
}

calculateProgress();
```

### Issue Report Generator

```bash
#!/bin/bash

# Generate issue report
echo "# Issue Report - $(date)" > issue-report.md
echo "" >> issue-report.md

# Critical issues
echo "## Critical Issues" >> issue-report.md
curl -s http://localhost:5000/api/issues | \
  jq -r '.issues[] | select(.severity == "critical" and .status != "resolved") |
    "- **\(.title)** (Task: \(.relatedTaskId // "N/A"))\n  \(.description)\n"' \
  >> issue-report.md

# High priority issues
echo "## High Priority Issues" >> issue-report.md
curl -s http://localhost:5000/api/issues | \
  jq -r '.issues[] | select(.severity == "high" and .status != "resolved") |
    "- **\(.title)** (Task: \(.relatedTaskId // "N/A"))\n  \(.description)\n"' \
  >> issue-report.md

echo "Report generated: issue-report.md"
```

### Automated Issue Creation from Log Files

```javascript
const fs = require('fs');

async function createIssueFromLog(logPath) {
  // Read log file
  const logContent = fs.readFileSync(logPath, 'utf-8');

  // Parse errors (example pattern)
  const errorPattern = /ERROR: (.*)/g;
  const errors = [...logContent.matchAll(errorPattern)].map(m => m[1]);

  if (errors.length === 0) {
    console.log('No errors found in log');
    return;
  }

  // Create issue
  const issue = {
    title: `Errors found in ${logPath}`,
    description: `Found ${errors.length} errors:\n\n${errors.slice(0, 5).join('\n')}`,
    severity: errors.length > 10 ? 'critical' : 'high',
    status: 'open',
    tags: ['automated', 'log-analysis']
  };

  const response = await fetch('http://localhost:5000/api/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(issue)
  });

  const result = await response.json();
  console.log('Issue created:', result.issue.id);
}

createIssueFromLog('./app.log');
```

### Real-Time Task Monitor

```javascript
const WebSocket = require('ws');
const fetch = require('node-fetch');

class TaskMonitor {
  constructor(apiUrl, wsUrl) {
    this.apiUrl = apiUrl;
    this.wsUrl = wsUrl;
    this.ws = null;
  }

  start() {
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      console.log('[Monitor] Connected');
      this.logCurrentStatus();
    });

    this.ws.on('message', async (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'tasks:update') {
        console.log(`[Monitor] Tasks updated at ${message.timestamp}`);
        await this.logCurrentStatus();
      }

      if (message.type === 'tasks:error') {
        console.error(`[Monitor] Error: ${message.error}`);
      }
    });

    this.ws.on('close', () => {
      console.log('[Monitor] Disconnected, reconnecting...');
      setTimeout(() => this.connect(), 5000);
    });
  }

  async logCurrentStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/api/tasks`);
      const { tasks } = await response.json();

      const done = tasks.filter(t => t.status === 'done').length;
      const inProgress = tasks.filter(t => t.status === 'in-progress').length;
      const pending = tasks.filter(t => t.status === 'pending').length;

      console.log(`[Monitor] Status: ${done} done, ${inProgress} in-progress, ${pending} pending`);
    } catch (error) {
      console.error('[Monitor] Failed to fetch status:', error.message);
    }
  }
}

// Start monitoring
const monitor = new TaskMonitor('http://localhost:5000', 'ws://localhost:5000/ws');
monitor.start();
```

---

## Testing

### Test Script for All Endpoints

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "=== Testing TaskMaster API ==="
echo ""

# Test 1: Get all tasks
echo "Test 1: GET /api/tasks"
curl -s $BASE_URL/api/tasks | jq '.success'

# Test 2: Get current task
echo "Test 2: GET /api/tasks/current"
curl -s $BASE_URL/api/tasks/current | jq '.success'

# Test 3: Create issue
echo "Test 3: POST /api/issues"
ISSUE_ID=$(curl -s -X POST $BASE_URL/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue",
    "description": "Test Description",
    "severity": "low",
    "status": "open"
  }' | jq -r '.issue.id')
echo "Created issue: $ISSUE_ID"

# Test 4: Get issue
echo "Test 4: GET /api/issues/$ISSUE_ID"
curl -s $BASE_URL/api/issues/$ISSUE_ID | jq '.success'

# Test 5: Update issue
echo "Test 5: PUT /api/issues/$ISSUE_ID"
curl -s -X PUT $BASE_URL/api/issues/$ISSUE_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}' | jq '.success'

# Test 6: Delete issue
echo "Test 6: DELETE /api/issues/$ISSUE_ID"
curl -s -X DELETE $BASE_URL/api/issues/$ISSUE_ID | jq '.success'

echo ""
echo "=== All tests complete ==="
```
