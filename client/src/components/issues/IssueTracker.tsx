import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Issue } from "@shared/schema";

interface IssueTrackerProps {
  issues: Issue[];
  isLoading?: boolean;
  onCreateIssue?: () => void;
  onIssueClick?: (issueId: string) => void;
  className?: string;
}

/**
 * IssueTracker - Container component for the issues panel (sidebar)
 *
 * Features:
 * - Header with "Issues" title and "New Issue" button
 * - Loading state with skeleton placeholders
 * - Empty state with "Create Issue" CTA
 * - List of issues (placeholder divs for Wave 1, IssueCard integration in Wave 2)
 * - 30% width sidebar area in dashboard layout
 *
 * Design follows design_guidelines.md:
 * - Panel structure: Fixed height with internal scroll
 * - Padding: p-6, space-y-4
 * - Header: flex justify-between
 * - Tokyo Night theme colors
 */
export const IssueTracker: React.FC<IssueTrackerProps> = ({
  issues,
  isLoading = false,
  onCreateIssue,
  onIssueClick,
  className = "",
}) => {
  // Loading state - show skeleton placeholders
  if (isLoading) {
    return (
      <div
        className={cn(
          "h-[calc(100vh-4rem)] overflow-y-auto bg-secondary border-l border-border",
          "p-6 space-y-4",
          className
        )}
      >
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-20 rounded bg-muted animate-pulse" />
          <div className="h-8 w-24 rounded bg-muted animate-pulse" />
        </div>

        {/* Issue card skeletons */}
        {Array.from({ length: 3 }).map((_, index) => (
          <IssueCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state - no issues to display
  if (issues.length === 0) {
    return (
      <div
        className={cn(
          "h-[calc(100vh-4rem)] overflow-y-auto bg-secondary border-l border-border",
          "p-6",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Issues</h2>
          {onCreateIssue && (
            <Button
              variant="default"
              size="sm"
              onClick={onCreateIssue}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              New Issue
            </Button>
          )}
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No issues yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Issues help you track problems, blockers, and questions related to tasks.
          </p>
          {onCreateIssue && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateIssue}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Create Issue
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Issues list - display all issues
  return (
    <div
      className={cn(
        "h-[calc(100vh-4rem)] overflow-y-auto bg-secondary border-l border-border",
        "p-6 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Issues
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({issues.length})
          </span>
        </h2>
        {onCreateIssue && (
          <Button
            variant="default"
            size="sm"
            onClick={onCreateIssue}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            New Issue
          </Button>
        )}
      </div>

      {/* Issues list - placeholder divs for Wave 1 (IssueCard will be integrated in Wave 2) */}
      <div className="space-y-3">
        {issues.map((issue) => (
          <PlaceholderIssueCard
            key={issue.id}
            issue={issue}
            onClick={onIssueClick}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * IssueCardSkeleton - Loading placeholder for issue cards
 *
 * Mimics the structure of an issue card for smooth loading experience
 */
function IssueCardSkeleton() {
  return (
    <div className="w-full border border-border rounded-lg p-4 bg-background animate-pulse">
      <div className="flex gap-3">
        {/* Severity indicator placeholder */}
        <div className="w-1 h-20 rounded-full bg-muted flex-shrink-0" />

        {/* Content placeholder */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Issue ID placeholder */}
          <div className="w-20 h-4 rounded bg-muted" />

          {/* Title placeholder */}
          <div className="h-5 w-4/5 rounded bg-muted" />

          {/* Related task placeholder */}
          <div className="w-24 h-3 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

/**
 * PlaceholderIssueCard - Temporary placeholder for issue display
 *
 * This is a Wave 1 placeholder that will be replaced by the IssueCard component in Wave 2.
 * Shows basic issue information in a simple layout.
 */
interface PlaceholderIssueCardProps {
  issue: Issue;
  onClick?: (issueId: string) => void;
}

function PlaceholderIssueCard({ issue, onClick }: PlaceholderIssueCardProps) {
  const severityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  };

  const statusBadgeColors = {
    open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "in-progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <div
      className={cn(
        "w-full border border-border rounded-lg p-4 bg-background",
        "hover:border-accent transition-colors cursor-pointer"
      )}
      onClick={() => onClick?.(issue.id)}
    >
      <div className="flex gap-3">
        {/* Severity indicator */}
        <div
          className={cn(
            "w-1 h-full rounded-full flex-shrink-0",
            severityColors[issue.severity]
          )}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Issue ID and status */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {issue.id}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                statusBadgeColors[issue.status]
              )}
            >
              {issue.status}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-foreground line-clamp-2">
            {issue.title}
          </h4>

          {/* Related task link */}
          {issue.relatedTaskId && (
            <div className="text-xs text-muted-foreground">
              <span className="underline">Task {issue.relatedTaskId}</span>
            </div>
          )}

          {/* Severity badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground capitalize">
              {issue.severity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
