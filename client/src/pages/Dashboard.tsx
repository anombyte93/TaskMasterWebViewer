import React, { useState, useEffect, lazy, Suspense } from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { IssueTracker } from '@/components/issues/IssueTracker';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterBar } from '@/components/shared/FilterBar';
import { ModalLoadingFallback } from '@/components/shared/LoadingFallback';
import { useTasks } from '@/hooks/useTasks';
import { useIssues, useCreateIssueMutation } from '@/hooks/useIssues';
import { useTaskSearchAndFilter, useIssueSearchAndFilter } from '@/hooks/useFilter';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import type { Issue, InsertIssue } from '@shared/schema';
import type { TaskFilters, IssueFilters } from '@/hooks/useFilter';

// Lazy load modal components (loaded only when opened)
const IssueForm = lazy(() => import('@/components/issues/IssueForm'));
const IssueDetail = lazy(() => import('@/components/issues/IssueDetail'));

/**
 * Dashboard Page
 *
 * Main application view that displays:
 * - Left column (70%): TaskList with all TaskMaster tasks
 * - Right column (30%): IssueTracker with all issues
 *
 * Features:
 * - Auto-refreshing task and issue data (every 5 seconds)
 * - Search across tasks and issues (title, description, tags)
 * - Multi-select filters (status, priority, severity)
 * - Create new issues via modal form
 * - View issue details in modal
 * - Edit and delete issues
 * - Issue-task linking via relatedTaskId
 * - Loading states via component skeletons
 * - Error states with user-friendly messages
 * - Responsive layout via MainLayout
 * - Collapsible sidebar on tablet (768-1023px) with state persistence
 */
export default function Dashboard() {
  const queryClient = useQueryClient();

  // Fetch tasks and issues with React Query (auto-refresh every 5s)
  const { data: allTasks, isLoading: isLoadingTasks, error: tasksError } = useTasks();
  const { data: allIssues, isLoading: isLoadingIssues } = useIssues();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({});
  const [issueFilters, setIssueFilters] = useState<IssueFilters>({});

  // Sidebar state (for tablet collapsible behavior)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pull-to-refresh hook for mobile devices
  const { pullDistance, isRefreshing, containerRef } = usePullToRefresh({
    onRefresh: async () => {
      // Refetch both tasks and issues
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['issues'] }),
      ]);
    },
    threshold: 100,
    resistance: 2.5,
    maxPullDistance: 150,
  });

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('tablet-sidebar-open');
    if (savedState !== null) {
      setIsSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tablet-sidebar-open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Apply search and filters
  const tasks = useTaskSearchAndFilter(allTasks || [], searchQuery, taskFilters);
  const issues = useIssueSearchAndFilter(allIssues || [], searchQuery, issueFilters);

  // Modal state management
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Mutation hooks
  const createIssueMutation = useCreateIssueMutation();

  // Sidebar toggle handler
  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Handle create issue form submission
  const handleCreateIssue = async (data: InsertIssue) => {
    try {
      await createIssueMutation.mutateAsync(data);
      setShowIssueForm(false);
    } catch (error) {
      console.error('Failed to create issue:', error);
      // Error is already handled by the mutation hook
    }
  };

  // Handle issue click - open detail modal
  const handleIssueClick = (issueId: string) => {
    const issue = issues?.find((i) => i.id === issueId);
    if (issue) {
      setSelectedIssue(issue);
    }
  };

  // Error state - show error message
  if (tasksError) {
    return (
      <MainLayout
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-md text-center">
            <div className="mb-4 w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Failed to load tasks</h2>
            <p className="text-muted-foreground mb-4">
              {tasksError instanceof Error ? tasksError.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Main content with TaskList and IssueTracker
  return (
    <MainLayout
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={handleToggleSidebar}
      sidebarContent={
        <>
          {/* Issue Filters */}
          <div className="mb-4 space-y-3">
            <FilterBar
              filters={issueFilters}
              onChange={setIssueFilters}
              showSeverity={true}
            />
          </div>

          {/* Issue Tracker */}
          <IssueTracker
            issues={issues}
            isLoading={isLoadingIssues}
            onCreateIssue={() => setShowIssueForm(true)}
            onIssueClick={handleIssueClick}
          />
        </>
      }
    >
      {/* Main content container with pull-to-refresh */}
      <div ref={containerRef} className="relative scroll-container">
        {/* Pull-to-refresh indicator */}
        <div
          className={`pull-to-refresh-indicator ${pullDistance === 0 && !isRefreshing ? 'hidden' : ''}`}
          style={{
            transform: `translateX(-50%) translateY(${Math.min(pullDistance, 60)}px)`,
            opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
          }}
        >
          <div className="bg-background border border-border rounded-full p-3 shadow-md">
            <Loader2
              className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3.6}deg)`,
              }}
            />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tasks and issues..."
          className="w-full"
        />

        {/* Task Filters */}
        <FilterBar
          filters={taskFilters}
          onChange={setTaskFilters}
          showSeverity={false}
        />
      </div>

        {/* TaskList handles its own loading state with skeleton */}
        <TaskList tasks={tasks} isLoading={isLoadingTasks} />
      </div>

      {/* Create Issue Modal */}
      {showIssueForm && (
        <Dialog.Root open={showIssueForm} onOpenChange={setShowIssueForm}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 md:backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[90vh] overflow-y-auto p-6 md:p-8">
              <div className="mb-6">
                <Dialog.Title className="text-2xl font-semibold">
                  Create New Issue
                </Dialog.Title>
              </div>
              <Suspense fallback={<ModalLoadingFallback />}>
                <IssueForm
                  onSubmit={handleCreateIssue}
                  onCancel={() => setShowIssueForm(false)}
                  isSubmitting={createIssueMutation.isPending}
                />
              </Suspense>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <IssueDetail
            issue={selectedIssue}
            open={!!selectedIssue}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedIssue(null);
              }
            }}
          />
        </Suspense>
      )}
    </MainLayout>
  );
}
