import React, { useState } from "react";
import { TaskDetail } from "./TaskDetail";
import type { Task } from "@shared/schema";

/**
 * Example usage of TaskDetail component
 *
 * This file demonstrates how to use the TaskDetail modal component
 * with sample task data including nested subtasks.
 */
export function TaskDetailExample() {
  const [open, setOpen] = useState(false);

  // Sample task with nested subtasks
  const sampleTask: Task = {
    id: "3",
    title: "Implement User Interface Components",
    description:
      "Build the core UI components for the TaskMaster web dashboard including task cards, lists, and detail views. Follow Tokyo Night theme and responsive design guidelines.",
    status: "in-progress",
    priority: "high",
    dependencies: ["1", "2"],
    subtasks: [
      {
        id: "3.1",
        title: "Create base components",
        description: "StatusBadge, PriorityBadge, ProgressBar",
        status: "done",
        priority: "high",
      },
      {
        id: "3.2",
        title: "Build TaskCard component",
        description:
          "Main card component with expand/collapse for subtasks",
        status: "done",
        priority: "high",
      },
      {
        id: "3.3",
        title: "Develop TaskList component",
        description: "List container with filtering and sorting",
        status: "in-progress",
        priority: "high",
        subtasks: [
          {
            id: "3.3.1",
            title: "Implement basic list rendering",
            description: "Render array of tasks",
            status: "done",
          },
          {
            id: "3.3.2",
            title: "Add filter functionality",
            description: "Filter by status, priority",
            status: "in-progress",
          },
        ],
      },
      {
        id: "3.4",
        title: "Create TaskDetail modal",
        description: "Full task information modal with subtask tree",
        status: "done",
        priority: "medium",
      },
    ],
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">TaskDetail Component Example</h1>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Open Task Detail Modal
      </button>

      {/* TaskDetail modal */}
      <TaskDetail task={sampleTask} open={open} onOpenChange={setOpen} />

      {/* Usage instructions */}
      <div className="mt-8 space-y-4 text-sm">
        <h2 className="text-lg font-semibold">Usage:</h2>
        <pre className="bg-muted p-4 rounded overflow-x-auto">
          {`import { TaskDetail } from "@/components/tasks";
import { useState } from "react";

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      <button onClick={() => {
        setSelectedTask(myTask);
        setOpen(true);
      }}>
        View Details
      </button>

      <TaskDetail
        task={selectedTask}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}`}
        </pre>

        <h3 className="font-semibold">Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Full task metadata display (ID, title, description, status, priority)</li>
          <li>Dependency list with task IDs</li>
          <li>Recursive subtask tree with indentation</li>
          <li>Progress bar for parent tasks</li>
          <li>Accessible modal using Radix Dialog</li>
          <li>Tokyo Night theme colors</li>
          <li>Responsive design (mobile-friendly)</li>
          <li>Keyboard navigation (Esc to close)</li>
          <li>Smooth animations</li>
        </ul>

        <h3 className="font-semibold">Props:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">task</code> - Task object or null
          </li>
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">open</code> - Boolean to control modal visibility
          </li>
          <li>
            <code className="bg-muted px-1 py-0.5 rounded">onOpenChange</code> - Callback when modal open state changes
          </li>
        </ul>
      </div>
    </div>
  );
}
