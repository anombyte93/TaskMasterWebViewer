import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

/**
 * MainLayout component - Two-column responsive layout
 *
 * Mobile (<768px): Single column vertical stack (tasks → issues)
 * Tablet (768-1023px): Full-width tasks | Overlay sidebar (toggleable)
 * Desktop (≥1024px): 70% tasks (left) | 30% sidebar (right) - Persistent
 *
 * Integrates:
 * - Header (sticky top nav with search/filters and sidebar toggle)
 * - Main content area (tasks, responsive width)
 * - Sidebar (issues panel, stacked on mobile, overlay on tablet, persistent on desktop)
 *
 * Responsive behavior:
 * - Mobile (<768px): Single column stack, issues visible below tasks
 * - Tablet (768-1023px): Sidebar as overlay (280px), toggled via header button
 * - Desktop (≥1024px): Sidebar persistent at 25-30% width
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebarContent,
  isSidebarOpen = false,
  onToggleSidebar = () => {},
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header - spans full width */}
      <Header onToggleSidebar={onToggleSidebar} />

      {/* Main content area - responsive layout */}
      <main className="flex flex-col md:flex-row max-w-screen-2xl mx-auto">
        {/* Tasks area: Full-width on mobile/tablet, 70% on desktop */}
        <div className="w-full lg:w-[70%] p-4 md:p-8 overflow-y-auto md:h-[calc(100vh-4rem)]">
          {children}
        </div>

        {/* Issues area: Overlay on tablet, persistent on desktop */}
        {sidebarContent && (
          <Sidebar isOpen={isSidebarOpen} onClose={onToggleSidebar}>
            {sidebarContent}
          </Sidebar>
        )}
      </main>
    </div>
  );
};

export default MainLayout;
