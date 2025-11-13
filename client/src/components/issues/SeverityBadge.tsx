import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { IssueSeverity } from "@shared/schema";

const severityBadgeVariants = cva(
  "px-3 py-1 rounded-full text-xs uppercase font-semibold tracking-wide inline-flex items-center justify-center",
  {
    variants: {
      severity: {
        critical: "bg-[#2d1f1f] text-[#f7768e]",
        high: "bg-[#332a1f] text-[#ff9e64]",
        medium: "bg-[#3b4261] text-[#7aa2f7]",
        low: "bg-[#1e2d1d] text-[#9ece6a]",
      },
    },
    defaultVariants: {
      severity: "medium",
    },
  }
);

export interface SeverityBadgeProps
  extends VariantProps<typeof severityBadgeVariants> {
  severity: IssueSeverity;
  className?: string;
}

export default function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span className={cn(severityBadgeVariants({ severity }), className)}>
      {severity}
    </span>
  );
}
