import type { Task, Issue, TaskStatus, TaskPriority, IssueStatus, IssueSeverity } from '@shared/schema';

/**
 * Test Data Generator
 *
 * Generates realistic test datasets for performance testing.
 * Used to stress test search and filter operations with varying data sizes.
 */

const TASK_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'done', 'blocked', 'deferred', 'cancelled'];
const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const ISSUE_STATUSES: IssueStatus[] = ['open', 'in-progress', 'resolved'];
const ISSUE_SEVERITIES: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];

const SAMPLE_TITLES = [
  'Implement user authentication',
  'Fix database connection issue',
  'Add search functionality',
  'Update documentation',
  'Refactor API endpoints',
  'Optimize performance',
  'Add unit tests',
  'Fix memory leak',
  'Implement caching layer',
  'Update dependencies',
];

const SAMPLE_DESCRIPTIONS = [
  'Need to implement JWT-based authentication system',
  'Database connection drops after 5 minutes of inactivity',
  'Users should be able to search across all content',
  'Documentation is outdated and needs refresh',
  'Current API structure is not RESTful',
  'Application is slow on large datasets',
  'Test coverage is below 50%',
  'Memory usage grows over time',
  'Add Redis caching for frequently accessed data',
  'Several packages have security vulnerabilities',
];

/**
 * Generate random task data
 *
 * @param count - Number of tasks to generate
 * @returns Array of generated tasks
 */
export function generateTasks(count: number): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const id = String(i + 1);
    const status = TASK_STATUSES[Math.floor(Math.random() * TASK_STATUSES.length)];
    const priority = TASK_PRIORITIES[Math.floor(Math.random() * TASK_PRIORITIES.length)];
    const titleIndex = Math.floor(Math.random() * SAMPLE_TITLES.length);
    const descIndex = Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length);

    tasks.push({
      id,
      title: `${SAMPLE_TITLES[titleIndex]} (Task ${id})`,
      description: SAMPLE_DESCRIPTIONS[descIndex],
      status,
      priority,
      dependencies: [],
      subtasks: [],
    });
  }

  return tasks;
}

/**
 * Generate random issue data
 *
 * @param count - Number of issues to generate
 * @returns Array of generated issues
 */
export function generateIssues(count: number): Issue[] {
  const issues: Issue[] = [];

  for (let i = 0; i < count; i++) {
    const id = `issue-${i + 1}`;
    const status = ISSUE_STATUSES[Math.floor(Math.random() * ISSUE_STATUSES.length)];
    const severity = ISSUE_SEVERITIES[Math.floor(Math.random() * ISSUE_SEVERITIES.length)];
    const titleIndex = Math.floor(Math.random() * SAMPLE_TITLES.length);
    const descIndex = Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length);

    issues.push({
      id,
      title: `${SAMPLE_TITLES[titleIndex]} (Issue ${id})`,
      description: SAMPLE_DESCRIPTIONS[descIndex],
      status,
      severity,
      tags: ['test', 'generated', severity],
      attachments: [],
      relatedTaskId: Math.random() > 0.5 ? String(Math.floor(Math.random() * count) + 1) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return issues;
}

/**
 * Performance measurement utility
 *
 * Measures execution time of a function with high precision.
 *
 * @param fn - Function to measure
 * @param label - Optional label for logging
 * @returns Execution time in milliseconds
 */
export function measurePerformance<T>(fn: () => T, label?: string): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Run multiple performance measurements and calculate statistics
 *
 * @param fn - Function to measure
 * @param iterations - Number of times to run (default: 10)
 * @returns Performance statistics
 */
export function benchmarkPerformance<T>(
  fn: () => T,
  iterations: number = 10
): {
  avg: number;
  min: number;
  max: number;
  median: number;
  p95: number;
} {
  const durations: number[] = [];

  // Warm-up run (not counted)
  fn();

  // Actual measurements
  for (let i = 0; i < iterations; i++) {
    const { duration } = measurePerformance(fn);
    durations.push(duration);
  }

  // Sort for percentile calculations
  const sorted = [...durations].sort((a, b) => a - b);

  return {
    avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
  };
}
