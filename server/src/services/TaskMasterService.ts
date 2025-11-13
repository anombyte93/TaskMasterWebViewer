import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import { type Task, taskSchema } from '@shared/schema';
import { z } from 'zod';

/**
 * TaskMasterService
 *
 * Reads and watches the tasks.json file from TaskMaster's .taskmaster directory.
 * Provides methods to access tasks and emits change events for real-time updates.
 *
 * Features:
 * - File watching with chokidar (300ms debounce)
 * - Zod validation using shared/schema.ts
 * - EventEmitter pattern for change notifications
 * - Support for both string and number task IDs
 * - Handles nested subtask structures
 * - Singleton pattern
 */
class TaskMasterService extends EventEmitter {
  private tasksPath: string;
  private watcher: FSWatcher | null = null;
  private tasks: Task[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 300;

  constructor(projectRoot?: string) {
    super();
    const root = projectRoot || process.env.PROJECT_ROOT || process.cwd();
    this.tasksPath = path.join(root, '.taskmaster', 'tasks', 'tasks.json');
    console.log(`[TaskMasterService] Initialized with tasks path: ${this.tasksPath}`);
  }

  /**
   * Initialize the service: load tasks and start watching
   */
  async initialize(): Promise<void> {
    console.log('[TaskMasterService] Initializing...');

    // Load tasks initially
    await this.loadTasks();

    // Start watching the file
    this.startWatching();

    console.log('[TaskMasterService] Initialization complete');
  }

  /**
   * Load and parse tasks.json file
   */
  private async loadTasks(): Promise<void> {
    try {
      // Check if file exists
      await fs.access(this.tasksPath);

      // Read file content
      const content = await fs.readFile(this.tasksPath, 'utf-8');
      const rawData = JSON.parse(content);

      // TaskMaster stores tasks in a "master" tag by default
      const tasksArray = rawData.master?.tasks || rawData.tasks || [];

      // Validate each task with zod schema
      const tasksArraySchema = z.array(taskSchema);
      const validatedTasks = tasksArraySchema.parse(tasksArray);

      this.tasks = validatedTasks;
      console.log(`[TaskMasterService] Loaded ${this.tasks.length} tasks from ${this.tasksPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn(`[TaskMasterService] tasks.json not found at ${this.tasksPath}. Starting with empty task list.`);
        this.tasks = [];
      } else if (error instanceof z.ZodError) {
        console.error(`[TaskMasterService] Validation error in tasks.json:`, error.errors);
        throw new Error(`Task validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      } else {
        console.error(`[TaskMasterService] Error loading tasks:`, error);
        throw error;
      }
    }
  }

  /**
   * Start watching the tasks.json file for changes
   */
  private startWatching(): void {
    if (this.watcher) {
      console.warn('[TaskMasterService] Watcher already started');
      return;
    }

    this.watcher = chokidar.watch(this.tasksPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    });

    this.watcher.on('change', () => {
      console.log('[TaskMasterService] tasks.json changed, debouncing reload...');

      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Set new timer
      this.debounceTimer = setTimeout(async () => {
        try {
          await this.loadTasks();
          this.emit('change', this.tasks);
          console.log('[TaskMasterService] Emitted change event with updated tasks');
        } catch (error) {
          console.error('[TaskMasterService] Error reloading tasks:', error);
          this.emit('error', error);
        }
      }, this.DEBOUNCE_MS);
    });

    this.watcher.on('error', (error) => {
      console.error('[TaskMasterService] Watcher error:', error);
      this.emit('error', error);
    });

    console.log(`[TaskMasterService] Started watching ${this.tasksPath}`);
  }

  /**
   * Get all tasks
   */
  async getTasks(): Promise<Task[]> {
    return [...this.tasks]; // Return copy to prevent mutation
  }

  /**
   * Get a specific task by ID (supports both string and number IDs)
   * Searches through all tasks including nested subtasks
   */
  async getTaskById(id: string | number): Promise<Task | undefined> {
    const searchId = String(id);
    return this.findTaskRecursive(this.tasks, searchId);
  }

  /**
   * Recursively search for a task by ID in the task tree
   */
  private findTaskRecursive(tasks: Task[], searchId: string): Task | undefined {
    for (const task of tasks) {
      // Check current task
      if (String(task.id) === searchId) {
        return task;
      }

      // Check subtasks if they exist
      if (task.subtasks && task.subtasks.length > 0) {
        const found = this.findTaskRecursive(task.subtasks, searchId);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  /**
   * Get the current task to work on
   * Returns the first task with status "in-progress" or "pending"
   * Searches top-level tasks first, then subtasks
   */
  async getCurrentTask(): Promise<Task | undefined> {
    // First, check for any in-progress task
    const inProgress = this.findTaskByStatusRecursive(this.tasks, 'in-progress');
    if (inProgress) {
      return inProgress;
    }

    // If no in-progress task, find first pending task
    const pending = this.findTaskByStatusRecursive(this.tasks, 'pending');
    return pending;
  }

  /**
   * Recursively search for a task by status
   */
  private findTaskByStatusRecursive(tasks: Task[], status: string): Task | undefined {
    for (const task of tasks) {
      // Check current task
      if (task.status === status) {
        return task;
      }

      // Check subtasks if they exist
      if (task.subtasks && task.subtasks.length > 0) {
        const found = this.findTaskByStatusRecursive(task.subtasks, status);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    console.log('[TaskMasterService] Destroying service...');

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('[TaskMasterService] Watcher closed');
    }

    this.removeAllListeners();
    console.log('[TaskMasterService] Service destroyed');
  }
}

// Export singleton instance
export const taskMasterService = new TaskMasterService(process.env.PROJECT_ROOT);

// Also export the class for testing purposes
export { TaskMasterService };
