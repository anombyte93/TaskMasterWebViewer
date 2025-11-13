import { useQuery } from '@tanstack/react-query';
import type { Task } from '@shared/schema';

/**
 * Response type from /api/tasks endpoint
 * API returns: { success: true, tasks: Task[] }
 */
interface TasksResponse {
  success: boolean;
  tasks: Task[];
}

/**
 * Response type from /api/tasks/current endpoint
 * API returns: { success: true, task: Task } or { success: false, message: string }
 */
interface CurrentTaskResponse {
  success: boolean;
  task?: Task;
  message?: string;
}

/**
 * Custom hook to fetch all tasks from TaskMaster
 *
 * Features:
 * - Real-time updates via WebSocket (no polling needed)
 * - Error handling
 * - Loading states
 * - Typed with Task schema from shared/schema
 *
 * Note: This hook works with useWebSocketSync for real-time cache invalidation.
 * The WebSocket connection invalidates the cache when tasks.json changes,
 * triggering automatic refetch.
 *
 * @returns React Query result with tasks data
 */
export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
      }
      const data: TasksResponse = await response.json();
      return data.tasks;
    },
    // No polling - WebSocket handles real-time updates
    staleTime: Infinity,
  });
}

/**
 * Custom hook to fetch the current task (in-progress or next pending)
 *
 * Features:
 * - Returns null if no current task exists (handles 404)
 * - Real-time updates via WebSocket
 * - Error handling for server errors
 *
 * Note: This hook works with useWebSocketSync for real-time cache invalidation.
 *
 * @returns React Query result with current task (or null)
 */
export function useCurrentTask() {
  return useQuery<Task | null>({
    queryKey: ['tasks', 'current'],
    queryFn: async () => {
      const response = await fetch('/api/tasks/current');

      // Handle 404 - no current task (not an error state)
      if (response.status === 404) {
        return null;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        throw new Error(`Failed to fetch current task: ${response.status} ${response.statusText}`);
      }

      const data: CurrentTaskResponse = await response.json();
      return data.task || null;
    },
    // No polling - WebSocket handles real-time updates
    staleTime: Infinity,
  });
}

/**
 * Custom hook to fetch a specific task by ID
 *
 * Note: This hook works with useWebSocketSync for real-time cache invalidation.
 *
 * @param taskId - Task ID (e.g., "1", "1.2", "1.2.3")
 * @returns React Query result with task data
 */
export function useTask(taskId: string) {
  return useQuery<Task | null>({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);

      // Handle 404 - task not found
      if (response.status === 404) {
        return null;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        throw new Error(`Failed to fetch task ${taskId}: ${response.status} ${response.statusText}`);
      }

      const data: CurrentTaskResponse = await response.json();
      return data.task || null;
    },
    // Only fetch if taskId is provided
    enabled: !!taskId,
    // No polling - WebSocket handles real-time updates
    staleTime: Infinity,
  });
}
