/**
 * ProgressBar Component
 *
 * Displays a horizontal progress bar with completion percentage.
 * Follows Tokyo Night theme with smooth animation.
 *
 * @example
 * <ProgressBar completed={3} total={5} />
 * <ProgressBar completed={3} total={5} showPercentage={false} />
 */
import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  showPercentage = true,
  className = '',
}) => {
  // Calculate percentage with safety checks
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Progress bar container */}
      <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
        {/* Progress fill with smooth transition */}
        <div
          className="h-full bg-accent-green rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${completed} of ${total} completed`}
        />
      </div>

      {/* Percentage text with tabular numbers */}
      {showPercentage && (
        <span className="text-xs font-mono tabular-nums text-text-secondary whitespace-nowrap">
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
