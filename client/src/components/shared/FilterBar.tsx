import * as React from "react";
import { Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskStatus, TaskPriority, IssueSeverity } from "@shared/schema";

interface FilterBarProps {
  filters: {
    status?: string[];
    priority?: string[];
    severity?: string[];
  };
  onChange: (filters: FilterBarProps["filters"]) => void;
  showSeverity?: boolean;
  className?: string;
}

const STATUS_OPTIONS: TaskStatus[] = [
  "pending",
  "in-progress",
  "done",
  "blocked",
  "deferred",
  "cancelled",
];

const PRIORITY_OPTIONS: TaskPriority[] = ["high", "medium", "low"];

const SEVERITY_OPTIONS: IssueSeverity[] = ["critical", "high", "medium", "low"];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  showSeverity = false,
  className = "",
}) => {
  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    (filters.severity && filters.severity.length > 0);

  const handleToggleFilter = (
    type: "status" | "priority" | "severity",
    value: string
  ) => {
    const currentValues = filters[type] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({
      ...filters,
      [type]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handleRemoveFilter = (
    type: "status" | "priority" | "severity",
    value: string
  ) => {
    const currentValues = filters[type] || [];
    const newValues = currentValues.filter((v) => v !== value);

    onChange({
      ...filters,
      [type]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handleClearAll = () => {
    onChange({});
  };

  const statusCount = filters.status?.length || 0;
  const priorityCount = filters.priority?.length || 0;
  const severityCount = filters.severity?.length || 0;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Status Filter - 44px touch target */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 min-h-[44px] px-3">
            <Filter className="h-4 w-4" />
            Status
            {statusCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {statusCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-3">Filter by Status</h4>
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status}
                className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded-md p-2 -mx-2"
              >
                <Checkbox
                  checked={filters.status?.includes(status)}
                  onCheckedChange={() => handleToggleFilter("status", status)}
                />
                <span className="text-sm capitalize flex-1">{status}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter - 44px touch target */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 min-h-[44px] px-3">
            <Filter className="h-4 w-4" />
            Priority
            {priorityCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {priorityCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-3">Filter by Priority</h4>
            {PRIORITY_OPTIONS.map((priority) => (
              <label
                key={priority}
                className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded-md p-2 -mx-2"
              >
                <Checkbox
                  checked={filters.priority?.includes(priority)}
                  onCheckedChange={() =>
                    handleToggleFilter("priority", priority)
                  }
                />
                <span className="text-sm capitalize flex-1">{priority}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Severity Filter (conditionally shown) - 44px touch target */}
      {showSeverity && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 min-h-[44px] px-3">
              <Filter className="h-4 w-4" />
              Severity
              {severityCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {severityCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              <h4 className="font-medium text-sm mb-3">Filter by Severity</h4>
              {SEVERITY_OPTIONS.map((severity) => (
                <label
                  key={severity}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded-md p-2 -mx-2"
                >
                  <Checkbox
                    checked={filters.severity?.includes(severity)}
                    onCheckedChange={() =>
                      handleToggleFilter("severity", severity)
                    }
                  />
                  <span className="text-sm capitalize flex-1">{severity}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Active Filter Badges - Touch-friendly remove buttons */}
      {filters.status?.map((status) => (
        <Badge
          key={`status-${status}`}
          variant="secondary"
          className="gap-1 pl-3 pr-1 h-8"
        >
          <span className="capitalize text-xs">{status}</span>
          <button
            onClick={() => handleRemoveFilter("status", status)}
            className="hover:bg-accent rounded-full p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label={`Remove ${status} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.priority?.map((priority) => (
        <Badge
          key={`priority-${priority}`}
          variant="secondary"
          className="gap-1 pl-3 pr-1 h-8"
        >
          <span className="capitalize text-xs">{priority}</span>
          <button
            onClick={() => handleRemoveFilter("priority", priority)}
            className="hover:bg-accent rounded-full p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label={`Remove ${priority} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.severity?.map((severity) => (
        <Badge
          key={`severity-${severity}`}
          variant="secondary"
          className="gap-1 pl-3 pr-1 h-8"
        >
          <span className="capitalize text-xs">{severity}</span>
          <button
            onClick={() => handleRemoveFilter("severity", severity)}
            className="hover:bg-accent rounded-full p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label={`Remove ${severity} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Clear All Button - 44px touch target */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-xs min-h-[44px] px-3"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};
