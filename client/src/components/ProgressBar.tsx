import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="flex items-center gap-2">
      <Progress value={percentage} className="h-2 flex-1" data-testid="progress-bar" />
      <span className="text-xs text-muted-foreground tabular-nums" data-testid="text-progress">
        {completed}/{total}
      </span>
    </div>
  );
}
