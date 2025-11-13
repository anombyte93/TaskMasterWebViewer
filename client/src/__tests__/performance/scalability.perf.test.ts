import { renderHook } from '@testing-library/react';
import { useTaskSearchAndFilter, useIssueSearchAndFilter } from '@/hooks/useFilter';
import type { TaskFilters, IssueFilters } from '@/hooks/useFilter';
import { generateTasks, generateIssues, benchmarkPerformance, measurePerformance } from '@/utils/testDataGenerator';

/**
 * Scalability Performance Tests
 *
 * Validates application performance with large datasets (100-1000+ items).
 *
 * Tests:
 * - Initial processing time with varying dataset sizes
 * - Combined search + filter operations
 * - Stress testing with 10K+ items
 *
 * Performance Goals:
 * - 100 items: <100ms combined operations
 * - 500 items: <500ms combined operations
 * - 1000 items: <1000ms combined operations
 * - 10000 items: <2000ms combined operations (2s page load requirement)
 */

describe('Scalability Performance Tests', () => {
  describe('Full Pipeline Performance (Search + Filter)', () => {
    it('should process 100 tasks + filters in <100ms', () => {
      const tasks = generateTasks(100);
      const searchQuery = 'authentication';
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 10);

      console.log('\n=== Full Pipeline (100 tasks) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(100);
    });

    it('should process 500 tasks + filters in <500ms', () => {
      const tasks = generateTasks(500);
      const searchQuery = 'authentication';
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 10);

      console.log('\n=== Full Pipeline (500 tasks) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(500);
    });

    it('should process 1000 tasks + filters in <1000ms', () => {
      const tasks = generateTasks(1000);
      const searchQuery = 'authentication';
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 10);

      console.log('\n=== Full Pipeline (1000 tasks) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(1000);
    });

    it('should process 10000 tasks + filters in <2000ms (CRITICAL: page load requirement)', () => {
      const tasks = generateTasks(10000);
      const searchQuery = 'authentication';
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
        priority: ['high'],
      };

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 5); // Fewer iterations for large dataset

      console.log('\n=== Full Pipeline (10000 tasks) - CRITICAL ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`Requirement: <2000ms for page load`);

      // Critical requirement for PRD: <2s page load
      expect(stats.avg).toBeLessThan(2000);

      if (stats.avg >= 1500) {
        console.warn('⚠️  Processing time approaching 2s threshold');
        console.warn('    Consider virtual scrolling or pagination');
      } else {
        console.log('✅ Well within 2s page load requirement!');
      }
    });
  });

  describe('Issue Processing Performance', () => {
    it('should process 200 issues + filters in <500ms', () => {
      const issues = generateIssues(200, 1000);
      const searchQuery = 'authentication';
      const filters: IssueFilters = {
        status: ['open'],
        priority: ['high'],
        severity: ['critical'],
      };

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useIssueSearchAndFilter(issues, searchQuery, filters)
        );
        return result.current;
      }, 10);

      console.log('\n=== Issue Pipeline (200 issues) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(500);
    });

    it('should process 1000 issues + filters in <1000ms', () => {
      const issues = generateIssues(1000, 5000);
      const searchQuery = 'authentication';
      const filters: IssueFilters = {
        status: ['open'],
        priority: ['high'],
        severity: ['critical'],
      };

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useIssueSearchAndFilter(issues, searchQuery, filters)
        );
        return result.current;
      }, 10);

      console.log('\n=== Issue Pipeline (1000 issues) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`P95: ${stats.p95.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(1000);
    });
  });

  describe('Memory and Data Structure Tests', () => {
    it('should handle large task arrays efficiently', () => {
      const tasks = generateTasks(5000);

      const { duration } = measurePerformance(() => {
        // Just measure array operations
        const filtered = tasks.filter((t) => t.status === 'pending');
        const mapped = filtered.map((t) => t.title);
        return mapped.length;
      }, 'Large array operations (5000 items)');

      console.log('\n=== Array Operations (5000 tasks) ===');
      console.log(`Duration: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(50);
    });

    it('should handle deep search operations efficiently', () => {
      const tasks = generateTasks(1000);
      const searchQuery = 'authentication system implementation with jwt tokens';

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, {})
        );
        return result.current;
      }, 10);

      console.log('\n=== Deep Search (1000 tasks, long query) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      expect(stats.avg).toBeLessThan(300);
    });
  });

  describe('Performance Consistency Tests', () => {
    it('should have consistent performance across multiple runs (1000 items)', () => {
      const tasks = generateTasks(1000);
      const searchQuery = 'authentication';
      const filters: TaskFilters = {
        status: ['pending', 'in-progress'],
      };

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 20); // More iterations for consistency check

      console.log('\n=== Consistency Check (1000 items, 20 runs) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`Median: ${stats.median.toFixed(2)}ms`);
      console.log(`Min: ${stats.min.toFixed(2)}ms`);
      console.log(`Max: ${stats.max.toFixed(2)}ms`);
      console.log(`Variance: ${(stats.max - stats.min).toFixed(2)}ms`);

      const variance = stats.max - stats.min;
      const variancePercent = (variance / stats.avg) * 100;

      console.log(`Variance %: ${variancePercent.toFixed(1)}%`);

      // Variance should be reasonable (<100% of average)
      expect(variancePercent).toBeLessThan(100);
    });
  });

  describe('Edge Cases and Boundary Tests', () => {
    it('should handle empty datasets instantly', () => {
      const tasks: any[] = [];
      const searchQuery = 'test';
      const filters: TaskFilters = {
        status: ['pending'],
      };

      const { duration } = measurePerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 'Empty dataset');

      console.log('\n=== Empty Dataset ===');
      console.log(`Duration: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(5);
    });

    it('should handle single item efficiently', () => {
      const tasks = generateTasks(1);
      const searchQuery = 'test';
      const filters: TaskFilters = {};

      const { duration } = measurePerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 'Single item');

      console.log('\n=== Single Item ===');
      console.log(`Duration: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(5);
    });

    it('should handle no results efficiently', () => {
      const tasks = generateTasks(1000);
      const searchQuery = 'xyznonexistentquery123';
      const filters: TaskFilters = {};

      const stats = benchmarkPerformance(() => {
        const { result } = renderHook(() =>
          useTaskSearchAndFilter(tasks, searchQuery, filters)
        );
        return result.current;
      }, 10);

      console.log('\n=== No Results (1000 items) ===');
      console.log(`Average: ${stats.avg.toFixed(2)}ms`);

      // Should still be fast even with no results
      expect(stats.avg).toBeLessThan(300);
    });
  });

  describe('Performance Summary Report', () => {
    it('should generate comprehensive scalability report', () => {
      const testCases = [
        { count: 10, label: 'Minimal (10)' },
        { count: 100, label: 'Small (100)' },
        { count: 500, label: 'Medium (500)' },
        { count: 1000, label: 'Large (1000)' },
        { count: 5000, label: 'XL (5000)' },
        { count: 10000, label: 'XXL (10000)' },
      ];

      console.log('\n========================================');
      console.log('SCALABILITY PERFORMANCE REPORT');
      console.log('========================================\n');

      const results: Array<{ label: string; duration: number; status: string }> = [];

      testCases.forEach(({ count, label }) => {
        const tasks = generateTasks(count);
        const searchQuery = 'authentication';
        const filters: TaskFilters = {
          status: ['pending', 'in-progress'],
        };

        const { duration } = measurePerformance(() => {
          const { result } = renderHook(() =>
            useTaskSearchAndFilter(tasks, searchQuery, filters)
          );
          return result.current;
        });

        let status = '✅ EXCELLENT';
        if (duration >= 2000) {
          status = '❌ SLOW';
        } else if (duration >= 1000) {
          status = '⚠️  ACCEPTABLE';
        }

        results.push({ label, duration, status });
      });

      // Print results table
      console.log('Dataset Size      | Process Time | Status');
      console.log('------------------|--------------|---------------');
      results.forEach(({ label, duration, status }) => {
        console.log(`${label.padEnd(18)}| ${duration.toFixed(0).padStart(9)}ms | ${status}`);
      });

      console.log('\n========================================');
      console.log('KEY FINDINGS:');
      console.log('- Target: <2000ms for page load (10K items)');
      const largeDataset = results.find((r) => r.label.includes('10000'));
      if (largeDataset) {
        console.log(`- Actual: ${largeDataset.duration.toFixed(0)}ms`);
        console.log(
          `- Margin: ${((2000 - largeDataset.duration) / 2000 * 100).toFixed(1)}% headroom`
        );
      }
      console.log('========================================\n');

      // Critical requirement: 10K items should be <2s
      const tenKResult = results.find((r) => r.label.includes('10000'));
      if (tenKResult) {
        expect(tenKResult.duration).toBeLessThan(2000);
      }
    });
  });
});
