import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import express, { type Express } from 'express';
import { createServer, type Server } from 'http';
import fs from 'fs/promises';
import path from 'path';

/**
 * Integration Tests for API Endpoints
 *
 * These tests verify end-to-end behavior of the Tasks and Issues API routes
 * by creating a real Express server and using actual services (not mocks).
 *
 * NOTE: We set PROJECT_ROOT env var before importing routes to ensure
 * the singleton services use the test directory.
 */

describe('API Integration Tests - Tasks API', () => {
  let app: Express;
  let server: Server;
  let testDir: string;
  let baseUrl: string;
  const port = 35791; // Random high port to avoid conflicts
  let taskMasterService: any;
  let tasksRouter: any;

  before(async () => {
    // Create test directory with tasks.json
    testDir = path.join(process.cwd(), '.test-api-integration-tasks');
    await fs.mkdir(path.join(testDir, '.taskmaster', 'tasks'), { recursive: true });

    const mockTasks = {
      master: {
        tasks: [
          {
            id: 1,
            title: 'Test Task',
            status: 'in-progress',
            description: 'Testing',
            priority: 'high',
            dependencies: []
          },
          {
            id: 2,
            title: 'Done Task',
            status: 'done',
            description: 'Completed',
            priority: 'medium',
            dependencies: [1]
          },
          {
            id: 3,
            title: 'Pending Task',
            status: 'pending',
            description: 'Not started',
            priority: 'low',
            dependencies: []
          }
        ]
      }
    };

    await fs.writeFile(
      path.join(testDir, '.taskmaster', 'tasks', 'tasks.json'),
      JSON.stringify(mockTasks, null, 2)
    );

    // Set PROJECT_ROOT before importing to affect the singleton
    process.env.PROJECT_ROOT = testDir;

    // Import services and routes after setting env var
    const { TaskMasterService } = await import('../../services/TaskMasterService');
    taskMasterService = new TaskMasterService(testDir);
    await taskMasterService.initialize();

    // Import router
    const tasksModule = await import('../../routes/tasks');
    tasksRouter = tasksModule.default;

    // Create Express app
    app = express();
    app.use(express.json());

    // Mount routes
    app.use('/api/tasks', tasksRouter);

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(err.status || 500).json({
        success: false,
        message: err.message
      });
    });

    // Start server
    baseUrl = `http://localhost:${port}`;
    await new Promise<void>((resolve) => {
      server = createServer(app).listen(port, resolve);
    });
  });

  after(async () => {
    // Cleanup
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    if (taskMasterService) {
      taskMasterService.destroy();
    }
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env.PROJECT_ROOT;
  });

  it('GET /api/tasks should return all tasks', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.tasks));
    assert.strictEqual(data.tasks.length, 3);
    assert.strictEqual(data.tasks[0].title, 'Test Task');
  });

  it('GET /api/tasks/current should return current task', async () => {
    const response = await fetch(`${baseUrl}/api/tasks/current`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.task);
    assert.strictEqual(data.task.status, 'in-progress');
    assert.strictEqual(data.task.id, 1);
  });

  it('GET /api/tasks/:id should return specific task', async () => {
    const response = await fetch(`${baseUrl}/api/tasks/1`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.task);
    assert.strictEqual(data.task.id, 1);
    assert.strictEqual(data.task.title, 'Test Task');
    assert.strictEqual(data.task.status, 'in-progress');
  });

  it('GET /api/tasks/:id should return 404 for non-existent task', async () => {
    const response = await fetch(`${baseUrl}/api/tasks/999`);
    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('not found'));
  });

  it('GET /api/tasks/:id should handle string IDs', async () => {
    const response = await fetch(`${baseUrl}/api/tasks/2`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.task.id, 2);
    assert.strictEqual(data.task.title, 'Done Task');
  });

  it('GET /api/tasks should return tasks with correct status', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    const tasks = data.tasks;

    // Verify status values
    const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress');
    const doneTasks = tasks.filter((t: any) => t.status === 'done');
    const pendingTasks = tasks.filter((t: any) => t.status === 'pending');

    assert.strictEqual(inProgressTasks.length, 1);
    assert.strictEqual(doneTasks.length, 1);
    assert.strictEqual(pendingTasks.length, 1);
  });

  it('should return correct HTTP headers', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`);

    assert.strictEqual(response.headers.get('content-type'), 'application/json; charset=utf-8');
  });
});

describe('API Integration Tests - Issues API', () => {
  let app: Express;
  let server: Server;
  let testDir: string;
  let baseUrl: string;
  const port = 35792; // Different port to avoid conflicts
  let issueService: any;
  let issuesRouter: any;

  before(async () => {
    // Create test directory for issues
    testDir = path.join(process.cwd(), '.test-api-integration-issues');
    await fs.mkdir(path.join(testDir, '.taskmaster', 'issues'), { recursive: true });

    // Set PROJECT_ROOT before importing
    process.env.PROJECT_ROOT = testDir;

    // Import services and routes after setting env var
    const { IssueService } = await import('../../../services/IssueService');
    issueService = new IssueService(testDir);
    await issueService.initialize();

    // Import router
    const issuesModule = await import('../../routes/issues');
    issuesRouter = issuesModule.default;

    // Create Express app
    app = express();
    app.use(express.json());

    // Mount routes
    app.use('/api/issues', issuesRouter);

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(err.status || 500).json({
        success: false,
        message: err.message
      });
    });

    // Start server
    baseUrl = `http://localhost:${port}`;
    await new Promise<void>((resolve) => {
      server = createServer(app).listen(port, resolve);
    });
  });

  after(async () => {
    // Cleanup
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env.PROJECT_ROOT;
  });

  it('POST /api/issues should create new issue', async () => {
    const issueData = {
      title: 'Test Issue',
      description: 'Integration test issue',
      severity: 'medium',
      status: 'open',
      tags: ['test', 'integration']
    };

    const response = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    const data = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.issue);
    assert.ok(data.issue.id);
    assert.strictEqual(data.issue.title, 'Test Issue');
    assert.strictEqual(data.issue.severity, 'medium');
    assert.ok(Array.isArray(data.issue.tags));
    assert.strictEqual(data.issue.tags.length, 2);
  });

  it('POST /api/issues should return 400 for invalid data', async () => {
    const invalidData = {
      title: 'Missing required fields'
      // Missing description, severity, status
    };

    const response = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('Invalid'));
    assert.ok(data.errors);
  });

  it('POST /api/issues should validate severity values', async () => {
    const invalidData = {
      title: 'Test',
      description: 'Test',
      severity: 'invalid-severity', // Invalid enum value
      status: 'open',
      tags: []
    };

    const response = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.success, false);
  });

  it('GET /api/issues should return all issues', async () => {
    // Create a test issue first
    const issueData = {
      title: 'List Test Issue',
      description: 'For testing list endpoint',
      severity: 'low',
      status: 'open',
      tags: []
    };

    await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });

    // Now get all issues
    const response = await fetch(`${baseUrl}/api/issues`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.issues));
    assert.ok(data.issues.length >= 1);

    // Find our created issue
    const foundIssue = data.issues.find((i: any) => i.title === 'List Test Issue');
    assert.ok(foundIssue);
  });

  it('GET /api/issues/:id should return specific issue', async () => {
    // Create issue first
    const issueData = {
      title: 'Get By ID Test',
      description: 'For testing get by ID',
      severity: 'high',
      status: 'open',
      tags: ['get-test']
    };

    const createResponse = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    const createData = await createResponse.json();
    const issueId = createData.issue.id;

    // Get the issue
    const response = await fetch(`${baseUrl}/api/issues/${issueId}`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.issue);
    assert.strictEqual(data.issue.id, issueId);
    assert.strictEqual(data.issue.title, 'Get By ID Test');
  });

  it('GET /api/issues/:id should return 404 for non-existent issue', async () => {
    const response = await fetch(`${baseUrl}/api/issues/non-existent-id`);
    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('not found'));
  });

  it('PUT /api/issues/:id should update issue', async () => {
    // Create issue first
    const issueData = {
      title: 'Update Test',
      description: 'For testing updates',
      severity: 'medium',
      status: 'open',
      tags: []
    };

    const createResponse = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    const createData = await createResponse.json();
    const issueId = createData.issue.id;

    // Update the issue
    const updateData = {
      status: 'in-progress',
      severity: 'high'
    };

    const response = await fetch(`${baseUrl}/api/issues/${issueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.issue);
    assert.strictEqual(data.issue.id, issueId);
    assert.strictEqual(data.issue.status, 'in-progress');
    assert.strictEqual(data.issue.severity, 'high');
    assert.strictEqual(data.issue.title, 'Update Test'); // Unchanged field
  });

  it('PUT /api/issues/:id should return 400 for invalid update data', async () => {
    // Create issue first
    const issueData = {
      title: 'Invalid Update Test',
      description: 'For testing invalid updates',
      severity: 'low',
      status: 'open',
      tags: []
    };

    const createResponse = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    const createData = await createResponse.json();
    const issueId = createData.issue.id;

    // Try invalid update
    const invalidUpdate = {
      status: 'invalid-status' // Invalid enum value
    };

    const response = await fetch(`${baseUrl}/api/issues/${issueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidUpdate)
    });
    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.success, false);
  });

  it('DELETE /api/issues/:id should delete issue', async () => {
    // Create issue first
    const issueData = {
      title: 'Delete Test',
      description: 'For testing deletion',
      severity: 'low',
      status: 'open',
      tags: []
    };

    const createResponse = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    const createData = await createResponse.json();
    const issueId = createData.issue.id;

    // Delete the issue
    const response = await fetch(`${baseUrl}/api/issues/${issueId}`, {
      method: 'DELETE'
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.message.includes('deleted'));

    // Verify it's deleted
    const getResponse = await fetch(`${baseUrl}/api/issues/${issueId}`);
    assert.strictEqual(getResponse.status, 404);
  });

  it('DELETE /api/issues/:id should return 404 for non-existent issue', async () => {
    const response = await fetch(`${baseUrl}/api/issues/non-existent-id`, {
      method: 'DELETE'
    });
    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
  });

  it('GET /api/issues?taskId=X should filter by task', async () => {
    // Create issues with and without taskId
    const issue1Data = {
      title: 'Task Related Issue',
      description: 'Related to task 1',
      severity: 'high',
      status: 'open',
      relatedTaskId: '1',
      tags: []
    };

    const issue2Data = {
      title: 'Unrelated Issue',
      description: 'Not related to any task',
      severity: 'medium',
      status: 'open',
      tags: []
    };

    await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue1Data)
    });

    await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue2Data)
    });

    // Filter by taskId
    const response = await fetch(`${baseUrl}/api/issues?taskId=1`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.issues));

    // Should only include issue1
    const taskRelatedIssues = data.issues.filter((i: any) => i.relatedTaskId === '1');
    assert.ok(taskRelatedIssues.length >= 1);

    // Verify filtering worked
    const foundIssue = data.issues.find((i: any) => i.title === 'Task Related Issue');
    assert.ok(foundIssue);
    assert.strictEqual(foundIssue.relatedTaskId, '1');
  });

  it('POST /api/issues should handle optional fields', async () => {
    const minimalIssueData = {
      title: 'Minimal Issue',
      description: 'Only required fields',
      severity: 'low',
      status: 'open',
      tags: []
    };

    const response = await fetch(`${baseUrl}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalIssueData)
    });
    const data = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.issue);
    assert.strictEqual(data.issue.relatedTaskId, undefined);
  });
});
