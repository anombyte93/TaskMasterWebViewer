import React from "react";
import { TaskList } from "./TaskList";
import type { Task } from "@shared/schema";

/**
 * TaskList Example Usage
 *
 * Demonstrates the three states of TaskList:
 * 1. Loading state (skeleton placeholders)
 * 2. Empty state (no tasks message)
 * 3. Normal state (displaying tasks)
 */

// Example task data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Setup Project Infrastructure",
    description: "Initialize the project with necessary dependencies and configuration files",
    status: "done",
    priority: "high",
    dependencies: [],
    subtasks: [
      {
        id: "1.1",
        title: "Initialize Git repository",
        description: "Setup version control with initial commit",
        status: "done",
        priority: "high",
      },
      {
        id: "1.2",
        title: "Configure package.json",
        description: "Add necessary dependencies and scripts",
        status: "done",
        priority: "medium",
      },
    ],
  },
  {
    id: "2",
    title: "Implement Authentication System",
    description: "Build user authentication with JWT tokens and secure password hashing",
    status: "in-progress",
    priority: "high",
    dependencies: ["1"],
    subtasks: [
      {
        id: "2.1",
        title: "Create user model",
        description: "Define database schema for users",
        status: "done",
        priority: "high",
      },
      {
        id: "2.2",
        title: "Implement login endpoint",
        description: "Create API route for user authentication",
        status: "in-progress",
        priority: "high",
      },
      {
        id: "2.3",
        title: "Add JWT middleware",
        description: "Protect routes with JWT verification",
        status: "pending",
        priority: "medium",
      },
    ],
  },
  {
    id: "3",
    title: "Build Dashboard UI",
    description: "Create the main dashboard interface for viewing and managing tasks",
    status: "pending",
    priority: "medium",
    dependencies: ["2"],
  },
];

// Example 1: Loading state
export function TaskListLoadingExample() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Loading State</h2>
      <TaskList tasks={[]} isLoading={true} />
    </div>
  );
}

// Example 2: Empty state
export function TaskListEmptyExample() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Empty State</h2>
      <TaskList tasks={[]} isLoading={false} />
    </div>
  );
}

// Example 3: Normal state with tasks
export function TaskListNormalExample() {
  const handleTaskClick = (taskId: string) => {
    console.log("Task clicked:", taskId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Task List</h2>
      <TaskList tasks={mockTasks} onTaskClick={handleTaskClick} />
    </div>
  );
}

// Example 4: All three states side by side (for development)
export function TaskListComparisonExample() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted">
          <h3 className="font-semibold">Loading State</h3>
        </div>
        <TaskList tasks={[]} isLoading={true} className="p-4" />
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted">
          <h3 className="font-semibold">Empty State</h3>
        </div>
        <TaskList tasks={[]} isLoading={false} className="p-4" />
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted">
          <h3 className="font-semibold">With Tasks</h3>
        </div>
        <TaskList tasks={mockTasks.slice(0, 1)} className="p-4" />
      </div>
    </div>
  );
}

// Example 5: Filtered task list (simulating search/filter)
export function TaskListFilteredExample() {
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const filteredTasks = statusFilter
    ? mockTasks.filter((task) => task.status === statusFilter)
    : mockTasks;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Filtered Task List</h2>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-4 py-2 rounded-lg border ${
            statusFilter === null
              ? "bg-primary text-primary-foreground"
              : "bg-background"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "pending"
              ? "bg-primary text-primary-foreground"
              : "bg-background"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter("in-progress")}
          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "in-progress"
              ? "bg-primary text-primary-foreground"
              : "bg-background"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setStatusFilter("done")}
          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "done"
              ? "bg-primary text-primary-foreground"
              : "bg-background"
          }`}
        >
          Done
        </button>
      </div>

      <TaskList tasks={filteredTasks} />
    </div>
  );
}

// Example 6: Integration with data fetching (typical usage pattern)
export function TaskListDataFetchingExample() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // In real usage, this would be an actual API call:
        // const response = await fetch('/api/tasks');
        // const data = await response.json();
        // setTasks(data);

        // Simulating 1 second delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTasks(mockTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        Data Fetching Example (Real-world Usage)
      </h2>
      <TaskList tasks={tasks} isLoading={isLoading} />
    </div>
  );
}
