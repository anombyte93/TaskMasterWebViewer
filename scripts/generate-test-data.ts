#!/usr/bin/env tsx

/**
 * Test Data Generator CLI
 *
 * Generates large datasets of tasks and issues for performance testing.
 *
 * Usage:
 *   npm run generate-test-data -- --tasks=1000 --issues=200
 *   tsx scripts/generate-test-data.ts --tasks=500 --issues=100 --output=test-data.json
 *
 * Options:
 *   --tasks=N       Number of tasks to generate (default: 100)
 *   --issues=N      Number of issues to generate (default: 20)
 *   --output=FILE   Output file path (default: stdout)
 *   --pretty        Pretty-print JSON output
 *   --seed=N        Random seed for reproducible data
 */

import fs from 'fs';
import path from 'path';

// Task/Issue types
type TaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high';
type IssueStatus = 'open' | 'in-progress' | 'resolved';
type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[];
  subtasks: Task[];
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  severity: IssueSeverity;
  tags: string[];
  attachments: string[];
  relatedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const TASK_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'done', 'blocked', 'deferred', 'cancelled'];
const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const ISSUE_STATUSES: IssueStatus[] = ['open', 'in-progress', 'resolved'];
const ISSUE_SEVERITIES: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];

const SAMPLE_TITLES = [
  'Implement user authentication system',
  'Fix database connection timeout issue',
  'Add full-text search functionality',
  'Update API documentation',
  'Refactor legacy API endpoints',
  'Optimize database query performance',
  'Add comprehensive unit test coverage',
  'Fix memory leak in background worker',
  'Implement Redis caching layer',
  'Update outdated NPM dependencies',
  'Add WebSocket support for real-time updates',
  'Implement rate limiting middleware',
  'Add TypeScript strict mode support',
  'Fix CSS styling issues on mobile',
  'Implement email notification system',
  'Add OAuth2 social login integration',
  'Optimize bundle size with code splitting',
  'Fix accessibility issues (ARIA labels)',
  'Implement dark mode theme support',
  'Add CSV export functionality',
];

const SAMPLE_DESCRIPTIONS = [
  'Need to implement JWT-based authentication with refresh tokens',
  'Database connection drops after 5 minutes of inactivity',
  'Users should be able to search across all content with fuzzy matching',
  'API documentation is outdated and missing new endpoints',
  'Current API structure is not RESTful and needs redesign',
  'Application is slow with large datasets (1000+ records)',
  'Test coverage is below 50% and needs improvement',
  'Memory usage grows over time and never releases',
  'Add Redis caching for frequently accessed data to reduce DB load',
  'Several packages have known security vulnerabilities',
  'Add WebSocket server for real-time notifications',
  'Implement rate limiting to prevent API abuse',
  'Enable strict TypeScript mode and fix all type errors',
  'Mobile layout breaks on iOS Safari and Android Chrome',
  'Users need email notifications for important events',
  'Allow users to sign in with Google, GitHub, and Facebook',
  'Initial bundle size is 2MB+ and needs optimization',
  'Screen readers cannot navigate the interface properly',
  'Add dark mode with system preference detection',
  'Users need to export data as CSV for external analysis',
];

const TAGS = [
  'bug', 'feature', 'enhancement', 'documentation', 'performance',
  'security', 'testing', 'refactor', 'ui', 'backend', 'frontend',
  'critical', 'urgent', 'blocked', 'needs-review'
];

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(array.length)];
  }

  sample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, count);
  }
}

/**
 * Generate realistic task data
 */
function generateTasks(count: number, random: SeededRandom): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const id = String(i + 1);

    tasks.push({
      id,
      title: `${random.choice(SAMPLE_TITLES)} (Task ${id})`,
      description: random.choice(SAMPLE_DESCRIPTIONS),
      status: random.choice(TASK_STATUSES),
      priority: random.choice(TASK_PRIORITIES),
      dependencies: [],
      subtasks: [],
    });
  }

  // Add some realistic dependencies (10% of tasks depend on previous tasks)
  for (let i = 10; i < count; i++) {
    if (random.next() < 0.1) {
      const dependencyCount = random.nextInt(3) + 1;
      const dependencies: string[] = [];

      for (let j = 0; j < dependencyCount; j++) {
        const depIndex = random.nextInt(i);
        dependencies.push(tasks[depIndex].id);
      }

      tasks[i].dependencies = [...new Set(dependencies)]; // Remove duplicates
    }
  }

  return tasks;
}

/**
 * Generate realistic issue data
 */
function generateIssues(count: number, taskCount: number, random: SeededRandom): Issue[] {
  const issues: Issue[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const id = `issue-${Date.now()}-${i + 1}`;
    const severity = random.choice(ISSUE_SEVERITIES);

    // Generate realistic timestamps
    const daysAgo = random.nextInt(30);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const updatedDaysAgo = random.nextInt(daysAgo + 1);
    const updatedAt = new Date(now.getTime() - updatedDaysAgo * 24 * 60 * 60 * 1000);

    issues.push({
      id,
      title: `${random.choice(SAMPLE_TITLES)} (Issue ${i + 1})`,
      description: random.choice(SAMPLE_DESCRIPTIONS),
      status: random.choice(ISSUE_STATUSES),
      severity,
      tags: random.sample(TAGS, random.nextInt(4) + 1),
      attachments: [],
      relatedTaskId: random.next() > 0.5 ? String(random.nextInt(taskCount) + 1) : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  }

  return issues;
}

/**
 * Parse CLI arguments
 */
function parseArgs(): {
  tasks: number;
  issues: number;
  output?: string;
  pretty: boolean;
  seed: number;
} {
  const args = process.argv.slice(2);
  const options = {
    tasks: 100,
    issues: 20,
    output: undefined as string | undefined,
    pretty: false,
    seed: Date.now(),
  };

  for (const arg of args) {
    if (arg.startsWith('--tasks=')) {
      options.tasks = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--issues=')) {
      options.issues = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--pretty') {
      options.pretty = true;
    } else if (arg.startsWith('--seed=')) {
      options.seed = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Test Data Generator CLI

Usage:
  npm run generate-test-data -- --tasks=1000 --issues=200
  tsx scripts/generate-test-data.ts --tasks=500 --issues=100 --output=test-data.json

Options:
  --tasks=N       Number of tasks to generate (default: 100)
  --issues=N      Number of issues to generate (default: 20)
  --output=FILE   Output file path (default: stdout)
  --pretty        Pretty-print JSON output
  --seed=N        Random seed for reproducible data
  --help, -h      Show this help message

Examples:
  # Generate 1000 tasks and 200 issues, save to file
  npm run generate-test-data -- --tasks=1000 --issues=200 --output=large-dataset.json --pretty

  # Generate reproducible data with seed
  npm run generate-test-data -- --tasks=100 --issues=20 --seed=12345 --pretty

  # Generate and pipe to jq for analysis
  npm run generate-test-data -- --tasks=500 --pretty | jq '.tasks | length'
      `);
      process.exit(0);
    }
  }

  return options;
}

/**
 * Main execution
 */
function main() {
  const options = parseArgs();
  const random = new SeededRandom(options.seed);

  console.error(`Generating ${options.tasks} tasks and ${options.issues} issues...`);
  console.error(`Using seed: ${options.seed} (for reproducibility)`);

  const tasks = generateTasks(options.tasks, random);
  const issues = generateIssues(options.issues, options.tasks, random);

  const output = {
    tasks,
    issues,
    metadata: {
      generated: new Date().toISOString(),
      seed: options.seed,
      counts: {
        tasks: tasks.length,
        issues: issues.length,
      },
    },
  };

  const jsonOutput = options.pretty
    ? JSON.stringify(output, null, 2)
    : JSON.stringify(output);

  if (options.output) {
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, jsonOutput, 'utf-8');
    console.error(`✅ Data written to: ${outputPath}`);
    console.error(`   Tasks: ${tasks.length}`);
    console.error(`   Issues: ${issues.length}`);
    console.error(`   File size: ${(jsonOutput.length / 1024).toFixed(1)} KB`);
  } else {
    // Write to stdout (so it can be piped)
    console.log(jsonOutput);
  }
}

// Run if executed directly
main();
