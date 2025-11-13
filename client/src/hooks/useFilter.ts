import { useMemo } from 'react';
import type { Task, Issue, TaskStatus, TaskPriority, IssueSeverity } from '@shared/schema';
import { useTaskSearch, useIssueSearch } from './useSearch';

/**
 * Filter configuration for tasks
 * Each property is an array of values to filter by (OR logic within category)
 */
export interface TaskFilters {
  status?: string[];      // TaskStatus[]
  priority?: string[];    // TaskPriority[]
  [key: string]: string[] | undefined;
}

/**
 * Filter configuration for issues (extends TaskFilters with severity)
 */
export interface IssueFilters extends TaskFilters {
  severity?: string[];    // IssueSeverity[]
}

/**
 * Generic filter function that applies multi-select filters to items
 *
 * Filter Logic:
 * - OR logic within each category (match any selected value)
 * - AND logic across categories (must match all active categories)
 * - Empty filter categories are ignored (no filtering applied)
 *
 * @param items - Array of items to filter
 * @param filters - Filter configuration object
 * @returns Filtered array of items
 */
function applyFilters<T extends Record<string, any>>(
  items: T[],
  filters: Record<string, string[] | undefined>
): T[] {
  return items.filter(item => {
    // Check each filter category (AND logic across categories)
    return Object.entries(filters).every(([filterKey, filterValues]) => {
      // Skip if filter is empty or undefined (no filtering for this category)
      if (!filterValues || filterValues.length === 0) {
        return true;
      }

      // Check if item's field value is in filter values (OR logic within category)
      const itemValue = item[filterKey];
      return filterValues.includes(itemValue);
    });
  });
}

/**
 * Custom hook to filter tasks by status and priority
 *
 * Features:
 * - Memoized for performance optimization
 * - Multi-select filters (OR within category, AND across categories)
 * - Type-safe with Task schema
 *
 * Example:
 * ```tsx
 * const filters = { status: ['pending', 'in-progress'], priority: ['high'] };
 * const filteredTasks = useTaskFilter(tasks, filters);
 * // Returns tasks that are (pending OR in-progress) AND high priority
 * ```
 *
 * @param tasks - Array of tasks to filter
 * @param filters - Filter configuration
 * @returns Filtered array of tasks
 */
export function useTaskFilter(tasks: Task[], filters: TaskFilters): Task[] {
  return useMemo(() => {
    // Early return if no filters are active
    if (!filters.status?.length && !filters.priority?.length) {
      return tasks;
    }

    return applyFilters(tasks, filters);
  }, [tasks, filters.status, filters.priority]);
}

/**
 * Custom hook to filter issues by status, priority, and severity
 *
 * Features:
 * - Memoized for performance optimization
 * - Multi-select filters (OR within category, AND across categories)
 * - Type-safe with Issue schema
 * - Includes severity filtering (issues only)
 *
 * Example:
 * ```tsx
 * const filters = {
 *   status: ['open'],
 *   severity: ['critical', 'high']
 * };
 * const filteredIssues = useIssueFilter(issues, filters);
 * // Returns issues that are open AND (critical OR high severity)
 * ```
 *
 * @param issues - Array of issues to filter
 * @param filters - Filter configuration (includes severity)
 * @returns Filtered array of issues
 */
export function useIssueFilter(issues: Issue[], filters: IssueFilters): Issue[] {
  return useMemo(() => {
    // Early return if no filters are active
    if (!filters.status?.length && !filters.priority?.length && !filters.severity?.length) {
      return issues;
    }

    return applyFilters(issues, filters);
  }, [issues, filters.status, filters.priority, filters.severity]);
}

/**
 * NOTE: Search functions have been replaced with fuzzy search using Fuse.js
 * See useSearch.ts for the underlying implementation
 * These functions are kept for backward compatibility but delegate to useTaskSearch/useIssueSearch
 */

/**
 * Combined search + filter hook for tasks
 * Applies fuzzy search first (Fuse.js), then filters
 *
 * Features:
 * - Fuzzy search using Fuse.js (typo-tolerant, ranked results)
 * - Memoized for performance
 * - Search then filter pipeline
 * - Type-safe
 *
 * @param tasks - Array of tasks
 * @param searchQuery - Search query string
 * @param filters - Filter configuration
 * @returns Tasks that match search query AND filters
 */
export function useTaskSearchAndFilter(
  tasks: Task[],
  searchQuery: string,
  filters: TaskFilters
): Task[] {
  // Apply fuzzy search first using Fuse.js
  const searchedTasks = useTaskSearch(tasks, searchQuery);

  // Then apply filters
  return useMemo(() => {
    if (!filters.status?.length && !filters.priority?.length) {
      return searchedTasks;
    }

    return applyFilters(searchedTasks, filters);
  }, [searchedTasks, filters.status, filters.priority]);
}

/**
 * Combined search + filter hook for issues
 * Applies fuzzy search first (Fuse.js), then filters
 *
 * Features:
 * - Fuzzy search using Fuse.js (typo-tolerant, ranked results)
 * - Memoized for performance
 * - Search then filter pipeline
 * - Type-safe
 *
 * @param issues - Array of issues
 * @param searchQuery - Search query string
 * @param filters - Filter configuration
 * @returns Issues that match search query AND filters
 */
export function useIssueSearchAndFilter(
  issues: Issue[],
  searchQuery: string,
  filters: IssueFilters
): Issue[] {
  // Apply fuzzy search first using Fuse.js
  const searchedIssues = useIssueSearch(issues, searchQuery);

  // Then apply filters
  return useMemo(() => {
    if (!filters.status?.length && !filters.priority?.length && !filters.severity?.length) {
      return searchedIssues;
    }

    return applyFilters(searchedIssues, filters);
  }, [searchedIssues, filters.status, filters.priority, filters.severity]);
}
