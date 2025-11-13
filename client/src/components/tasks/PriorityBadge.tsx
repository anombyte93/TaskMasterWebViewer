import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@shared/schema";

const priorityBadgeVariants = cva(
  "inline-flex items-center border rounded px-2 py-1 text-xs font-medium capitalize transition-colors",
  {
    variants: {
      priority: {
        high: "text-[#f7768e] border-[#f7768e]",
        medium: "text-[#ff9e64] border-[#ff9e64]",
        low: "text-[#7aa2f7] border-[#7aa2f7]",
      },
    },
    defaultVariants: {
      priority: "medium",
    },
  }
);

export interface PriorityBadgeProps
  extends VariantProps<typeof priorityBadgeVariants> {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn(priorityBadgeVariants({ priority }), className)}>
      {priority}
    </span>
  );
}
