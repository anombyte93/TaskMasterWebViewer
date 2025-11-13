import { useEffect, useRef, useState } from 'react';

/**
 * usePullToRefresh Hook
 *
 * Implements pull-to-refresh gesture for mobile devices.
 * Detects vertical pull gesture at top of scrollable container.
 *
 * Usage:
 * const { pullDistance, isRefreshing, containerRef } = usePullToRefresh({
 *   onRefresh: async () => { await refetch(); },
 *   threshold: 100,
 *   resistance: 2.5,
 * });
 *
 * Features:
 * - Threshold-based triggering (default 100px)
 * - Resistance factor for smooth feel
 * - Works only when scrolled to top
 * - Prevents conflicts with native scroll
 */

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // Distance to pull before triggering (default: 100px)
  resistance?: number; // Pull resistance factor (default: 2.5)
  maxPullDistance?: number; // Maximum pull distance (default: 150px)
}

interface PullToRefreshState {
  pullDistance: number;
  isRefreshing: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function usePullToRefresh(options: UsePullToRefreshOptions): PullToRefreshState {
  const {
    onRefresh,
    threshold = 100,
    resistance = 2.5,
    maxPullDistance = 150,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Touch state
  const touchStartY = useRef<number | null>(null);
  const isPulling = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if scrolled to top
      if (container.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || touchStartY.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      // Only pull down (positive distance)
      if (distance > 0 && container.scrollTop === 0) {
        // Prevent default scroll behavior
        e.preventDefault();

        // Apply resistance and cap at max distance
        const resistedDistance = Math.min(distance / resistance, maxPullDistance);
        setPullDistance(resistedDistance);
      } else {
        // Reset if scrolling up or container scrolled
        isPulling.current = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      isPulling.current = false;

      // Trigger refresh if exceeded threshold
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull-to-refresh failed:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back without refresh
        setPullDistance(0);
      }

      touchStartY.current = null;
    };

    // Attach listeners with { passive: false } to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, threshold, resistance, maxPullDistance, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    containerRef,
  };
}
