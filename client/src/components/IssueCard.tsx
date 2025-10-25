import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Issue } from "@shared/schema";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface IssueCardProps {
  issue: Issue;
  onIssueClick: (issue: Issue) => void;
}

const severityConfig = {
  critical: {
    label: "Critical",
    className: "bg-destructive/20 text-destructive border-destructive/30",
    borderColor: "border-l-destructive",
  },
  high: {
    label: "High",
    className: "bg-status-blocked/20 text-status-blocked border-status-blocked/30",
    borderColor: "border-l-status-blocked",
  },
  medium: {
    label: "Medium",
    className: "bg-status-inProgress/20 text-status-inProgress border-status-inProgress/30",
    borderColor: "border-l-status-inProgress",
  },
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border",
    borderColor: "border-l-muted-foreground",
  },
};

const statusIcons = {
  open: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle,
};

export default function IssueCard({ issue, onIssueClick }: IssueCardProps) {
  const severityInfo = severityConfig[issue.severity];
  const StatusIcon = statusIcons[issue.status];
  
  return (
    <Card 
      className={`p-4 border-l-4 ${severityInfo.borderColor} hover-elevate cursor-pointer`}
      onClick={() => onIssueClick(issue)}
      data-testid={`card-issue-${issue.id}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <code className="px-2 py-1 rounded bg-muted text-xs font-mono font-medium" data-testid={`text-issue-id-${issue.id}`}>
            {issue.id}
          </code>
          <Badge 
            variant="outline" 
            className={`px-2 py-1 rounded-full text-xs uppercase font-semibold tracking-wide ${severityInfo.className}`}
            data-testid={`badge-severity-${issue.id}`}
          >
            {severityInfo.label}
          </Badge>
        </div>
        
        <h4 className="font-medium text-sm" data-testid={`text-issue-title-${issue.id}`}>
          {issue.title}
        </h4>
        
        <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-issue-description-${issue.id}`}>
          {issue.description}
        </p>
        
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            <span className="capitalize">{issue.status.replace("-", " ")}</span>
          </div>
          
          {issue.relatedTaskId && (
            <span className="text-muted-foreground" data-testid={`text-related-task-${issue.id}`}>
              → Task {issue.relatedTaskId}
            </span>
          )}
        </div>
        
        {issue.tags && issue.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {issue.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0" data-testid={`badge-tag-${tag}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
