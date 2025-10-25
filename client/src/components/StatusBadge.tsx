import { Badge } from "@/components/ui/badge";
import { type TaskStatus } from "@shared/schema";

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-status-pending/20 text-status-pending border-status-pending/30",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-status-inProgress/20 text-status-inProgress border-status-inProgress/30",
  },
  done: {
    label: "Done",
    className: "bg-status-done/20 text-status-done border-status-done/30",
  },
  blocked: {
    label: "Blocked",
    className: "bg-status-blocked/20 text-status-blocked border-status-blocked/30",
  },
  deferred: {
    label: "Deferred",
    className: "bg-status-deferred/20 text-status-deferred border-status-deferred/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={`px-3 py-1 rounded-full text-xs uppercase font-semibold tracking-wide ${config.className}`}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
