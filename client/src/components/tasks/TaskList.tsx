import React from "react";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import type { Task } from "@shared/schema";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * TaskList - Main list container for displaying tasks
 *
 * Features:
 * - Displays array of tasks using TaskCard component
 * - Handles loading state with skeleton placeholders
 * - Handles empty state with friendly message
 * - Responsive spacing (space-y-4 between cards)
 * - Container padding (p-6)
 * - Performance: Simple map() for MVP (virtual scrolling can be added later)
 *
 * Design follows design_guidelines.md:
 * - Spacing between cards: space-y-4
 * - Container padding: p-6
 * - Task hierarchy with proper indentation handled by TaskCard
 */
export function TaskList({
  tasks,
  onTaskClick,
  isLoading = false,
  className,
}: TaskListProps) {
  // Loading state - show skeleton placeholders
  if (isLoading) {
    return (
      <div className={cn("p-6 space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <TaskCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state - no tasks to display
  if (tasks.length === 0) {
    return (
      <div className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            There are no tasks to display. Tasks will appear here once they are created.
          </p>
        </div>
      </div>
    );
  }

  // Task list - display all tasks
  return (
    <div className={cn("p-6 space-y-4", className)}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onExpand={() => {
            // Optional: Handle expand callback if needed
            // For now, TaskCard handles its own expand/collapse state
          }}
        />
      ))}
    </div>
  );
}

/**
 * TaskCardSkeleton - Loading placeholder for task cards
 *
 * Mimics the structure of TaskCard for smooth loading experience
 */
function TaskCardSkeleton() {
  return (
    <div className="w-full border rounded-lg p-4 bg-background animate-pulse">
      <div className="flex gap-4">
        {/* Status indicator placeholder */}
        <div className="w-1 h-24 rounded-full bg-muted flex-shrink-0" />

        {/* Content placeholder */}
        <div className="flex-1 min-w-0">
          {/* Task ID badge placeholder */}
          <div className="mb-2">
            <div className="inline-block w-16 h-5 rounded bg-muted" />
          </div>

          {/* Title placeholder */}
          <div className="mb-2 h-6 w-3/4 rounded bg-muted" />

          {/* Description placeholder (2 lines) */}
          <div className="mb-3 space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>

          {/* Metadata row placeholder */}
          <div className="flex gap-4 items-center">
            <div className="w-16 h-5 rounded-full bg-muted" />
            <div className="w-16 h-5 rounded-full bg-muted" />
            <div className="w-20 h-4 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
