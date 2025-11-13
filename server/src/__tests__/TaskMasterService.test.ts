import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { TaskMasterService } from '../services/TaskMasterService';
import fs from 'fs/promises';
import path from 'path';
import type { Task } from '../../../shared/schema';

describe('TaskMasterService', () => {
  let service: TaskMasterService;
  let testDir: string;

  before(async () => {
    // Create test directory with mock tasks.json
    testDir = path.join(process.cwd(), '.test-taskmaster');
    await fs.mkdir(path.join(testDir, '.taskmaster', 'tasks'), { recursive: true });

    const mockTasks = {
      master: {
        tasks: [
          {
            id: 1,
            title: 'Test Task 1',
            status: 'pending',
            description: 'Test task 1 description',
            priority: 'high',
            dependencies: []
          },
          {
            id: 2,
            title: 'Done Task',
            status: 'done',
            description: 'Already completed task',
            priority: 'medium',
            dependencies: []
          },
          {
            id: 3,
            title: 'Parent Task',
            status: 'in-progress',
            description: 'Parent task with subtasks',
            priority: 'high',
            dependencies: [],
            subtasks: [
              {
                id: '3.1',
                title: 'Subtask 1',
                status: 'done',
                description: 'First subtask',
                priority: 'medium',
                dependencies: []
              },
              {
                id: '3.2',
                title: 'Subtask 2',
                status: 'pending',
                description: 'Second subtask',
                priority: 'low',
                dependencies: ['3.1']
              }
            ]
          }
        ]
      }
    };

    await fs.writeFile(
      path.join(testDir, '.taskmaster', 'tasks', 'tasks.json'),
      JSON.stringify(mockTasks, null, 2)
    );

    service = new TaskMasterService(testDir);
    await service.initialize();
  });

  after(async () => {
    // Cleanup
    service.destroy();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should load tasks from tasks.json', async () => {
    const tasks = await service.getTasks();
    assert.strictEqual(tasks.length, 3);
    assert.strictEqual(tasks[0].title, 'Test Task 1');
  });

  it('should get task by numeric ID', async () => {
    const task = await service.getTaskById(1);
    assert.ok(task);
    assert.strictEqual(task?.title, 'Test Task 1');
    assert.strictEqual(task?.status, 'pending');
  });

  it('should get task by string ID', async () => {
    const task = await service.getTaskById('2');
    assert.ok(task);
    assert.strictEqual(task?.title, 'Done Task');
    assert.strictEqual(task?.status, 'done');
  });

  it('should find subtask by ID', async () => {
    const subtask = await service.getTaskById('3.1');
    assert.ok(subtask);
    assert.strictEqual(subtask?.title, 'Subtask 1');
    assert.strictEqual(subtask?.status, 'done');
  });

  it('should return undefined for non-existent task', async () => {
    const task = await service.getTaskById(999);
    assert.strictEqual(task, undefined);
  });

  it('should get current task (in-progress first)', async () => {
    const current = await service.getCurrentTask();
    assert.ok(current);
    assert.strictEqual(current?.status, 'in-progress');
    assert.strictEqual(current?.id, 3);
  });

  it('should return copy of tasks array (immutability)', async () => {
    const tasks1 = await service.getTasks();
    const tasks2 = await service.getTasks();

    // Same content
    assert.deepStrictEqual(tasks1, tasks2);

    // Different references
    assert.notStrictEqual(tasks1, tasks2);
  });

  it('should handle nested subtask search', async () => {
    const subtask = await service.getTaskById('3.2');
    assert.ok(subtask);
    assert.strictEqual(subtask?.title, 'Subtask 2');
    assert.strictEqual(subtask?.dependencies?.[0], '3.1');
  });
});

describe('TaskMasterService - Empty tasks.json', () => {
  let service: TaskMasterService;
  let testDir: string;

  before(async () => {
    // Create test directory with empty tasks
    testDir = path.join(process.cwd(), '.test-taskmaster-empty');
    await fs.mkdir(path.join(testDir, '.taskmaster', 'tasks'), { recursive: true });

    const emptyTasks = {
      master: {
        tasks: []
      }
    };

    await fs.writeFile(
      path.join(testDir, '.taskmaster', 'tasks', 'tasks.json'),
      JSON.stringify(emptyTasks, null, 2)
    );

    service = new TaskMasterService(testDir);
    await service.initialize();
  });

  after(async () => {
    service.destroy();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle empty task list', async () => {
    const tasks = await service.getTasks();
    assert.strictEqual(tasks.length, 0);
  });

  it('should return undefined for getCurrentTask when no tasks exist', async () => {
    const current = await service.getCurrentTask();
    assert.strictEqual(current, undefined);
  });
});

describe('TaskMasterService - Missing file', () => {
  let service: TaskMasterService;
  let testDir: string;

  before(async () => {
    // Create test directory WITHOUT tasks.json
    testDir = path.join(process.cwd(), '.test-taskmaster-missing');
    await fs.mkdir(testDir, { recursive: true });

    service = new TaskMasterService(testDir);
    await service.initialize();
  });

  after(async () => {
    service.destroy();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should handle missing tasks.json file gracefully', async () => {
    const tasks = await service.getTasks();
    assert.strictEqual(tasks.length, 0);
  });
});
