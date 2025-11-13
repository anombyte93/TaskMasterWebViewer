import { renderHook } from '@testing-library/react';
import { useTaskSearch, useIssueSearch } from '@/hooks/useSearch';
import { generateTasks, generateIssues, benchmarkPerformance } from '@/utils/testDataGenerator';

/**
 * Performance Tests for Search Functionality
 *
 * These tests validate that search operations meet the <300ms requirement
 * even with large datasets (1000+ items).
 *
 * Performance Goals:
 * - 100 items: <50ms
 * - 1000 items: <150ms
 * - 10000 items: <300ms (stretch goal)
 */

describe('Search Performance', () => {
  describe('Task Search Performance', () => {
    it('should search 100 tasks in <50ms (avg)', () => {
      const tasks = generateTasks(100);
      const searchQuery = 'authentication';

      const { result } = renderHook(() => useTaskSearch(tasks, searchQuery));

      // Benchmark the search operation
      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskSearch(tasks, searchQuery));
        return hookResult.current;
      }, 10);

      console.log('\n=== Task Search (100 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`Min: ${stats.min.toFixed(2)}ms`);
      console.log(`Max: ${stats.max.toFixed(2)}ms`);

      // Assert performance goal
      expect(stats.avg).toBeLessThan(50);

      // Verify functionality
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should search 1000 tasks in <150ms (avg)', () => {
      const tasks = generateTasks(1000);
      const searchQuery = 'authentication';

      const { result } = renderHook(() => useTaskSearch(tasks, searchQuery));

      // Benchmark the search operation
      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskSearch(tasks, searchQuery));
        return hookResult.current;
      }, 10);

      console.log('\n=== Task Search (1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`Min: ${stats.min.toFixed(2)}ms`);
      console.log(`Max: ${stats.max.toFixed(2)}ms`);

      // Assert performance goal
      expect(stats.avg).toBeLessThan(150);

      // Verify functionality
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should search 10000 tasks in <300ms (avg) - STRETCH GOAL', () => {
      const tasks = generateTasks(10000);
      const searchQuery = 'authentication';

      const { result } = renderHook(() => useTaskSearch(tasks, searchQuery));

      // Benchmark the search operation
      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskSearch(tasks, searchQuery));
        return hookResult.current;
      }, 5); // Fewer iterations for large dataset

      console.log('\n=== Task Search (10000 items) - STRETCH GOAL ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`Min: ${stats.min.toFixed(2)}ms`);
      console.log(`Max: ${stats.max.toFixed(2)}ms`);

      // Warn if over 300ms (not a failure - this is a stretch goal)
      if (stats.avg >= 300) {
        console.warn('⚠️  Search exceeded 300ms - consider Web Worker optimization for 10K+ items');
      }

      // Verify functionality
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should handle empty search query efficiently', () => {
      const tasks = generateTasks(1000);
      const searchQuery = '';

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useTaskSearch(tasks, searchQuery));
        return hookResult.current;
      }, 10);

      console.log('\n=== Task Search (empty query, 1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      // Empty query should be nearly instant (just returns all tasks)
      expect(stats.avg).toBeLessThan(10);
    });
  });

  describe('Issue Search Performance', () => {
    it('should search 100 issues in <50ms (avg)', () => {
      const issues = generateIssues(100);
      const searchQuery = 'authentication';

      const { result } = renderHook(() => useIssueSearch(issues, searchQuery));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useIssueSearch(issues, searchQuery));
        return hookResult.current;
      }, 10);

      console.log('\n=== Issue Search (100 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(50);
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should search 1000 issues in <150ms (avg)', () => {
      const issues = generateIssues(1000);
      const searchQuery = 'authentication';

      const { result } = renderHook(() => useIssueSearch(issues, searchQuery));

      const stats = benchmarkPerformance(() => {
        const { result: hookResult } = renderHook(() => useIssueSearch(issues, searchQuery));
        return hookResult.current;
      }, 10);

      console.log('\n=== Issue Search (1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(150);
      expect(result.current).toBeDefined();
      expect(Array.isArray(result.current)).toBe(true);
    });
  });

  describe('Search Query Variations', () => {
    const tasks = generateTasks(1000);

    it('should handle short queries (2 chars) efficiently', () => {
      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() => useTaskSearch(tasks, 'au'));
        return result.current;
      }, 10);

      console.log('\n=== Short Query (2 chars, 1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(150);
    });

    it('should handle long queries (50+ chars) efficiently', () => {
      const longQuery = 'authentication system with JWT tokens and refresh mechanisms';

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() => useTaskSearch(tasks, longQuery));
        return result.current;
      }, 10);

      console.log('\n=== Long Query (50+ chars, 1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(150);
    });

    it('should handle special characters safely', () => {
      const specialQuery = 'task @#$% [test] (regex)';

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() => useTaskSearch(tasks, specialQuery));
        return result.current;
      }, 10);

      console.log('\n=== Special Characters Query (1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(150);
    });
  });
});
