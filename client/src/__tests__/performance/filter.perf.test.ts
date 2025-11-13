import { renderHook } from '@testing-library/react';
import { useTaskFilter, useIssueFilter, useTaskSearchAndFilter, useIssueSearchAndFilter } from '@/hooks/useFilter';
import type { TaskFilters, IssueFilters } from '@/hooks/useFilter';
import { generateTasks, generateIssues, benchmarkPerformance } from '@/utils/testDataGenerator';

/**
 * Performance Tests for Filter Functionality
 *
 * These tests validate that filter operations meet performance requirements:
 * - Filter alone: <100ms for 1000 items
 * - Combined search + filter: <300ms for 1000 items
 */

describe('Filter Performance', () => {
  describe('Task Filter Performance', () => {
    it('should filter 100 tasks in <50ms (avg)', () => {
      const tasks = generateTasks(100);
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const { result } = renderHook(() => useTaskFilter(tasks, filters));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskFilter(tasks, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== Task Filter (100 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(50);
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should filter 1000 tasks in <100ms (avg)', () => {
      const tasks = generateTasks(1000);
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const { result } = renderHook(() => useTaskFilter(tasks, filters));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskFilter(tasks, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== Task Filter (1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(100);
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should filter 10000 tasks in <200ms (avg)', () => {
      const tasks = generateTasks(10000);
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const { result } = renderHook(() => useTaskFilter(tasks, filters));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskFilter(tasks, filters));
        return hookResult.current;
      }, 5);

      console.log('\n=== Task Filter (10000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(200);
      expect(result.current).toBeDefined();
    });

    it('should handle empty filters efficiently (no-op)', () => {
      const tasks = generateTasks(1000);
      const filters: TaskFilters = {};

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskFilter(tasks, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== Task Filter (empty filters, 1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      // Empty filters should be instant (early return optimization)
      expect(stats.avg).toBeLessThan(5);
    });

    it('should handle single filter category efficiently', () => {
      const tasks = generateTasks(1000);
      const filters: TaskFilters = {
        status: ['pending'],
      };

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskFilter(tasks, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== Task Filter (single category, 1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(100);
    });
  });

  describe('Issue Filter Performance', () => {
    it('should filter 100 issues in <50ms (avg)', () => {
      const issues = generateIssues(100);
      const filters: IssueFilters = {
        status: ['pending'],
        priority: ['high'],
        severity: ['critical'],
      };

      const { result } = renderHook(() => useIssueFilter(issues, filters));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useIssueFilter(issues, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== Issue Filter (100 items, 3 categories) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(50);
      expect(result.current).toBeDefined();
    });

    it('should filter 1000 issues in <100ms (avg)', () => {
      const issues = generateIssues(1000);
      const filters: IssueFilters = {
        status: ['pending'],
        priority: ['high'],
        severity: ['critical'],
      };

      const { result } = renderHook(() => useIssueFilter(issues, filters));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useIssueFilter(issues, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== Issue Filter (1000 items, 3 categories) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(100);
      expect(result.current).toBeDefined();
    });
  });

  describe('Combined Search + Filter Performance', () => {
    it('should search + filter 1000 tasks in <300ms (avg)', () => {
      const tasks = generateTasks(1000);
      const searchQuery = 'authentication';
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const { result } = renderHook(() => useTaskSearchAndFilter(tasks, searchQuery, filters));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return hookResult.current;
      }, 10);

      console.log('\n=== Combined Search + Filter (1000 tasks) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`Min: ${stats.min.toFixed(2)}ms`);
      console.log(`Max: ${stats.max.toFixed(2)}ms`);

      // Critical requirement: <300ms for combined operations
      expect(stats.avg).toBeLessThan(300);
      expect(result.current).toBeDefined();
    });

    it('should search + filter 1000 issues in <300ms (avg)', () => {
      const issues = generateIssues(1000);
      const searchQuery = 'authentication';
      const filters: IssueFilters = {
        status: ['pending'],
        priority: ['high'],
        severity: ['critical'],
      };

      const { result } = renderHook(() => useIssueSearchAndFilter(issues, searchQuery, filters));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() =>
          useIssueSearchAndFilter(issues, searchQuery, filters)
        );
        return hookResult.current;
      }, 10);

      console.log('\n=== Combined Search + Filter (1000 issues) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      // Critical requirement: <300ms for combined operations
      expect(stats.avg).toBeLessThan(300);
      expect(result.current).toBeDefined();
    });

    it('should handle worst-case scenario: 10000 items + complex filters', () => {
      const tasks = generateTasks(10000);
      const searchQuery = 'authentication system implementation';
      const filters: TaskFilters = {
        status: ['pending', 'in-progress', 'done'],
        priority: ['high', 'medium'],
      };

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return hookResult.current;
      }, 3); // Fewer iterations for large dataset

      console.log('\n=== Worst Case: 10K items + search + filter ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      if (stats.avg >= 500) {
        console.warn('⚠️  Combined operation exceeded 500ms on 10K items');
        console.warn('    Recommendations:');
        console.warn('    - Consider pagination/virtual scrolling for 5K+ items');
        console.warn('    - Move search to Web Worker for 10K+ items');
        console.warn('    - Add server-side filtering for production');
      }

      // Not a hard requirement for 10K items, just measure it
      // Allow up to 1500ms for 10K items (still reasonable for large datasets)
      expect(stats.avg).toBeLessThan(1500); // Sanity check
    });
  });

  describe('Filter Edge Cases', () => {
    it('should handle multiple filter values efficiently', () => {
      const tasks = generateTasks(1000);
      const filters: TaskFilters = {
        status: ['pending', 'in-progress', 'done', 'blocked'], // 4 values
        priority: ['high', 'medium', 'low'], // 3 values
      };

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskFilter(tasks, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== Multiple Filter Values (1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(100);
    });

    it('should handle no-match filters efficiently', () => {
      const tasks = generateTasks(1000);
      const filters: TaskFilters = {
        status: ['cancelled'], // Likely few matches
        priority: ['high'],
      };

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskFilter(tasks, filters));
        return hookResult.current;
      }, 10);

      console.log('\n=== No-Match Filters (1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      // Should be fast even if no results
      expect(stats.avg).toBeLessThan(100);
    });
  });
});
