/**
 * Manual test suite for useFilter hooks
 * Run these tests by importing and executing them in a component or console
 */

import { searchTasks, searchIssues } from '../useFilter';
import type { Task, Issue } from '@shared/schema';

// Mock test data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement authentication',
    description: 'Add JWT-based auth system',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Fix bug in dashboard',
    description: 'Dashboard not loading properly',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Write documentation',
    description: 'API documentation for endpoints',
    status: 'done',
    priority: 'low'
  },
  {
    id: '4',
    title: 'Update dependencies',
    description: 'npm packages need updating',
    status: 'blocked',
  }
];

const mockIssues: Issue[] = [
  {
    id: 'issue-1',
    title: 'Critical bug in auth',
    description: 'Users cannot login',
    severity: 'critical',
    status: 'open',
    tags: ['auth', 'security'],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'issue-2',
    title: 'Performance issue',
    description: 'Dashboard loads slowly',
    severity: 'high',
    status: 'in-progress',
    tags: ['performance', 'dashboard'],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'issue-3',
    title: 'UI glitch',
    description: 'Button alignment is off',
    severity: 'low',
    status: 'resolved',
    tags: ['ui', 'design'],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Test search functionality
export function testSearchTasks() {
  console.log('=== Testing Task Search ===');

  // Test 1: Search by title
  const titleResults = searchTasks(mockTasks, 'auth');
  console.log('Search "auth" in title:', titleResults.length === 1, titleResults);

  // Test 2: Search by description
  const descResults = searchTasks(mockTasks, 'dashboard');
  console.log('Search "dashboard" in description:', descResults.length === 1, descResults);

  // Test 3: Empty search
  const emptyResults = searchTasks(mockTasks, '');
  console.log('Empty search returns all:', emptyResults.length === 4, emptyResults);

  // Test 4: Case insensitive
  const caseResults = searchTasks(mockTasks, 'IMPLEMENT');
  console.log('Case insensitive search:', caseResults.length === 1, caseResults);

  // Test 5: No matches
  const noResults = searchTasks(mockTasks, 'nonexistent');
  console.log('No matches:', noResults.length === 0, noResults);
}

export function testSearchIssues() {
  console.log('\n=== Testing Issue Search ===');

  // Test 1: Search by title
  const titleResults = searchIssues(mockIssues, 'bug');
  console.log('Search "bug" in title:', titleResults.length === 1, titleResults);

  // Test 2: Search by description
  const descResults = searchIssues(mockIssues, 'slowly');
  console.log('Search "slowly" in description:', descResults.length === 1, descResults);

  // Test 3: Search by tags
  const tagResults = searchIssues(mockIssues, 'performance');
  console.log('Search "performance" in tags:', tagResults.length === 1, tagResults);

  // Test 4: Multiple matches
  const multiResults = searchIssues(mockIssues, 'dashboard');
  console.log('Multiple matches:', multiResults.length === 1, multiResults);
}

// Example filter tests (would need to be run in a React component)
export const filterTestScenarios = {
  tasks: {
    // Test 1: Filter by single status
    singleStatus: {
      filters: { status: ['pending'] },
      expectedCount: 1
    },
    // Test 2: Filter by multiple statuses (OR logic)
    multiStatus: {
      filters: { status: ['pending', 'in-progress'] },
      expectedCount: 2
    },
    // Test 3: Filter by status AND priority (AND logic)
    statusAndPriority: {
      filters: { status: ['pending', 'in-progress'], priority: ['high'] },
      expectedCount: 1 // Only task 1
    },
    // Test 4: Empty filters
    emptyFilters: {
      filters: {},
      expectedCount: 4
    }
  },
  issues: {
    // Test 1: Filter by severity
    severity: {
      filters: { severity: ['critical', 'high'] },
      expectedCount: 2
    },
    // Test 2: Filter by status AND severity
    statusAndSeverity: {
      filters: { status: ['open'], severity: ['critical'] },
      expectedCount: 1
    }
  }
};

// Run all tests
export function runAllTests() {
  testSearchTasks();
  testSearchIssues();
  console.log('\n=== Filter Test Scenarios ===');
  console.log('Run these in a React component with actual hooks:', filterTestScenarios);
}
