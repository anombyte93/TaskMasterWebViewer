# Quick Start Guide

> **Get productive with TaskMaster Web Viewer in under 5 minutes.**

This guide walks you through the essential features you need to start using the dashboard immediately.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] A project with TaskMaster initialized (`.taskmaster/` directory exists)
- [ ] At least one task in `.taskmaster/tasks/tasks.json`
- [ ] Terminal access to your project

---

## Step 1: Installation (1 minute)

```bash
# Clone the repository
git clone <repo-url>
cd TaskMasterWebIntegration

# Install dependencies
npm install
```

**Expected output**: npm installs packages without errors

---

## Step 2: Configuration (30 seconds)

```bash
# Create environment file
cp .env.example .env

# Edit with your project path
nano .env
```

Update this line:
```bash
PROJECT_ROOT=/path/to/your/project
```

**Example**:
```bash
PROJECT_ROOT=/home/user/my-awesome-app
```

**Tip**: Use absolute paths, not relative paths like `../my-project`

---

## Step 3: Start the Server (10 seconds)

```bash
npm run dev
```

**Expected output**:
```
Server running on http://localhost:5000
```

**Open your browser**: Navigate to `http://localhost:5000`

---

## Step 4: View Your Tasks (1 minute)

You should now see your TaskMaster tasks displayed as cards.

### Understanding Task Cards

Each card shows:

1. **Task ID** (top-left badge): `1`, `2`, `3`, etc.
2. **Title**: The task headline
3. **Description**: First 2 lines of task description
4. **Status Badge**: Color-coded status (pending, in-progress, done, etc.)
5. **Priority Badge**: High/Medium/Low (if set)
6. **Progress Bar**: For tasks with subtasks

**Screenshot placeholder**: `screenshots/01-task-list-overview.png`
```
[Show: Main task list with 3-4 tasks visible, highlighting the card components]
```

### Expanding Subtasks

Look for tasks with a **chevron icon (▼)** on the right side:

1. **Click the chevron** to expand
2. **See subtasks** appear below with smooth animation
3. **Click again** to collapse

**Screenshot placeholder**: `screenshots/02-subtask-expansion.png`
```
[Show: Task card with expanded subtasks, showing the nested hierarchy]
```

---

## Step 5: Create Your First Issue (1 minute)

Issues help you track bugs, questions, or blockers.

### Creating an Issue

1. Look for **"+ New Issue"** button in the right sidebar (or bottom tab on mobile)
2. **Click it** to open the issue creation form
3. **Fill in the form**:
   - Title: "Test issue"
   - Description: "This is my first issue"
   - Severity: Select "Medium"
   - Status: Leave as "Open"
   - Related Task ID: Leave empty for now
4. **Click "Create Issue"**
5. **See your issue** appear in the issue tracker

**Screenshot placeholder**: `screenshots/03-create-issue-form.png`
```
[Show: Issue creation modal with form fields filled in]
```

**Screenshot placeholder**: `screenshots/04-issue-card-created.png`
```
[Show: Issue tracker sidebar with the newly created issue]
```

---

## Step 6: Try Search & Filter (1 minute)

### Basic Search

1. **Click the search bar** at the top
2. **Type a keyword** from one of your task titles (e.g., "authentication")
3. **See results** filter in real-time

**Pro tip**: Search works across BOTH tasks AND issues simultaneously!

**Screenshot placeholder**: `screenshots/05-search-results.png`
```
[Show: Search bar with query entered, showing filtered results below]
```

### Using Filters

1. **Click "Status" button** to open status filter
2. **Check "in-progress"** checkbox
3. **Click outside** to close the menu
4. **See filtered results** (only in-progress tasks)

**Clear filters**:
- Click the **X** on individual filter badges, OR
- Click **"Clear all"** button

**Screenshot placeholder**: `screenshots/06-filter-menu.png`
```
[Show: Status filter popover opened with checkboxes]
```

**Screenshot placeholder**: `screenshots/07-active-filters.png`
```
[Show: Filter badges displayed with X buttons, filtered results below]
```

---

## Step 7: Link an Issue to a Task (30 seconds)

Let's connect your test issue to a task:

1. **Click your test issue** in the sidebar to open detail view
2. **Click "Edit"** button
3. **Find "Related Task ID"** field
4. **Enter a task ID** from your task list (e.g., `1` or `1.2`)
5. **Click "Save"**
6. **See the task link** appear on the issue card

**Screenshot placeholder**: `screenshots/08-issue-detail-edit.png`
```
[Show: Issue detail modal in edit mode with Related Task ID field highlighted]
```

**Screenshot placeholder**: `screenshots/09-issue-with-task-link.png`
```
[Show: Issue card with "Task 1.2 →" link displayed]
```

---

## Step 8: Mobile Experience (Optional)

If you're on a phone or tablet, try these mobile features:

### Pull-to-Refresh
1. **Scroll to top** of the page
2. **Pull down** with your finger
3. **See refresh indicator** appear
4. **Release** to refresh data

### Tablet Sidebar Toggle
1. **Tap hamburger icon (☰)** in header
2. **See sidebar slide in** from right
3. **Tap outside** or tap icon again to close

**Screenshot placeholder**: `screenshots/10-mobile-view.png`
```
[Show: Mobile layout with bottom tabs and responsive design]
```

---

## What You've Learned

In 5 minutes, you've learned to:

- ✅ Install and configure the dashboard
- ✅ View your TaskMaster tasks
- ✅ Expand/collapse subtask hierarchies
- ✅ Create and edit issues
- ✅ Search across tasks and issues
- ✅ Filter by status and priority
- ✅ Link issues to specific tasks

---

## Next Steps

### Explore More Features

- **[Task Viewer Guide](tasks.md)** - Deep dive into task features
- **[Issue Tracker Guide](issues.md)** - Advanced issue management
- **[Search & Filter Guide](search-filter.md)** - Power user search techniques

### Common Workflows

**Morning Standup Prep**:
```
1. Search: "" (empty)
2. Filter: Status = "done"
3. Review yesterday's completed tasks
```

**Finding Next Task**:
```
1. Search: "" (empty)
2. Filter: Status = "pending", Priority = "high"
3. Pick highest priority task to start
```

**Tracking Blockers**:
```
1. Search: "" (empty)
2. Filter: Status = "blocked"
3. Create issues for each blocker
```

**Critical Issues Review**:
```
1. Navigate to issue tracker
2. Filter: Severity = "critical", Status = "open"
3. Address urgent issues first
```

---

## Troubleshooting

### "Failed to load tasks" error

**Solution**: Check your `.env` file:
```bash
# Make sure this points to your project
PROJECT_ROOT=/correct/path/to/project

# Restart the server
npm run dev
```

### Tasks showing but issues not loading

**Solution**: Create the issues directory:
```bash
mkdir -p .taskmaster/issues
```

### Search not finding results

**Solution**:
- Try shorter keywords
- Check if filters are active (clear them)
- Verify spelling (fuzzy search has limits)

---

## Tips for Success

1. **Keep the dashboard open** while working with TaskMaster CLI
2. **Use auto-refresh** - data updates every 5 seconds
3. **Create issues immediately** when you hit blockers
4. **Link issues to tasks** for better organization
5. **Use filters** instead of scrolling through long lists

---

## Getting Help

- **Full Documentation**: [User Guide](README.md)
- **Report Issues**: GitHub Issues
- **Ask Questions**: GitHub Discussions

---

**Congratulations!** You're now ready to use TaskMaster Web Viewer productively. Explore the detailed guides to unlock more advanced features.

---

**Version**: 1.0 (Phase 1)
**Last Updated**: 2025-11-13
