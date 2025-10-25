import { useState } from "react";
import TaskDetailModal from "../TaskDetailModal";
import { Button } from "@/components/ui/button";
import { type Task } from "@shared/schema";

const sampleTask: Task = {
  id: 1,
  title: "Setup Project Structure",
  description: "Create basic project structure with all necessary directories and configuration files. This includes setting up the build system, dependency management, and initial project scaffolding.",
  status: "in-progress",
  priority: "high",
  dependencies: [2, 3],
  subtasks: [
    {
      id: "1.1",
      title: "Create Main Directory",
      description: "Initialize the main project directory",
      status: "done",
      dependencies: [],
    },
    {
      id: "1.2",
      title: "Setup Configuration",
      description: "Add configuration files",
      status: "in-progress",
      dependencies: [],
    },
    {
      id: "1.3",
      title: "Install Dependencies",
      description: "Install all required packages",
      status: "pending",
      dependencies: [],
    },
  ],
};

export default function TaskDetailModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)} data-testid="button-open-modal">
        Open Task Details
      </Button>
      <TaskDetailModal task={sampleTask} open={open} onOpenChange={setOpen} />
    </div>
  );
}
