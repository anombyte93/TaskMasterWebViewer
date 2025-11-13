import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@shared/schema";
import StatusBadge from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { ProgressBar } from "./ProgressBar";

interface TaskDetailProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * TaskDetail - Modal component for displaying full task information
 *
 * Features:
 * - Full task metadata display (id, title, description, status, priority)
 * - Dependency list with task IDs
 * - Recursive subtask tree with indentation
 * - Progress calculation for parent tasks
 * - Radix Dialog for accessible modal
 * - Tokyo Night theme colors
 * - Responsive design
 *
 * Design:
 * - Centered modal overlay with backdrop blur
 * - max-w-4xl content area
 * - Hierarchical layout with clear sections
 * - Monospace font for task IDs
 * - Smooth animations
 */
export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
  if (!task) return null;

  // Calculate subtask progress
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const progress = hasSubtasks
    ? {
        completed: task.subtasks!.filter((st) => st.status === "done").length,
        total: task.subtasks!.length,
      }
    : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />

        {/* Modal content */}
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%]",
            "bg-background border rounded-lg shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "max-h-[90vh] overflow-y-auto",
            "p-6 md:p-8"
          )}
          aria-describedby="task-description"
        >
          {/* Header: Task ID + Title */}
          <div className="pb-6 border-b mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Task ID badge */}
                <div className="mb-3">
                  <span className="inline-block font-mono text-sm px-3 py-1.5 rounded bg-muted font-semibold">
                    Task {task.id}
                  </span>
                </div>

                {/* Task title */}
                <Dialog.Title className="text-2xl font-semibold leading-tight">
                  {task.title}
                </Dialog.Title>
              </div>

              {/* Close button */}
              <Dialog.Close
                className={cn(
                  "rounded-sm opacity-70 ring-offset-background transition-opacity",
                  "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                  "p-2"
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Status and Priority row */}
            <div className="flex gap-3 items-center mt-4">
              <StatusBadge status={task.status} />
              {task.priority && <PriorityBadge priority={task.priority} />}
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-6">
            {/* Description section */}
            <section>
              <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                Description
              </h3>
              <p id="task-description" className="text-sm leading-relaxed">
                {task.description}
              </p>
            </section>

            {/* Metadata grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                    Dependencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.dependencies.map((depId) => (
                      <span
                        key={depId}
                        className="inline-block font-mono text-xs px-2 py-1 rounded bg-muted border"
                      >
                        {depId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtask count and progress */}
              {hasSubtasks && progress && (
                <div>
                  <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                    Progress
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {progress.completed} of {progress.total} subtasks completed
                    </div>
                    <ProgressBar
                      completed={progress.completed}
                      total={progress.total}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Subtask tree */}
            {hasSubtasks && (
              <section>
                <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
                  Subtasks
                </h3>
                <SubtaskTree subtasks={task.subtasks!} level={0} />
              </section>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * SubtaskTree - Recursive component for displaying nested subtasks
 *
 * Features:
 * - Recursive rendering for nested subtasks
 * - Indentation based on nesting level
 * - Status and priority badges
 * - Connecting lines for hierarchy visualization
 *
 * @param subtasks - Array of subtasks to render
 * @param level - Nesting level (0 = first level)
 */
interface SubtaskTreeProps {
  subtasks: Task[];
  level: number;
}

function SubtaskTree({ subtasks, level }: SubtaskTreeProps) {
  // Calculate indentation (8 units per level: pl-8, pl-16, pl-24)
  const indentClass = level > 0 ? `pl-${level * 8}` : "";

  return (
    <div className={cn("space-y-3", level > 0 && "mt-3")}>
      {subtasks.map((subtask) => {
        const hasNestedSubtasks = subtask.subtasks && subtask.subtasks.length > 0;

        return (
          <div
            key={subtask.id}
            className={cn(
              "border-l-2 border-muted pl-4",
              level > 0 && indentClass
            )}
          >
            {/* Subtask card */}
            <div className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              {/* Subtask header */}
              <div className="flex items-start gap-2 mb-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {/* Subtask ID */}
                  <span className="inline-block font-mono text-xs px-2 py-0.5 rounded bg-background mb-1">
                    {subtask.id}
                  </span>

                  {/* Subtask title */}
                  <h4 className="font-medium text-sm leading-snug">
                    {subtask.title}
                  </h4>
                </div>
              </div>

              {/* Subtask description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-2 pl-6">
                {subtask.description}
              </p>

              {/* Subtask metadata */}
              <div className="flex gap-2 items-center flex-wrap pl-6">
                <StatusBadge
                  status={subtask.status}
                  className="text-[0.65rem] px-2 py-0.5"
                />
                {subtask.priority && (
                  <PriorityBadge
                    priority={subtask.priority}
                    className="text-[0.65rem] px-1.5 py-0.5"
                  />
                )}
              </div>
            </div>

            {/* Recursive rendering for nested subtasks */}
            {hasNestedSubtasks && (
              <SubtaskTree subtasks={subtask.subtasks!} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TaskDetail;
