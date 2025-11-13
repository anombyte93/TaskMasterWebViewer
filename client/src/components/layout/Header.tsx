import { Search, RefreshCw, Filter, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  onToggleSidebar?: () => void;
}

/**
 * Header component - Sticky top navigation
 *
 * Features:
 * - App title/logo
 * - Search bar (responsive: full on desktop, icon-only on mobile)
 * - Refresh and Filter buttons
 * - Sidebar toggle (tablet only)
 * - Touch-friendly buttons (44x44px minimum per WCAG 2.5.5)
 *
 * Mobile optimizations:
 * - Compact layout with reduced spacing
 * - Collapsible search (icon button on mobile)
 * - Hide button labels on small screens
 */
export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b bg-background">
      <div className="flex items-center h-full px-4 md:px-8 gap-2 md:gap-4">
        {/* Left: App Title/Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">
            TaskMaster
          </h1>
        </div>

        {/* Center: Search Bar (hidden on xs, visible on sm+) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-10 w-full h-11"
            />
          </div>
        </div>

        {/* Right: Action Buttons - Touch-friendly 44x44px minimum */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Mobile search icon (visible only on xs) */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden min-h-[44px] min-w-[44px] p-0"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 min-h-[44px] px-3"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 min-h-[44px] px-3"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>

          {/* Sidebar Toggle (Tablet only: 768-1023px) */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 md:flex lg:hidden hidden min-h-[44px] px-3"
            onClick={onToggleSidebar}
            aria-label="Toggle issues sidebar"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Issues</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
