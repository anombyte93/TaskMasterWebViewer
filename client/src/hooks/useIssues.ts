import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Issue, InsertIssue } from '@shared/schema';

/**
 * Response type from /api/issues endpoint
 * API returns: { success: true, issues: Issue[] }
 */
interface IssuesResponse {
  success: boolean;
  issues: Issue[];
}

/**
 * Response type from /api/issues/:id endpoint
 * API returns: { success: true, issue: Issue } or { success: false, message: string }
 */
interface IssueResponse {
  success: boolean;
  issue?: Issue;
  message?: string;
}

/**
 * Context type for mutation rollback
 */
interface MutationContext {
  previousIssues?: Issue[];
}

/**
 * Custom hook to fetch all issues (with optional taskId filter)
 *
 * Features:
 * - Auto-refresh every 5 seconds to detect file changes
 * - Error handling
 * - Loading states
 * - Typed with Issue schema from shared/schema
 * - Optional taskId filter for related issues
 *
 * @param taskId - Optional task ID to filter issues by relatedTaskId
 * @returns React Query result with issues data
 */
export function useIssues(taskId?: string) {
  return useQuery<Issue[]>({
    queryKey: taskId ? ['issues', 'task', taskId] : ['issues'],
    queryFn: async () => {
      const url = taskId ? `/api/issues?taskId=${taskId}` : '/api/issues';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.status} ${response.statusText}`);
      }
      const data: IssuesResponse = await response.json();
      return data.issues;
    },
    // Auto-refresh every 5 seconds to detect file system changes
    refetchInterval: 5000,
    // Keep data fresh
    staleTime: 0,
  });
}

/**
 * Custom hook to fetch a specific issue by ID
 *
 * @param issueId - Issue ID (e.g., "issue-1234567890-abc")
 * @returns React Query result with issue data
 */
export function useIssue(issueId: string) {
  return useQuery<Issue | null>({
    queryKey: ['issues', issueId],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issueId}`);

      // Handle 404 - issue not found
      if (response.status === 404) {
        return null;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        throw new Error(`Failed to fetch issue ${issueId}: ${response.status} ${response.statusText}`);
      }

      const data: IssueResponse = await response.json();
      return data.issue || null;
    },
    // Only fetch if issueId is provided
    enabled: !!issueId,
    // Auto-refresh every 5 seconds
    refetchInterval: 5000,
    // Keep data fresh
    staleTime: 0,
  });
}

/**
 * Mutation hook for creating a new issue
 *
 * Features:
 * - Optimistic updates (immediate UI feedback)
 * - Automatic rollback on errors
 * - Cache invalidation and sync with server
 * - Toast notifications for errors
 *
 * @returns React Query mutation for creating issues
 */
export function useCreateIssueMutation() {
  const queryClient = useQueryClient();

  return useMutation<Issue, Error, InsertIssue, MutationContext>({
    mutationFn: async (data: InsertIssue) => {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create issue');
      }

      const result: IssueResponse = await response.json();
      return result.issue!;
    },
    // Optimistic update before server response
    onMutate: async (newIssue) => {
      // Cancel any outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ['issues'] });

      // Snapshot the previous value for rollback
      const previousIssues = queryClient.getQueryData<Issue[]>(['issues']);

      // Optimistically update the cache with new issue
      // Generate temporary ID for optimistic UI
      const optimisticIssue: Issue = {
        id: `temp-${Date.now()}`,
        ...newIssue,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Issue[]>(['issues'], (old = []) => [
        optimisticIssue,
        ...old,
      ]);

      // Return context for potential rollback
      return { previousIssues };
    },
    // Rollback on error
    onError: (error, newIssue, context) => {
      // Restore previous state
      if (context?.previousIssues) {
        queryClient.setQueryData(['issues'], context.previousIssues);
      }

      // Show error toast
      toast.error('Failed to create issue', {
        description: error.message || 'An unexpected error occurred',
      });
    },
    // Always sync with server after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    // Show success toast
    onSuccess: () => {
      toast.success('Issue created successfully');
    },
  });
}

/**
 * Mutation hook for updating an existing issue
 *
 * Features:
 * - Optimistic updates (immediate UI feedback)
 * - Automatic rollback on errors
 * - Cache invalidation and sync with server
 * - Toast notifications for errors
 *
 * @returns React Query mutation for updating issues
 */
export function useUpdateIssueMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Issue,
    Error,
    { id: string; data: Partial<InsertIssue> },
    MutationContext
  >({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertIssue> }) => {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update issue');
      }

      const result: IssueResponse = await response.json();
      return result.issue!;
    },
    // Optimistic update before server response
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['issues'] });
      await queryClient.cancelQueries({ queryKey: ['issues', id] });

      // Snapshot previous state
      const previousIssues = queryClient.getQueryData<Issue[]>(['issues']);

      // Optimistically update the cache
      queryClient.setQueryData<Issue[]>(['issues'], (old = []) =>
        old.map((issue) =>
          issue.id === id
            ? { ...issue, ...data, updatedAt: new Date().toISOString() }
            : issue
        )
      );

      // Also update single issue query if it exists
      queryClient.setQueryData<Issue>(['issues', id], (old) =>
        old ? { ...old, ...data, updatedAt: new Date().toISOString() } : old
      );

      return { previousIssues };
    },
    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(['issues'], context.previousIssues);
      }

      toast.error('Failed to update issue', {
        description: error.message || 'An unexpected error occurred',
      });
    },
    // Sync with server
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', variables.id] });
    },
    // Show success toast
    onSuccess: () => {
      toast.success('Issue updated successfully');
    },
  });
}

/**
 * Mutation hook for deleting an issue
 *
 * Features:
 * - Optimistic updates (immediate UI feedback)
 * - Automatic rollback on errors
 * - Cache invalidation and sync with server
 * - Toast notifications for errors
 *
 * @returns React Query mutation for deleting issues
 */
export function useDeleteIssueMutation() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete issue');
      }

      return id;
    },
    // Optimistic update before server response
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['issues'] });
      await queryClient.cancelQueries({ queryKey: ['issues', id] });

      // Snapshot previous state
      const previousIssues = queryClient.getQueryData<Issue[]>(['issues']);

      // Optimistically remove the issue from cache
      queryClient.setQueryData<Issue[]>(['issues'], (old = []) =>
        old.filter((issue) => issue.id !== id)
      );

      // Remove single issue query
      queryClient.removeQueries({ queryKey: ['issues', id] });

      return { previousIssues };
    },
    // Rollback on error
    onError: (error, id, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(['issues'], context.previousIssues);
      }

      toast.error('Failed to delete issue', {
        description: error.message || 'An unexpected error occurred',
      });
    },
    // Sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    // Show success toast
    onSuccess: () => {
      toast.success('Issue deleted successfully');
    },
  });
}
