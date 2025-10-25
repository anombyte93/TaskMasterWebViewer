import TaskCard from "../TaskCard";
import { type Task } from "@shared/schema";

const sampleTask: Task = {
  id: 1,
  title: "Setup Project Structure",
  description: "Create basic project structure with all necessary directories and configuration files",
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
  ],
};

export default function TaskCardExample() {
  return (
    <div className="max-w-3xl">
      <TaskCard 
        task={sampleTask} 
        onViewDetails={(task) => console.log("View details:", task)}
      />
    </div>
  );
}
