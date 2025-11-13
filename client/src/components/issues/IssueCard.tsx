import React from "react";
import { ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Issue } from "@shared/schema";
import SeverityBadge from "./SeverityBadge";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface IssueCardProps {
  issue: Issue;
  onClick?: (issueId: string) => void;
  className?: string;
}

/**
 * IssueCard - Individual issue card component for sidebar display
 *
 * Features:
 * - Display issue metadata: id, title, severity, status, relatedTaskId
 * - Use SeverityBadge component for consistent severity display
 * - Compact design optimized for sidebar layout
 * - Click handler for opening issue detail modal
 * - Severity indicator as colored left border
 * - Tokyo Night theme styling
 *
 * Design:
 * - Compact card with border and rounded corners
 * - Left: Colored border indicating severity level
 * - Content: Issue ID, title (max 2 lines), status/severity badges, related task link
 * - Footer: Relative timestamp (e.g., "2 hours ago")
 */
export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  className,
}) => {
  const haptic = useHapticFeedback();

  // Severity border colors (left border indicator)
  const severityBorderColors = {
    critical: "border-l-red-500",
    high: "border-l-orange-500",
    medium: "border-l-yellow-500",
    low: "border-l-blue-500",
  };

  // Status badge colors (inline badge similar to StatusBadge pattern)
  const statusColors = {
    open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "in-progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  // Format timestamp as relative time
  const relativeTime = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  const handleClick = () => {
    haptic.tap(); // Haptic feedback on card tap
    onClick?.(issue.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "border border-border rounded-lg p-4 bg-background issue-card",
        "hover:shadow-md transition-shadow cursor-pointer",
        "border-l-4", // Thicker left border for severity indicator
        severityBorderColors[issue.severity],
        className
      )}
    >
      {/* Issue ID (monospace, muted) */}
      <div className="mb-2">
        <span className="font-mono text-xs text-muted-foreground">
          {issue.id}
        </span>
      </div>

      {/* Issue title (line-clamp-2 for max 2 lines) */}
      <h4 className="font-medium text-sm mb-3 line-clamp-2 text-foreground">
        {issue.title}
      </h4>

      {/* Status and Severity badges */}
      <div className="flex gap-2 items-center mb-3 flex-wrap">
        {/* Status badge */}
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full border uppercase tracking-wide",
            statusColors[issue.status]
          )}
        >
          {issue.status}
        </span>

        {/* Severity badge */}
        <SeverityBadge severity={issue.severity} className="text-[0.65rem] px-2 py-0.5" />
      </div>

      {/* Related task link (if exists) */}
      {issue.relatedTaskId && (
        <div className="mb-2">
          <a
            href={`#task-${issue.relatedTaskId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <span>Task {issue.relatedTaskId}</span>
            <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Timestamp (relative time) */}
      <div className="text-xs text-muted-foreground">
        {relativeTime}
      </div>
    </div>
  );
};
