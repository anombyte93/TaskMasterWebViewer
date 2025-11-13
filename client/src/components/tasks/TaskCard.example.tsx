/**
 * TaskCard Component Usage Example
 *
 * This file demonstrates how to use the TaskCard component
 * with various task states and configurations.
 */

import { TaskCard } from "./TaskCard";
import type { Task } from "@shared/schema";

// Example 1: Simple task without subtasks
const simpleTask: Task = {
  id: "1",
  title: "Implement user authentication",
  description: "Set up JWT-based authentication system with login and registration endpoints",
  status: "in-progress",
  priority: "high",
};

// Example 2: Task with subtasks
const taskWithSubtasks: Task = {
  id: "2",
  title: "Build dashboard layout",
  description: "Create responsive dashboard with sidebar navigation and main content area",
  status: "in-progress",
  priority: "medium",
  subtasks: [
    {
      id: "2.1",
      title: "Create sidebar component",
      description: "Build collapsible sidebar with navigation menu",
      status: "done",
      priority: "high",
    },
    {
      id: "2.2",
      title: "Create main content area",
      description: "Set up responsive grid layout for dashboard content",
      status: "in-progress",
      priority: "medium",
    },
    {
      id: "2.3",
      title: "Add responsive breakpoints",
      description: "Implement mobile-first responsive design",
      status: "pending",
      priority: "low",
    },
  ],
};

// Example 3: Completed task
const completedTask: Task = {
  id: "3",
  title: "Setup project repository",
  description: "Initialize Git repository with proper .gitignore and README",
  status: "done",
  priority: "high",
};

// Example 4: Blocked task
const blockedTask: Task = {
  id: "4",
  title: "Deploy to production",
  description: "Configure production environment and deploy application",
  status: "blocked",
  priority: "high",
};

// Usage Example Component
export function TaskCardExample() {
  return (
    <div className="space-y-4 p-8 max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">TaskCard Examples</h2>

      <section>
        <h3 className="text-lg font-medium mb-3">Simple Task (No Subtasks)</h3>
        <TaskCard task={simpleTask} />
      </section>

      <section>
        <h3 className="text-lg font-medium mb-3">Task with Subtasks (Expandable)</h3>
        <TaskCard
          task={taskWithSubtasks}
          onExpand={() => console.log("Task expanded")}
        />
      </section>

      <section>
        <h3 className="text-lg font-medium mb-3">Completed Task</h3>
        <TaskCard task={completedTask} />
      </section>

      <section>
        <h3 className="text-lg font-medium mb-3">Blocked Task</h3>
        <TaskCard task={blockedTask} />
      </section>

      <section>
        <h3 className="text-lg font-medium mb-3">Custom Styling</h3>
        <TaskCard
          task={simpleTask}
          className="border-blue-500 border-2"
        />
      </section>
    </div>
  );
}

/**
 * Integration with Dashboard
 *
 * Example of rendering a list of tasks:
 *
 * ```tsx
 * import { TaskCard } from "@/components/tasks";
 *
 * function TaskList({ tasks }: { tasks: Task[] }) {
 *   return (
 *     <div className="space-y-4">
 *       {tasks.map((task) => (
 *         <TaskCard
 *           key={task.id}
 *           task={task}
 *           onExpand={() => trackExpansion(task.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
