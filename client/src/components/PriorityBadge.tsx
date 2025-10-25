import { Badge } from "@/components/ui/badge";
import { type TaskPriority } from "@shared/schema";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig = {
  high: {
    label: "High",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  medium: {
    label: "Medium",
    className: "bg-status-inProgress/20 text-status-inProgress border-status-inProgress/30",
  },
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  return (
    <Badge 
      variant="outline" 
      className={`px-2 py-1 rounded-full text-xs uppercase font-semibold tracking-wide ${config.className}`}
      data-testid={`badge-priority-${priority}`}
    >
      {config.label}
    </Badge>
  );
}
