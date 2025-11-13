import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@shared/schema";

const statusBadgeVariants = cva(
  "px-3 py-1 rounded-full text-xs uppercase font-semibold tracking-wide inline-flex items-center justify-center",
  {
    variants: {
      status: {
        pending: "bg-[#3b4261] text-[#7aa2f7]",
        "in-progress": "bg-[#332a1f] text-[#ff9e64]",
        done: "bg-[#1e2d1d] text-[#9ece6a]",
        blocked: "bg-[#2d1f1f] text-[#f7768e]",
        deferred: "bg-[#2d2136] text-[#bb9af7]",
        cancelled: "bg-[#24283b] text-[#565f89]",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  status: TaskStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {status}
    </span>
  );
}
