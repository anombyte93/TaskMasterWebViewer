import React from 'react';

/**
 * LoadingFallback Component
 *
 * Provides loading states for React.lazy() Suspense boundaries.
 * Multiple variants for different contexts (modal, page, inline).
 *
 * Performance optimized for mobile:
 * - Minimal DOM elements
 * - CSS animations only (no JS)
 * - Skeleton screens for perceived performance
 */

interface LoadingFallbackProps {
  variant?: 'modal' | 'page' | 'inline' | 'minimal';
  message?: string;
}

export function LoadingFallback({
  variant = 'inline',
  message = 'Loading...'
}: LoadingFallbackProps) {

  // Minimal variant - just a spinner (for small components)
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Modal variant - centered with backdrop
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-background rounded-lg p-8 shadow-lg border">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Page variant - full page skeleton
  if (variant === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  // Inline variant (default) - inline skeleton with content placeholder
  return (
    <div className="w-full space-y-4 p-6 animate-pulse">
      {/* Skeleton header */}
      <div className="h-8 bg-muted rounded w-3/4"></div>

      {/* Skeleton content lines */}
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-4/6"></div>
      </div>

      {/* Skeleton action area */}
      <div className="flex space-x-3 pt-4">
        <div className="h-10 bg-muted rounded w-24"></div>
        <div className="h-10 bg-muted rounded w-24"></div>
      </div>
    </div>
  );
}

/**
 * Specialized loading fallback for modal dialogs
 * Optimized for Radix UI Dialog components
 */
export function ModalLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

/**
 * Specialized loading fallback for route transitions
 */
export function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}
