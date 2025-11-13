import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Task, Issue } from '@shared/schema';

/**
 * Configuration options for fuzzy search
 */
interface SearchOptions {
  /** Fields to search in (e.g., ['title', 'description']) */
  keys: string[];
  /** Fuzzy match threshold (0.0 = exact, 1.0 = match anything) */
  threshold?: number;
  /** Maximum character distance for matching */
  distance?: number;
  /** Minimum character length for a match */
  minMatchCharLength?: number;
}

/**
 * Generic fuzzy search hook using Fuse.js
 *
 * Features:
 * - Fuzzy matching with configurable threshold
 * - Multi-field search across specified keys
 * - Memoized Fuse instance for performance
 * - Returns all items if search query is empty
 * - TypeScript strict mode compatible
 *
 * @template T - Type of items to search
 * @param items - Array of items to search through
 * @param searchQuery - Search query string
 * @param options - Search configuration options
 * @returns Filtered array of items matching the search query
 *
 * @example
 * ```tsx
 * const filteredUsers = useSearch(users, searchQuery, {
 *   keys: ['name', 'email'],
 *   threshold: 0.3
 * });
 * ```
 */
export function useSearch<T>(
  items: T[],
  searchQuery: string,
  options: SearchOptions
): T[] {
  // Create Fuse instance (memoized to avoid recreation on each render)
  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: options.keys,
      threshold: options.threshold ?? 0.3,
      distance: options.distance ?? 100,
      minMatchCharLength: options.minMatchCharLength ?? 2,
      includeScore: true,
      includeMatches: true,
      // Use best match algorithm
      useExtendedSearch: false,
      // Sort by best match
      shouldSort: true,
    });
  }, [items, options.keys, options.threshold, options.distance, options.minMatchCharLength]);

  // Perform search (memoized to avoid unnecessary recalculations)
  const results = useMemo(() => {
    // Return all items if no search query
    if (!searchQuery || searchQuery.trim() === '') {
      return items;
    }

    // Perform fuzzy search
    const fuseResults = fuse.search(searchQuery);

    // Extract items from Fuse results
    return fuseResults.map(result => result.item);
  }, [fuse, searchQuery, items]);

  return results;
}

/**
 * Task-specific search hook with optimized configuration
 *
 * Searches across:
 * - Task ID (e.g., "1", "1.2", "1.2.3")
 * - Title
 * - Description
 * - Details (if present)
 *
 * @param tasks - Array of tasks to search
 * @param searchQuery - Search query string
 * @returns Filtered array of tasks matching the search query
 *
 * @example
 * ```tsx
 * const filteredTasks = useTaskSearch(tasks, 'authentication');
 * ```
 */
export function useTaskSearch(tasks: Task[], searchQuery: string): Task[] {
  return useSearch(tasks, searchQuery, {
    keys: ['id', 'title', 'description', 'details'],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
  });
}

/**
 * Issue-specific search hook with optimized configuration
 *
 * Searches across:
 * - Issue ID
 * - Title
 * - Description
 * - Tags array
 *
 * @param issues - Array of issues to search
 * @param searchQuery - Search query string
 * @returns Filtered array of issues matching the search query
 *
 * @example
 * ```tsx
 * const filteredIssues = useIssueSearch(issues, 'critical bug');
 * ```
 */
export function useIssueSearch(issues: Issue[], searchQuery: string): Issue[] {
  return useSearch(issues, searchQuery, {
    keys: ['id', 'title', 'description', 'tags'],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
  });
}
