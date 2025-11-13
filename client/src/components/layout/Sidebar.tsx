import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SidebarProps {
  children?: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar component for the right panel container (Issues display)
 *
 * Responsive behavior:
 * - Mobile (<768px): Full-width stacked section below main content
 * - Tablet (768-1023px): Overlay sidebar (280px width) with backdrop
 * - Desktop (≥1024px): Persistent sidebar at 25-30% viewport width
 *
 * Features:
 * - Slide-in animation from right on tablet
 * - Click outside to close (tablet only)
 * - Scrollable content with overflow handling
 * - Tokyo Night themed with subtle border
 */
export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className = '',
  isOpen = false,
  onClose = () => {},
}) => {
  const sidebarRef = useRef<HTMLElement>(null);

  // Handle click outside to close (tablet only)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Only apply on tablet breakpoint (768-1023px)
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      if (!isTablet) return;

      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on tablet
  useEffect(() => {
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    if (isOpen && isTablet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop for tablet overlay (768-1023px) */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-[39] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          bg-secondary
          overflow-y-auto
          p-4 md:p-6

          /* Mobile (<768px): Full-width stacked section below content */
          block
          border-t border-border
          w-full

          /* Tablet (768-1023px): Fixed overlay with slide-in animation */
          md:fixed
          md:right-0
          md:top-16
          md:w-[280px]
          md:z-[40]
          md:transition-transform
          md:duration-300
          md:ease-in-out
          md:border-l md:border-t-0
          md:h-[calc(100vh-4rem)]
          ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}

          /* Desktop (≥1024px): Persistent sidebar */
          lg:static
          lg:translate-x-0
          lg:w-[30%]
          lg:transition-none
          lg:h-[calc(100vh-4rem)]
          xl:w-[25%]

          ${className}
        `.trim().replace(/\s+/g, ' ')}
        aria-label="Issues panel"
      >
        {/* Close button (tablet only, hidden on mobile and desktop) */}
        <div className="hidden md:flex lg:hidden justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-11 w-11 p-0"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {children}
      </aside>
    </>
  );
};

export default Sidebar;
