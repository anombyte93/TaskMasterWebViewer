# TaskMaster Web Viewer - User Guide

> **A modern web dashboard for managing TaskMaster tasks and issues with elegant design and powerful features.**

Welcome to the TaskMaster Web Viewer user guide! This documentation will help you get started and make the most of all the features available in Phase 1.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Key Features](#key-features)
4. [Detailed Guides](#detailed-guides)
5. [Tips and Tricks](#tips-and-tricks)
6. [Troubleshooting](#troubleshooting)
7. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Introduction

TaskMaster Web Viewer is a progressive web dashboard that provides a beautiful, intuitive interface for managing your TaskMaster tasks and issues. It's designed to complement the TaskMaster CLI by offering visual task management, real-time updates, and powerful search and filtering capabilities.

### What You Can Do

- **View Tasks**: Browse all your TaskMaster tasks in a visually appealing card layout
- **Navigate Subtasks**: Expand/collapse task hierarchies with smooth animations
- **Track Progress**: See completion progress bars for tasks with subtasks
- **Manage Issues**: Create, edit, and delete issues with rich metadata
- **Search Everything**: Fuzzy search across tasks and issues simultaneously
- **Filter by Status**: Multi-select filters for status, priority, and severity
- **Mobile-First**: Fully responsive design that works on phones, tablets, and desktops
- **Real-Time Updates**: Auto-refreshing data keeps you in sync with TaskMaster CLI

### Design Philosophy

The dashboard follows these principles:

- **Elegant by default**: Clean, minimalist design inspired by Linear and Material Design
- **Information density**: Show what matters without visual clutter
- **Terminal-first**: Respects TaskMaster CLI as the source of truth for tasks
- **Tokyo Night theme**: Dark mode optimized for long coding sessions

---

## Getting Started

### Prerequisites

- Node.js 20+ installed
- A project with TaskMaster initialized (`.taskmaster/` directory)
- Basic familiarity with TaskMaster CLI

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd TaskMasterWebIntegration

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Set PROJECT_ROOT=/path/to/your/project
```

### Configuration

Edit `.env` file:

```bash
# Required: Path to your project with .taskmaster/ directory
PROJECT_ROOT=/home/user/my-project

# Optional: Server port (default: 5000)
PORT=5000

# Optional: Node environment
NODE_ENV=development
```

### Starting the Dashboard

```bash
# Development mode (recommended)
npm run dev

# Production mode
npm run build
npm start
```

Open your browser to `http://localhost:5000`

### First-Time Setup

1. **Verify Tasks Load**: You should see your TaskMaster tasks displayed in cards
2. **Check Issue Tracker**: The right sidebar shows your issues (may be empty initially)
3. **Test Search**: Type in the search bar to filter tasks and issues
4. **Try Filters**: Click "Status" or "Priority" to open filter menus
5. **Create Test Issue**: Click "+ New Issue" to test issue creation

---

## Key Features

### Task Viewer

**Display Format**: Tasks are shown as cards with:
- **Task ID** (top-left, monospace badge)
- **Title** (bold headline)
- **Description** (truncated to 2 lines)
- **Status Badge** (color-coded)
- **Priority Badge** (high/medium/low)
- **Progress Bar** (for tasks with subtasks)
- **Subtask Count** (e.g., "3/5 subtasks")

**Status Colors**:
- **Pending**: Gray
- **In Progress**: Blue
- **Done**: Green
- **Blocked**: Red
- **Deferred**: Yellow
- **Cancelled**: Gray (darker)

**Priority Badges**:
- **High**: Red background
- **Medium**: Yellow background
- **Low**: Blue background

### Subtask Navigation

Click the chevron icon (▼) on any task card to expand its subtasks:

- **Smooth Animation**: Accordion-style expand/collapse
- **Nested Display**: Subtasks shown with left border and indentation
- **Compact View**: Smaller cards optimized for nested display
- **Status & Priority**: Each subtask shows its own badges
- **Task IDs**: Subtask IDs displayed (e.g., "1.1", "1.2")

### Issue Tracker

**Located in Right Sidebar** (desktop) or **bottom tab** (mobile)

**Issue Card Shows**:
- **Issue ID** (monospace, top)
- **Title** (max 2 lines)
- **Status Badge** (open/in-progress/resolved)
- **Severity Badge** (critical/high/medium/low)
- **Related Task Link** (if linked to a task)
- **Timestamp** (relative time, e.g., "2 hours ago")

**Severity Colors**:
- **Critical**: Red left border
- **High**: Orange left border
- **Medium**: Yellow left border
- **Low**: Blue left border

### Search & Filter

**Search Bar Features**:
- **Fuzzy Matching**: Finds results even with typos
- **Multi-Field Search**: Searches titles, descriptions, and tags
- **Real-Time Results**: Instant filtering as you type
- **Cross-Entity**: Searches both tasks AND issues simultaneously

**Filter Bar**:
- **Multi-Select**: Choose multiple status/priority values
- **Active Badge Counter**: Shows number of active filters
- **Quick Remove**: X button on each active filter badge
- **Clear All**: One-click to reset all filters

**Combining Search + Filters**: Both work together for powerful refinement

### Responsive Design

**Desktop (1024px+)**:
- Two-column layout: 70% tasks, 30% issues
- Search bar above task list
- Filters below search bar
- Full feature set visible

**Tablet (768-1023px)**:
- Collapsible sidebar for issues
- Hamburger menu to toggle sidebar
- Sidebar state persists in localStorage
- Full-width task viewer when sidebar closed

**Mobile (<768px)**:
- Single-column layout
- Bottom navigation tabs (Tasks / Issues)
- Pull-to-refresh gesture
- 44px touch targets (Apple HIG compliant)
- Optimized typography for small screens

### Auto-Refresh

**Behavior**:
- Data refreshes every **5 seconds** automatically
- Updates tasks from `tasks.json`
- Updates issues from `issues/` directory
- No page reload required
- Smooth transitions during updates

**Pull-to-Refresh** (Mobile Only):
- Swipe down at top of page
- Visual spinner shows refresh progress
- Haptic feedback on supported devices

---

## Detailed Guides

For in-depth tutorials on specific features, see:

- **[Quick Start Guide](quick-start.md)** - 5-minute walkthrough
- **[Task Viewer Guide](tasks.md)** - Everything about tasks and subtasks
- **[Issue Tracker Guide](issues.md)** - Creating and managing issues
- **[Search & Filter Guide](search-filter.md)** - Advanced search techniques

---

## Tips and Tricks

### Efficient Workflows

**1. Filtering for Current Work**
```
Search: ""
Filters: Status = "in-progress"
Result: All active tasks
```

**2. Finding Critical Issues**
```
Search: ""
Filters: Severity = "critical" + Status = "open"
Result: Urgent issues requiring attention
```

**3. Tracking High-Priority Tasks**
```
Search: ""
Filters: Priority = "high" + Status = "pending"
Result: Important tasks to start next
```

**4. Reviewing Completed Work**
```
Search: ""
Filters: Status = "done"
Result: All completed tasks (great for standups!)
```

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter**: Activate buttons and open dropdowns
- **Escape**: Close modals and dropdowns
- **Space**: Toggle checkboxes in filter menus

### Mobile Gestures

- **Pull Down**: Refresh data (from top of page)
- **Tap Card**: Expand task or open issue detail
- **Tap Chevron**: Expand/collapse subtasks
- **Tap Badge Filter**: Open filter menu
- **Tap X**: Remove individual filter

### Linking Issues to Tasks

When creating an issue, use the "Related Task ID" field:
```
Related Task ID: 1.2
```
This creates a clickable link in the issue card that jumps to that task.

### Understanding Progress Bars

Progress bars show subtask completion:
- **Green segment**: Completed subtasks (status = "done")
- **Gray segment**: Remaining subtasks
- **Percentage**: Shown at the end (e.g., "60%")

Formula: `(completed subtasks / total subtasks) × 100`

---

## Troubleshooting

### Tasks Not Loading

**Symptom**: Empty task list or error message

**Solutions**:
1. Verify `PROJECT_ROOT` in `.env` points to correct directory
2. Check that `.taskmaster/tasks/tasks.json` exists
3. Restart the server: `npm run dev`
4. Check browser console for errors (F12 → Console tab)

### Issues Not Saving

**Symptom**: Issue creation fails or doesn't persist

**Solutions**:
1. Check `.taskmaster/issues/` directory exists
2. Verify write permissions on the directory
3. Look for validation errors in the form
4. Check server logs: `npm run dev` output

### Auto-Refresh Not Working

**Symptom**: Data doesn't update when TaskMaster CLI changes files

**Solutions**:
1. Check if React Query is enabled (should be by default)
2. Verify network tab shows periodic API calls
3. Try manual refresh: Click browser refresh or use pull-to-refresh
4. Check server is running: `curl http://localhost:5000/api/tasks`

### Sidebar Not Appearing (Tablet/Mobile)

**Symptom**: Can't see issue tracker on tablet

**Solutions**:
1. Look for hamburger menu icon (☰) in header
2. Tap/click to toggle sidebar
3. Try rotating device to landscape
4. Clear localStorage: `localStorage.clear()` in console

### Search Not Finding Results

**Symptom**: Search returns no results for known content

**Solutions**:
1. Check spelling (fuzzy search has limits)
2. Try shorter search terms
3. Clear filters that might be excluding results
4. Verify data loaded: Scroll through tasks manually

### Performance Issues

**Symptom**: Lag when scrolling or expanding tasks

**Solutions**:
1. Check number of tasks (<1000 should be smooth)
2. Close browser tabs to free memory
3. Disable browser extensions (especially ad blockers)
4. Use production build: `npm run build && npm start`

---

## Keyboard Shortcuts

Currently, the dashboard uses standard browser navigation:

| Shortcut | Action |
|----------|--------|
| `Tab` | Next interactive element |
| `Shift+Tab` | Previous interactive element |
| `Enter` | Activate button/link |
| `Space` | Toggle checkbox |
| `Escape` | Close modal/dropdown |
| `/` | Focus search bar (planned) |
| `?` | Show keyboard shortcuts (planned) |

**Note**: Custom keyboard shortcuts planned for future phases.

---

## Data Management

### What the Dashboard Does NOT Do

**Tasks** (Read-Only):
- Does NOT edit tasks
- Does NOT change task status
- Does NOT reorder tasks
- Does NOT delete tasks

**Why?** TaskMaster CLI is the source of truth for tasks. Use `task-master` commands to modify tasks.

### What the Dashboard DOES Do

**Issues** (Full CRUD):
- ✅ Create new issues
- ✅ Edit existing issues
- ✅ Delete issues
- ✅ Link issues to tasks
- ✅ Manage issue metadata (severity, status, tags, attachments)

### File Structure

```
your-project/
└── .taskmaster/
    ├── tasks/
    │   └── tasks.json          # Read by dashboard, edited by CLI
    ├── issues/
    │   ├── issue-<id>.json     # Managed by dashboard
    │   └── index.json          # Issue index (auto-maintained)
    └── reports/
        └── task-complexity-report.json  # Future feature
```

---

## Accessibility

The dashboard follows WCAG 2.1 AA guidelines:

- **Touch Targets**: Minimum 44×44px (Apple HIG standard)
- **Color Contrast**: 4.5:1 minimum for text
- **Keyboard Navigation**: Full keyboard access
- **Screen Readers**: ARIA labels on interactive elements
- **Focus Indicators**: Visible focus rings on all interactive elements

**Note**: Voice control and advanced accessibility features planned for Phase 3.

---

## Browser Support

**Recommended Browsers**:
- Chrome 120+ ✅
- Firefox 120+ ✅
- Safari 17+ ✅
- Edge 120+ ✅

**Mobile Browsers**:
- iOS Safari 17+ ✅
- Chrome Mobile 120+ ✅
- Firefox Mobile 120+ ✅

**Not Supported**:
- Internet Explorer (any version)
- Legacy browsers without ES2022 support

---

## Privacy & Security

- **No Analytics**: Zero tracking, no telemetry
- **Local-First**: All data stored on your machine
- **No Cloud Sync**: Dashboard reads local files only
- **No User Accounts**: No authentication required
- **Open Source**: MIT License, audit the code yourself

---

## Getting Help

- **Documentation**: [Full user guide](README.md)
- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share tips

---

## Next Steps

Now that you understand the basics, dive into:

1. **[Quick Start Guide](quick-start.md)** - Get productive in 5 minutes
2. **[Task Viewer Guide](tasks.md)** - Master task navigation
3. **[Issue Tracker Guide](issues.md)** - Learn advanced issue management
4. **[Search & Filter Guide](search-filter.md)** - Become a search power user

---

**Version**: 1.0 (Phase 1)
**Last Updated**: 2025-11-13
**License**: MIT
