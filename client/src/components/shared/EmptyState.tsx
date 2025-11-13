import React from "react";
import { Inbox, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * EmptyState - Reusable empty state component for displaying "no results" states
 *
 * Features:
 * - Multiple variants (default, search, error)
 * - Customizable icon, title, description
 * - Optional action button
 * - Centered layout with responsive design
 * - Tokyo Night theme styling
 *
 * Design follows design_guidelines.md:
 * - Centered flex column layout
 * - Icon size: 48x48 (w-12 h-12)
 * - Text alignment: text-center
 * - Max width: max-w-md mx-auto
 * - Padding: py-12, px-4
 *
 * @example
 * ```tsx
 * <EmptyState
 *   variant="search"
 *   title="No tasks found"
 *   description="Try adjusting your search filters"
 * />
 *
 * <EmptyState
 *   title="No issues yet"
 *   description="Create your first issue to get started"
 *   action={{
 *     label: "Create Issue",
 *     onClick: () => console.log("Creating issue...")
 *   }}
 * />
 * ```
 */

export interface EmptyStateProps {
  /** Custom icon element to display (overrides variant default) */
  icon?: React.ReactNode;
  /** Main heading text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Visual variant that determines default icon and styling */
  variant?: "default" | "search" | "error";
  /** Additional CSS classes */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = "default",
  className = "",
}) => {
  // Default icons for each variant
  const defaultIcons = {
    default: <Inbox className="w-12 h-12 text-muted-foreground" />,
    search: <Search className="w-12 h-12 text-muted-foreground" />,
    error: <AlertTriangle className="w-12 h-12 text-destructive" />,
  };

  // Use provided icon or fall back to variant default
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        "max-w-md mx-auto text-center",
        className
      )}
    >
      {/* Icon container */}
      <div className="mb-4" aria-hidden="true">
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Description (optional) */}
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}

      {/* Action button (optional) */}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
