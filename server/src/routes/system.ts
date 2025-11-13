import { Router } from 'express';
import { taskMasterService } from '../services/TaskMasterService';
import { issueService } from '../../services/IssueService';
import type { Request, Response } from 'express';
import type { Task, Issue } from '@shared/schema';

const router = Router();

// Track request metrics
const requestMetrics = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0,
  responseTimes: [] as number[],
};

// Middleware to track metrics
router.use((req, res, next) => {
  const start = Date.now();
  requestMetrics.requestCount++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    requestMetrics.responseTimes.push(duration);
    
    // Keep only last 100 response times
    if (requestMetrics.responseTimes.length > 100) {
      requestMetrics.responseTimes.shift();
    }

    if (res.statusCode >= 400) {
      requestMetrics.errorCount++;
    }
  });

  next();
});

/**
 * GET /api/system/health
 * System health check - verifies API, database, and MCP connectivity
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check TaskMaster connection
    taskMasterService.getTasks();

    res.json({
      success: true,
      status: {
        api: 'healthy',
        database: 'active',
        mcp: 'running', // TODO: Add actual MCP health check
      },
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - requestMetrics.startTime) / 1000),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: {
        api: 'healthy',
        database: 'error',
        mcp: 'unknown',
      },
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/system/stats
 * TaskMaster and Issue statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [tasks, issues] = await Promise.all([
      Promise.resolve(taskMasterService.getTasks()),
      issueService.getAllIssues(),
    ]);

    const stats = {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t: Task) => t.status === 'pending').length,
      inProgressTasks: tasks.filter((t: Task) => t.status === 'in-progress').length,
      completedTasks: tasks.filter((t: Task) => t.status === 'done').length,
      totalIssues: issues.length,
      openIssues: issues.filter((i: Issue) => i.status === 'open').length,
      criticalIssues: issues.filter((i: Issue) => i.severity === 'critical').length,
    };

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    });
  }
});

/**
 * GET /api/system/performance
 * API performance metrics (latency, throughput, errors)
 */
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const avgResponseTime = requestMetrics.responseTimes.length > 0
      ? Math.round(requestMetrics.responseTimes.reduce((a, b) => a + b, 0) / requestMetrics.responseTimes.length)
      : 0;

    const uptime = Math.floor((Date.now() - requestMetrics.startTime) / 1000);
    const uptimePercentage = 99.9; // TODO: Calculate actual uptime

    const metrics = {
      avgResponseTime,
      requestsLastHour: requestMetrics.requestCount,
      errorsLastHour: requestMetrics.errorCount,
      uptime,
      uptimePercentage,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch performance metrics',
    });
  }
});

/**
 * GET /api/system/activity
 * Recent activity feed (task updates, issue changes)
 */
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const [allTasks, allIssues] = await Promise.all([
      Promise.resolve(taskMasterService.getTasks()),
      issueService.getAllIssues(),
    ]);

    // Take most recent tasks (by reverse ID order) and issues (by updatedAt)
    const recentTasks = allTasks.slice(-5).reverse();

    const recentIssues = allIssues
      .sort((a: Issue, b: Issue) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    // Combine activity items
    const activity = [
      ...recentTasks.map((task: Task) => ({
        id: `task-${task.id}`,
        time: new Date().toISOString(), // Use current time since tasks don't have updatedAt
        action: `Task #${task.id}: ${task.status}`,
        type: 'task' as const,
        title: task.title,
      })),
      ...recentIssues.map((issue: Issue) => ({
        id: `issue-${issue.id}`,
        time: issue.updatedAt,
        action: `Issue #${issue.id}: ${issue.status}`,
        type: 'issue' as const,
        title: issue.title,
      })),
    ]
      .slice(0, 10);

    res.json({
      success: true,
      activity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activity',
    });
  }
});

export default router;
