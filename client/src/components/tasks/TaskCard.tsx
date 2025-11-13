import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";
import type { Task } from "@shared/schema";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

// Import badges (built by other agents)
import StatusBadge from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { ProgressBar } from "./ProgressBar";

interface TaskCardProps {
  task: Task;
  onExpand?: () => void;
  className?: string;
}

/**
 * TaskCard - Main task card component with expand/collapse for subtasks
 *
 * Features:
 * - Display task ID, title, description
 * - Show status, priority, progress
 * - Expandable subtasks section with smooth animation
 * - Hover effects for better UX
 * - Responsive design following design_guidelines.md
 *
 * Design:
 * - Full-width card with border and rounded corners
 * - Left: Status indicator (colored vertical bar)
 * - Center: Task content (flex-1)
 * - Right: Expand chevron (if has subtasks)
 */
export function TaskCard({ task, onExpand, className }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const haptic = useHapticFeedback();

  // Calculate progress if subtasks exist
  const progress = task.subtasks?.length
    ? {
        completed: task.subtasks.filter((st) => st.status === "done").length,
        total: task.subtasks.length,
      }
    : null;

  const progressPercent = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  // Status color mapping for left indicator bar
  const statusColors: Record<string, string> = {
    pending: "bg-gray-400",
    "in-progress": "bg-blue-500",
    done: "bg-green-500",
    blocked: "bg-red-500",
    deferred: "bg-yellow-500",
    cancelled: "bg-gray-500",
  };

  const statusColor = statusColors[task.status] || "bg-gray-400";

  const handleToggle = () => {
    haptic.tap(); // Haptic feedback on toggle
    setIsOpen(!isOpen);
    onExpand?.();
  };

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Main Card */}
      <div
        className={cn(
          "w-full border rounded-lg p-4 bg-background task-card",
          "hover:shadow-md transition-shadow duration-100",
          className
        )}
      >
        {/* Card Layout: Left indicator | Center content | Right chevron */}
        <div className="flex gap-4">
          {/* Left: Status indicator bar */}
          <div className={cn("w-1 h-full rounded-full flex-shrink-0", statusColor)} />

          {/* Center: Task content */}
          <div className="flex-1 min-w-0">
            {/* Task ID badge */}
            <div className="mb-2">
              <span className="inline-block font-mono text-xs px-2 py-1 rounded bg-muted">
                {task.id}
              </span>
            </div>

            {/* Task title */}
            <h3 className="font-medium mb-2 text-base">{task.title}</h3>

            {/* Task description (truncated to 2 lines) */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {task.description}
            </p>

            {/* Metadata row: Status, Priority, Subtask count */}
            <div className="flex gap-4 items-center text-xs flex-wrap">
              <StatusBadge status={task.status} />
              {task.priority && <PriorityBadge priority={task.priority} />}
              {hasSubtasks && (
                <span className="text-muted-foreground">
                  {progress?.completed}/{progress?.total} subtasks
                </span>
              )}
            </div>

            {/* Progress bar (if has subtasks) */}
            {hasSubtasks && progress && (
              <div className="mt-3">
                <ProgressBar
                  completed={progress.completed}
                  total={progress.total}
                />
              </div>
            )}
          </div>

          {/* Right: Expand chevron (if has subtasks) - 44px touch target */}
          {hasSubtasks && (
            <button
              onClick={handleToggle}
              className="flex-shrink-0 p-2 h-11 w-11 rounded hover:bg-muted transition-colors flex items-center justify-center"
              aria-label={isOpen ? "Collapse subtasks" : "Expand subtasks"}
            >
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Subtasks Section */}
      {hasSubtasks && (
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mt-4 space-y-2 border-l-2 border-muted pl-8">
            {task.subtasks?.map((subtask) => (
              <div
                key={subtask.id}
                className="p-3 border rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                {/* Subtask ID badge */}
                <div className="mb-1">
                  <span className="inline-block font-mono text-xs px-2 py-0.5 rounded bg-background">
                    {subtask.id}
                  </span>
                </div>

                {/* Subtask title */}
                <h4 className="font-medium text-sm mb-1">{subtask.title}</h4>

                {/* Subtask description */}
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {subtask.description}
                </p>

                {/* Subtask metadata */}
                <div className="flex gap-3 items-center">
                  <StatusBadge status={subtask.status} className="text-[0.65rem] px-2 py-0.5" />
                  {subtask.priority && (
                    <PriorityBadge priority={subtask.priority} className="text-[0.65rem] px-1.5 py-0.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Collapsible.Content>
      )}
    </Collapsible.Root>
  );
}
