# TaskMaster Web Viewer - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Linear + Material Design Hybrid

**Justification:** TaskMaster is a utility-focused productivity tool requiring clarity, efficiency, and information density. Linear's clean task management aesthetic combined with Material Design's robust data display patterns provides the optimal foundation for developer-focused workflows.

**Core Principles:**
1. Information clarity over visual flourish
2. Efficient scanning and quick task identification
3. Consistent, predictable interaction patterns
4. Professional, distraction-free workspace

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts) - body text, UI elements
- Monospace: JetBrains Mono - task IDs, technical metadata

**Hierarchy:**
- Page Title: 2xl (24px), font-semibold
- Section Headers: xl (20px), font-semibold
- Task Titles: base (16px), font-medium
- Subtask Titles: sm (14px), font-medium
- Metadata/Labels: xs (12px), font-normal, uppercase tracking-wide
- Body Text: sm (14px), font-normal
- Task IDs: xs (12px), monospace, font-medium

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 exclusively
- Micro-spacing (within components): p-2, gap-2
- Standard spacing (component padding): p-4, gap-4
- Section spacing: p-6, gap-6
- Major sections: p-8, gap-8

**Grid Structure:**
- Two-column desktop layout: 70% tasks (left) | 30% issues (right)
- Mobile: Single column stack (tasks first, then issues)
- Container max-width: max-w-screen-2xl with px-4 on mobile, px-8 on desktop
- Responsive breakpoints: md:grid-cols-[2fr_1fr] for desktop split

**Task Hierarchy Indentation:**
- Level 1 (Main tasks): pl-0
- Level 2 (Subtasks): pl-8
- Level 3+ (Nested): pl-16, pl-24 (add 8 units per level)

## Component Library

### Navigation & Header
**Top Navigation Bar:**
- Full-width sticky header with subtle border-bottom
- Height: h-16
- Contains: App title (left), search bar (center flex-1 max-w-md), refresh button + filters (right)
- Search: Rounded input with icon, px-4 py-2
- Filter buttons: Icon + label, px-4 py-2, gap-2

### Task Display Components

**Task Card:**
- Full-width card with border and rounded corners (rounded-lg)
- Padding: p-4
- Hover state: Subtle elevation increase
- Structure: Flex layout with gap-4
  - Left: Status indicator (w-1 h-full rounded-full)
  - Center: Task content (flex-1)
  - Right: Action icons and metadata

**Task Content Layout:**
- Task ID badge: Inline monospace, px-2 py-1, rounded, text-xs
- Title: font-medium, mb-2
- Description: text-sm, line-clamp-2 (truncate with "...")
- Metadata row: flex gap-4, text-xs
  - Priority badge: px-2 py-1, rounded-full, uppercase
  - Dependencies count: Icon + number
  - Subtasks count: Icon + fraction (e.g., "3/5")

**Expandable Subtask Section:**
- Collapse/Expand icon (chevron) in task header
- Subtasks container: mt-4, space-y-2, border-l-2 (connecting line)
- Each subtask: Reduced padding (p-3), smaller text (text-sm)

**Status Badges:**
- Pill shape: px-3 py-1, rounded-full
- Size: text-xs, uppercase, font-semibold, tracking-wide
- Visual weight hierarchy: Done > In-Progress > Pending > Others

**Progress Indicators:**
- Linear progress bar: h-2, rounded-full, bg-opacity-20 base with filled portion
- Percentage text: text-xs, tabular-nums

### Issues Panel

**Panel Structure:**
- Fixed height with internal scroll: h-[calc(100vh-4rem)] overflow-y-auto
- Sticky section header: "Issues" with issue count badge
- Padding: p-6, space-y-4

**Issue Card:**
- Compact card: p-4, rounded-lg, border
- Layout: Vertical stack with gap-2
- Issue ID: Monospace, text-xs
- Severity indicator: Horizontal bar on left edge (w-1)
- Title: font-medium, text-sm
- Related task link: text-xs, underlined, with task ID

**Issue Creation Form:**
- Collapsible section at top of issues panel
- Form layout: space-y-4
- Input fields: Full-width, px-3 py-2, rounded-md, border
- Dropdown: Custom styled select matching input aesthetic
- Submit button: Full-width, px-4 py-2, rounded-md, font-medium

### Modals & Overlays

**Task Detail Modal:**
- Centered overlay: max-w-2xl
- Modal content: p-8, rounded-xl
- Backdrop: Fixed overlay with blur effect
- Header: Task ID + Title, pb-6, border-bottom
- Content sections: Vertical stack with gap-6
  - Description: Full text, text-sm
  - Metadata grid: Two columns on desktop, grid gap-4
  - Related issues: List with links
  - Subtask tree: Nested list with connecting lines
- Footer: Action buttons aligned right, gap-2

### Search & Filter Components

**Filter Bar:**
- Horizontal layout: flex gap-2
- Filter chips: px-3 py-1, rounded-full, text-sm
- Active state: Filled appearance
- Inactive: Border only
- Clear all: Text button, text-sm, underlined

**Search Results:**
- Highlight matching text within results
- Show result count: "X tasks found"
- Empty state: Centered message with icon, py-12

## Responsive Behavior

**Desktop (≥1024px):**
- Two-column layout maintained
- Task cards: Grid view option (2 columns within task panel)
- Issues panel: Fixed width sidebar

**Tablet (768px - 1023px):**
- Single column stack
- Issues panel: Collapsible accordion below tasks
- Reduced horizontal padding: px-4

**Mobile (<768px):**
- Full single column
- Condensed task cards: Hide descriptions until tap
- Sticky filter/search: Minimal top bar
- Floating action button for issue creation (bottom-right)
- Reduced nesting indentation: pl-4 per level

## Interaction Patterns

**Task Expansion:**
- Click anywhere on task card to expand/collapse subtasks
- Chevron icon rotation animation (0deg to 180deg)
- Smooth height transition for subtask reveal

**Task Selection:**
- Click task ID or dedicated "Details" button to open modal
- Keyboard navigation: Arrow keys to move, Enter to open, Esc to close

**Issue Creation:**
- Toggle form visibility with "+" button
- Form slides down with smooth animation
- Auto-focus on title field when opened

**Search/Filter:**
- Real-time filtering (no submit button)
- Multiple filters combine with AND logic
- Visual feedback: Dim non-matching tasks

## Data Visualization

**Task Completion Progress:**
- Parent tasks show aggregate completion bar
- Visual formula: Done subtasks / Total subtasks
- Accompanying text: "3 of 5 complete"

**Status Distribution:**
- Optional stats header showing counts per status
- Horizontal bar chart or simple number badges

## Accessibility Features

**Focus States:**
- Visible focus ring: ring-2 ring-offset-2 on all interactive elements
- Keyboard navigation: Clear focus indicators throughout hierarchy

**Screen Reader Support:**
- ARIA labels for status badges
- Semantic HTML: nav, main, aside, article elements
- Live regions for dynamic filter results

**Contrast:**
- All text meets WCAG AA standards
- Status indicators use both shape and pattern (not just variation alone)

## Images

**No Hero Image Required** - This is a productivity dashboard, not a marketing page. Focus on functional interface from first load.

## Animation Guidelines

**Use Sparingly:**
- Task expand/collapse: 200ms ease-in-out
- Modal open/close: 150ms fade + scale
- Hover states: 100ms transitions
- Progress bar fills: 300ms ease-out
- No decorative animations - all purposeful feedback only