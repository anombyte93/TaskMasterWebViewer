import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import IssueCard from "@/components/IssueCard";
import IssueForm from "@/components/IssueForm";
import TaskDetailModal from "@/components/TaskDetailModal";
import SearchFilter from "@/components/SearchFilter";
import ThemeToggle from "@/components/ThemeToggle";
import AgentChatBox from "@/components/AgentChatBox";
import { type Task, type Issue, type InsertIssue, type TaskStatus, type TaskPriority } from "@shared/schema";

//todo: remove mock functionality
const mockTasks: Task[] = [
  {
    id: 1,
    title: "Setup Project Structure",
    description: "Create basic project structure with all necessary directories and configuration files",
    status: "in-progress",
    priority: "high",
    dependencies: [],
    subtasks: [
      {
        id: "1.1",
        title: "Create Main Directory",
        description: "Initialize the main project directory",
        status: "done",
        priority: "high",
        dependencies: [],
      },
      {
        id: "1.2",
        title: "Setup Configuration",
        description: "Add configuration files for build and deployment",
        status: "done",
        priority: "medium",
        dependencies: [],
      },
      {
        id: "1.3",
        title: "Install Dependencies",
        description: "Install all required packages and libraries",
        status: "in-progress",
        priority: "medium",
        dependencies: [],
      },
    ],
  },
  {
    id: 2,
    title: "Implement Authentication",
    description: "Add user authentication system with login and registration",
    status: "pending",
    priority: "high",
    dependencies: [1],
    subtasks: [
      {
        id: "2.1",
        title: "Create User Model",
        description: "Define user database schema",
        status: "pending",
        dependencies: [],
      },
      {
        id: "2.2",
        title: "Setup JWT",
        description: "Configure JWT token generation",
        status: "pending",
        dependencies: [],
      },
    ],
  },
  {
    id: 3,
    title: "Build API Endpoints",
    description: "Create RESTful API endpoints for task and issue management",
    status: "done",
    priority: "medium",
    dependencies: [1],
  },
  {
    id: 4,
    title: "Design UI Components",
    description: "Create reusable UI components with Tailwind CSS",
    status: "blocked",
    priority: "high",
    dependencies: [3],
  },
];

//todo: remove mock functionality
const mockIssues: Issue[] = [
  {
    id: "issue-001",
    title: "API endpoint returning 500 error",
    description: "The /api/tasks endpoint fails when querying with invalid parameters. Need to add proper validation.",
    severity: "critical",
    status: "open",
    relatedTaskId: "3",
    tags: ["api", "bug"],
    createdAt: "2025-10-25T10:30:00Z",
    updatedAt: "2025-10-25T10:30:00Z",
  },
  {
    id: "issue-002",
    title: "Update documentation",
    description: "Need to document the new authentication flow and API endpoints",
    severity: "low",
    status: "in-progress",
    relatedTaskId: "2",
    tags: ["docs"],
    createdAt: "2025-10-24T14:20:00Z",
    updatedAt: "2025-10-25T09:15:00Z",
  },
  {
    id: "issue-003",
    title: "Performance bottleneck in task rendering",
    description: "Large task lists cause UI lag. Consider implementing virtualization.",
    severity: "medium",
    status: "open",
    tags: ["performance", "ui"],
    createdAt: "2025-10-23T16:45:00Z",
    updatedAt: "2025-10-23T16:45:00Z",
  },
];

export default function Dashboard() {
  const [tasks] = useState<Task[]>(mockTasks);
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  const handleRefresh = () => {
    console.log("Refreshing data...");
    //todo: remove mock functionality - replace with actual API call
  };

  const handleCreateIssue = (newIssue: InsertIssue) => {
    const issue: Issue = {
      ...newIssue,
      id: `issue-${String(issues.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIssues([issue, ...issues]);
    console.log("Created issue:", issue);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const filterTasks = (taskList: Task[]): Task[] => {
    return taskList.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(task.id).includes(searchQuery);
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const filteredTasks = filterTasks(tasks);
  const taskIds = tasks.flatMap(task => {
    const ids = [String(task.id)];
    if (task.subtasks) {
      ids.push(...task.subtasks.map((st: Task) => String(st.id)));
    }
    return ids;
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between gap-4 p-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-primary" data-testid="text-app-title">
              TaskMaster
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-screen-2xl mx-auto flex flex-col gap-4 p-4 md:p-6">
          <AgentChatBox />
          
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          <div className="flex flex-col gap-6 overflow-hidden">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                onClearFilters={handleClearFilters}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No tasks found matching your filters
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onViewDetails={setSelectedTask}
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Issues
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({issues.length})
                </span>
              </h2>
            </div>

            <IssueForm onSubmit={handleCreateIssue} taskIds={taskIds} />

            <div className="flex-1 overflow-y-auto space-y-4">
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onIssueClick={(issue) => console.log("Issue clicked:", issue)}
                />
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
