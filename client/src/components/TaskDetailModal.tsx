import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Task } from "@shared/schema";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { GitBranch } from "lucide-react";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-task-details">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <code className="px-2 py-1 rounded bg-muted text-sm font-mono font-medium">
              {task.id}
            </code>
            <span>{task.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Status & Priority</h4>
            <div className="flex gap-2">
              <StatusBadge status={task.status} />
              {task.priority && <PriorityBadge priority={task.priority} />}
            </div>
          </div>
          
          {task.description && (
            <div>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{task.description}</p>
            </div>
          )}
          
          {task.dependencies && task.dependencies.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Dependencies</h4>
              <div className="flex items-center gap-2 text-sm">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span>{task.dependencies.join(", ")}</span>
              </div>
            </div>
          )}
          
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Subtasks ({task.subtasks.length})
              </h4>
              <div className="space-y-2">
                {task.subtasks.map((subtask: Task) => (
                  <div key={subtask.id} className="flex items-center gap-2 text-sm border-l-2 border-border pl-4 py-2">
                    <code className="px-2 py-1 rounded bg-muted text-xs font-mono">
                      {subtask.id}
                    </code>
                    <span className="flex-1">{subtask.title}</span>
                    <StatusBadge status={subtask.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
