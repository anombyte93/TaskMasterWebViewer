import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, GitBranch } from "lucide-react";
import { type Task } from "@shared/schema";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import ProgressBar from "./ProgressBar";

interface TaskCardProps {
  task: Task;
  level?: number;
  onViewDetails: (task: Task) => void;
}

export default function TaskCard({ task, level = 0, onViewDetails }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  
  const completedSubtasks = task.subtasks?.filter((st: Task) => st.status === "done").length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleCardClick = () => {
    if (hasSubtasks) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <Card 
        className={`p-4 hover-elevate cursor-pointer ${level > 0 ? 'ml-8' : ''}`}
        onClick={handleCardClick}
        data-testid={`card-task-${task.id}`}
      >
        <div className="flex gap-4">
          <div 
            className={`w-1 h-full rounded-full ${
              task.status === 'done' ? 'bg-status-done' :
              task.status === 'in-progress' ? 'bg-status-inProgress' :
              task.status === 'blocked' ? 'bg-status-blocked' :
              'bg-status-pending'
            }`}
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="px-2 py-1 rounded bg-muted text-xs font-mono font-medium" data-testid={`text-task-id-${task.id}`}>
                  {task.id}
                </code>
                <h3 className="font-medium" data-testid={`text-task-title-${task.id}`}>{task.title}</h3>
                {hasSubtasks && (
                  <ChevronRight className={`h-4 w-4 transition-transform text-muted-foreground ${isExpanded ? 'rotate-90' : ''}`} />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(task);
                  }}
                  data-testid={`button-view-${task.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`text-description-${task.id}`}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 flex-wrap text-xs">
              <StatusBadge status={task.status} />
              {task.priority && <PriorityBadge priority={task.priority} />}
              
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground" data-testid={`text-dependencies-${task.id}`}>
                  <GitBranch className="h-3 w-3" />
                  <span>{task.dependencies.length} dependencies</span>
                </div>
              )}
              
              {hasSubtasks && (
                <span className="text-muted-foreground" data-testid={`text-subtasks-${task.id}`}>
                  {totalSubtasks} subtask{totalSubtasks !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {hasSubtasks && (
              <div className="mt-4">
                <ProgressBar completed={completedSubtasks} total={totalSubtasks} />
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {isExpanded && hasSubtasks && (
        <div className="mt-2 space-y-2 border-l-2 border-border ml-4">
          {task.subtasks!.map((subtask: Task) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
