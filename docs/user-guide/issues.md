# Issue Tracker Guide

> **Master issue creation, management, and workflow integration with tasks.**

This comprehensive guide covers the issue tracking system in TaskMaster Web Viewer, including creation, editing, organization, and best practices.

---

## Table of Contents

1. [Issue Tracker Overview](#issue-tracker-overview)
2. [Creating Issues](#creating-issues)
3. [Issue Anatomy](#issue-anatomy)
4. [Severity Levels](#severity-levels)
5. [Issue Status](#issue-status)
6. [Linking Issues to Tasks](#linking-issues-to-tasks)
7. [Editing and Deleting Issues](#editing-and-deleting-issues)
8. [Issue Organization](#issue-organization)
9. [Workflows and Best Practices](#workflows-and-best-practices)

---

## Issue Tracker Overview

The issue tracker is located in the **right sidebar** (desktop) or **bottom tab** (mobile). It provides a dedicated space for tracking bugs, blockers, questions, and technical debt.

### What Issues Are For

**Use issues to track**:
- 🐛 **Bugs**: Code defects that need fixing
- 🚧 **Blockers**: Dependencies preventing task completion
- ❓ **Questions**: Clarifications needed before proceeding
- 💡 **Ideas**: Potential improvements or features
- 📝 **Tech Debt**: Code quality issues to address
- ⚠️ **Risks**: Potential problems to monitor

**Don't use issues for**:
- Task management (use TaskMaster CLI for tasks)
- Long-term project planning (use PRDs)
- Completed work tracking (use task status)

### Issue Tracker Location

**Desktop (1024px+)**:
- Right sidebar (30% width)
- Always visible alongside task list
- Scrollable independently from tasks

**Tablet (768-1023px)**:
- Collapsible right sidebar
- Toggle with hamburger menu (☰)
- Overlays task list when open

**Mobile (<768px)**:
- Bottom tab bar navigation
- Switch between "Tasks" and "Issues" tabs
- Full-screen view for each

**Screenshot placeholder**: `screenshots/issues/01-issue-tracker-locations.png`
```
[Show: Three views side-by-side - desktop, tablet, mobile layouts]
```

---

## Creating Issues

Issues can be created quickly with a simple form. The form validates inputs to ensure data quality.

### Opening the Create Form

**Method 1: "+ New Issue" Button**
1. Look for **"+ New Issue"** button at top of issue tracker
2. Click to open creation modal
3. Form appears as overlay with backdrop

**Method 2: Keyboard Shortcut** (Planned)
- Press `N` key anywhere in dashboard
- Form opens immediately

**Screenshot placeholder**: `screenshots/issues/02-new-issue-button.png`
```
[Show: Issue tracker header with "+ New Issue" button highlighted]
```

### Issue Creation Form

**Form fields**:

1. **Title** (required)
   - Short, descriptive headline
   - Max length: 200 characters
   - Example: "Login form validation bug"

2. **Description** (required)
   - Detailed explanation
   - Supports markdown (planned)
   - Example: "Email validation fails for addresses with '+' character"

3. **Severity** (required)
   - Select from dropdown: Critical, High, Medium, Low
   - Default: Medium
   - See [Severity Levels](#severity-levels) for guidance

4. **Status** (required)
   - Select from dropdown: Open, In Progress, Resolved
   - Default: Open
   - See [Issue Status](#issue-status) for meanings

5. **Related Task ID** (optional)
   - Link issue to a specific task
   - Format: `1`, `1.2`, `15.3`, etc.
   - Creates clickable link on issue card

6. **Tags** (optional, Phase 2 feature)
   - Comma-separated keywords
   - Example: "authentication, security, validation"
   - Used for filtering and search

7. **Attachments** (optional, Phase 2 feature)
   - Upload screenshots or logs
   - Drag-and-drop support
   - Max 5MB per file

**Screenshot placeholder**: `screenshots/issues/03-create-issue-form.png`
```
[Show: Issue creation modal with all fields labeled]
```

### Creating the Issue

**Steps**:
1. Fill in required fields (Title, Description, Severity, Status)
2. Optionally add Related Task ID
3. Click **"Create Issue"** button
4. Form validates inputs
5. Issue appears in tracker immediately
6. Success message confirms creation (subtle toast)

**Validation errors**:
- Empty title: "Title is required"
- Empty description: "Description is required"
- Invalid task ID: "Task ID not found"

**Screenshot placeholder**: `screenshots/issues/04-issue-created-success.png`
```
[Show: Issue tracker with newly created issue at the top, success toast visible]
```

---

## Issue Anatomy

Each issue card displays key information in a compact, scannable format.

### Issue Card Structure

```
┌─────────────────────────────────────┐
│ issue-1762959665747-p7xhh          │ ◄── Issue ID (monospace)
│                                     │
│ Login form validation bug          │ ◄── Title (max 2 lines)
│                                     │
│ [OPEN] [HIGH]                      │ ◄── Status & Severity badges
│                                     │
│ Task 1.2 →                         │ ◄── Related task link (if set)
│                                     │
│ 2 hours ago                        │ ◄── Timestamp
└─────────────────────────────────────┘
│ Left border color = severity
```

### Component Breakdown

**1. Severity Indicator (Left Border)**
- Thicker left border (4px) colored by severity
- Critical = Red, High = Orange, Medium = Yellow, Low = Blue
- Fastest visual identifier

**2. Issue ID**
- Monospace font for readability
- Format: `issue-<timestamp>-<random>`
- Unique identifier for referencing

**3. Title**
- Bold font for emphasis
- Max 2 lines with ellipsis
- Click card to see full title

**4. Status Badge**
- Colored pill: Open (blue), In Progress (purple), Resolved (green)
- Uppercase text
- Positioned before severity badge

**5. Severity Badge**
- Colored pill based on severity level
- Uppercase text
- Uses same badge component as status

**6. Related Task Link**
- Only shown if issue linked to task
- Format: "Task [ID] →"
- Clicking navigates to that task (scrolls + highlights)

**7. Timestamp**
- Relative time format (e.g., "2 hours ago", "3 days ago")
- Updates automatically
- Uses `date-fns` library for human-friendly formatting

**Screenshot placeholder**: `screenshots/issues/05-issue-card-anatomy.png`
```
[Show: Issue card with arrows pointing to each component and labels]
```

---

## Severity Levels

Severity indicates how critical an issue is. Choose the appropriate level to help prioritize work.

### Severity Types

| Severity | Color | Border | When to Use |
|----------|-------|--------|-------------|
| **Critical** | Red | Red (4px left) | Production down, data loss, security breach |
| **High** | Orange | Orange (4px left) | Major feature broken, blocking multiple tasks |
| **Medium** | Yellow | Yellow (4px left) | Partial feature broken, workaround exists |
| **Low** | Blue | Blue (4px left) | Minor bug, cosmetic issue, enhancement |

**Screenshot placeholder**: `screenshots/issues/06-severity-levels.png`
```
[Show: Four issue cards stacked, each with different severity level]
```

### Severity Decision Guide

**Critical (Use sparingly!)**
```
Criteria:
- Production system is down or unusable
- Data corruption or security vulnerability
- Affects all users immediately
- No workaround available

Examples:
- "Database connection failing in production"
- "User data exposed via API vulnerability"
- "Payment processing completely broken"

Action: Drop everything, fix immediately
```

**High**
```
Criteria:
- Major feature completely broken
- Affects many users
- Limited or difficult workaround
- Blocking other developers

Examples:
- "Authentication broken for OAuth users"
- "API endpoint returning 500 errors"
- "Cannot deploy due to build failure"

Action: Fix within 24 hours
```

**Medium**
```
Criteria:
- Partial feature broken
- Affects some users
- Workaround exists
- Not blocking critical path

Examples:
- "Search results show duplicates"
- "Form validation allows invalid emails"
- "Mobile layout broken on specific screen size"

Action: Fix within 1 week
```

**Low**
```
Criteria:
- Minor issue with minimal impact
- Cosmetic or edge case
- Enhancement or improvement
- Technical debt

Examples:
- "Button hover effect inconsistent"
- "Loading spinner alignment off by 2px"
- "Could use better variable naming in auth.ts"

Action: Fix when convenient
```

### Changing Severity

Severity can be updated as you learn more:

1. Click issue card to open detail view
2. Click **"Edit"** button
3. Change severity dropdown
4. Click **"Save"**
5. Left border color updates immediately

**Common adjustments**:
- Medium → High (issue worse than expected)
- High → Critical (issue went to production)
- Low → Medium (more users affected)

---

## Issue Status

Issue status tracks the lifecycle from identification to resolution.

### Status Types

| Status | Color | Badge | Meaning |
|--------|-------|-------|---------|
| **Open** | Blue | Blue pill | Newly created, not started |
| **In Progress** | Purple | Purple pill | Someone is working on it |
| **Resolved** | Green | Green pill | Fixed and verified |

**Note**: Unlike tasks (6 statuses), issues have only 3 statuses for simplicity.

**Screenshot placeholder**: `screenshots/issues/07-issue-statuses.png`
```
[Show: Three issue cards with open, in-progress, and resolved statuses]
```

### Status Workflow

**Typical lifecycle**:
```
Open → In Progress → Resolved
```

**Status meanings**:

**Open**
- Issue reported but not yet addressed
- Waiting for someone to pick it up
- May need triage or more information

**In Progress**
- Developer actively investigating or fixing
- Partial fix may be implemented
- Testing in progress

**Resolved**
- Fix implemented and verified
- Tests pass
- Issue closed

### Status Best Practices

**When to use "Open"**:
```
✓ Just discovered the issue
✓ Documented but not triaged
✓ Waiting for priority assignment
✓ No one assigned yet
```

**When to use "In Progress"**:
```
✓ You start investigating
✓ Writing fix or tests
✓ Debugging the issue
✓ Testing a solution
```

**When to use "Resolved"**:
```
✓ Fix merged to main branch
✓ Tests pass
✓ Verified in staging/production
✓ Issue no longer occurs
```

**Avoid premature "Resolved"**:
```
✗ Fix written but not tested
✗ Fix in PR but not merged
✗ Fix deployed but not verified
✗ Issue might reoccur
```

---

## Linking Issues to Tasks

Connecting issues to specific tasks provides context and helps with organization.

### Why Link Issues to Tasks?

**Benefits**:
- Track which task is blocked by the issue
- Jump directly from issue to related task
- Understand issue context from task description
- Filter issues by related task

**Use cases**:
- Task is blocked by external dependency (create blocker issue)
- Bug discovered while implementing task (create bug issue)
- Technical debt identified in task scope (create debt issue)

### How to Link Issues

**Method 1: During Creation**
1. In issue creation form, find "Related Task ID" field
2. Enter task ID (e.g., `1`, `1.2`, `15.3`)
3. Dashboard validates task exists
4. Click "Create Issue"
5. Issue card shows "Task [ID] →" link

**Method 2: Edit Existing Issue**
1. Click issue card to open detail view
2. Click "Edit" button
3. Enter task ID in "Related Task ID" field
4. Click "Save"
5. Link appears on issue card

**Screenshot placeholder**: `screenshots/issues/08-link-issue-to-task.png`
```
[Show: Issue creation form with Related Task ID field filled in]
```

### Clicking Related Task Links

When you click "Task 1.2 →" on an issue card:

1. **Page scrolls** to the task (if in filtered view)
2. **Task highlights** with subtle animation (planned)
3. **Subtasks expand** if task has them (planned)
4. Focus returns to task list

**Note**: If task is filtered out, clicking link shows notification: "Task not visible with current filters. Clear filters to view."

**Screenshot placeholder**: `screenshots/issues/09-related-task-link.png`
```
[Show: Issue card with "Task 1.2 →" link highlighted, arrow pointing to corresponding task card]
```

### Unlinking Issues from Tasks

**To remove link**:
1. Click issue card to open detail view
2. Click "Edit" button
3. Clear "Related Task ID" field (delete text)
4. Click "Save"
5. Link disappears from issue card

---

## Editing and Deleting Issues

Issues can be fully edited or deleted as needed. Unlike tasks (read-only), issues are fully managed by the dashboard.

### Editing an Issue

**Steps**:
1. **Click issue card** to open detail modal
2. **Click "Edit" button** (top-right of modal)
3. **Form switches to edit mode** with current values
4. **Modify any fields**:
   - Title
   - Description
   - Severity
   - Status
   - Related Task ID
   - Tags (Phase 2)
5. **Click "Save"** to commit changes
6. **OR click "Cancel"** to discard changes

**Screenshot placeholder**: `screenshots/issues/10-edit-issue-form.png`
```
[Show: Issue detail modal in edit mode with form fields editable]
```

### Real-Time Updates

**Changes appear immediately**:
- Issue card updates in tracker
- No page reload needed
- Other users see changes on next refresh (5s)

**Visual feedback**:
- Success toast: "Issue updated successfully"
- Loading state during save
- Error message if save fails

### Deleting an Issue

**Steps**:
1. **Click issue card** to open detail modal
2. **Click "Delete" button** (bottom-right, red)
3. **Confirmation dialog appears**: "Are you sure you want to delete this issue?"
4. **Click "Delete" to confirm**, or "Cancel" to abort
5. **Issue removed from tracker** immediately
6. **File deleted** from `.taskmaster/issues/` directory

**Screenshot placeholder**: `screenshots/issues/11-delete-confirmation.png`
```
[Show: Delete confirmation dialog with "Delete" and "Cancel" buttons]
```

### Important Notes

**Deletion is permanent**:
- No undo functionality (planned for Phase 2)
- Issue file removed from filesystem
- Cannot be recovered without backup

**Before deleting**:
- Consider changing status to "Resolved" instead
- Resolved issues maintain history
- Deletion should be for mistakes or duplicates

---

## Issue Organization

Effective issue organization helps you stay on top of bugs and blockers.

### Filtering Issues

**Severity Filter** (in issue tracker section):
1. Click "Severity" button
2. Check one or more severity levels
3. Issues filter to selected severities
4. Badge count shows active filters

**Status Filter** (in issue tracker section):
1. Click "Status" button (if available in issue section)
2. Check desired statuses
3. Only matching issues shown

**Combined Filtering**:
```
Example: Show critical open issues
- Severity: Critical
- Status: Open
Result: Urgent issues needing immediate attention
```

**Screenshot placeholder**: `screenshots/issues/12-issue-filters.png`
```
[Show: Issue tracker with severity filter popover open and checkboxes]
```

### Searching Issues

**Using main search bar**:
- Type keyword in search bar at top
- Searches issue titles AND descriptions
- Fuzzy matching (handles typos)
- Results update in real-time

**Search tips**:
```
"auth" → finds "Authentication bug", "OAuth issues"
"validation" → finds form validation issues
"prod" → finds production-related issues
```

### Sorting Issues

**Default sort**: Newest first (by `createdAt` timestamp)

**Custom sorting** (Planned Phase 2):
- By severity (Critical → Low)
- By status (Open → Resolved)
- By last updated
- By related task ID

### Issue Count Indicators

**Total count**: Shown in issue tracker header
```
Issues (12)
```

**Filtered count**: Updates when filters applied
```
Issues (3 of 12)
```

---

## Workflows and Best Practices

### Daily Issue Management

**Morning Review**:
```
1. Filter: Severity = "critical" or "high", Status = "open"
2. Triage new issues
3. Update status for issues you'll work on today
4. Link issues to tasks if not already linked
```

**During Development**:
```
1. Hit a blocker? Create issue immediately:
   - Title: Clear description of blocker
   - Severity: High (if blocking progress)
   - Related Task ID: Current task
   - Status: Open
2. Mark as "In Progress" when investigating
3. Mark as "Resolved" when unblocked
```

**End-of-Day Cleanup**:
```
1. Filter: Status = "in-progress"
2. Update issue descriptions with findings
3. Change to "resolved" if fixed
4. Keep as "in-progress" if continuing tomorrow
```

### Issue Categories by Severity

**Critical Workflow**:
```
1. Create issue immediately
2. Notify team (don't rely on dashboard alone)
3. Stop current work
4. Link to affected task
5. Update status frequently
6. Verify fix in production before marking resolved
```

**High Workflow**:
```
1. Create issue with detailed description
2. Link to blocked task
3. Set task status to "blocked" in TaskMaster CLI
4. Work on other tasks while investigating
5. Update issue with findings
6. Resolve and unblock task when fixed
```

**Medium/Low Workflow**:
```
1. Create issue for tracking
2. Add to backlog (no immediate action)
3. Batch similar issues together
4. Address during dedicated bug fix time
5. Resolve when convenient
```

### Common Issue Patterns

**Bug Pattern**:
```
Title: "[Bug] Feature doesn't work in Edge browser"
Severity: Medium
Status: Open
Related Task: 3.2 (where bug discovered)
Description: Detailed repro steps, expected vs actual behavior
```

**Blocker Pattern**:
```
Title: "Waiting on API key from DevOps"
Severity: High
Status: Open
Related Task: 5.1 (blocked task)
Description: What you need, who you're waiting on, deadline
```

**Tech Debt Pattern**:
```
Title: "Refactor auth service for testability"
Severity: Low
Status: Open
Related Task: 1.2 (where debt exists)
Description: Why refactor needed, proposed approach
```

**Question Pattern**:
```
Title: "Should we use JWT or sessions for auth?"
Severity: Medium
Status: Open
Related Task: 1 (authentication task)
Description: Context, options considered, decision criteria
```

### Issue Lifecycle Best Practices

**Issue Creation**:
```
✓ Use descriptive titles (not "bug" or "fix this")
✓ Provide reproduction steps for bugs
✓ Link to related task if applicable
✓ Set severity appropriately (don't over-escalate)
✓ Use clear, professional language
```

**Issue Updates**:
```
✓ Update status when work begins
✓ Add notes as you investigate
✓ Change severity if impact changes
✓ Keep related task ID accurate
✓ Mark resolved only when verified
```

**Issue Resolution**:
```
✓ Verify fix actually works
✓ Ensure tests pass
✓ Update related task status if unblocked
✓ Document solution in issue description
✓ Keep resolved issues (don't delete)
```

### Team Collaboration with Issues

**Handoffs**:
```
Scenario: You can't fix an issue yourself

1. Create issue with detailed context
2. Set severity appropriately
3. Add notes: "Needs expertise in [area]"
4. Link to task that's blocked
5. Notify team member via other channel
6. They update status to "In Progress"
7. They add updates as they investigate
8. You verify fix when they mark "Resolved"
```

**Status Meetings**:
```
Standup prep:
1. Filter: Status = "in-progress", related to you
2. Review for updates to share
3. Note blockers (high severity, open status)

Sprint planning:
1. Filter: Severity = "high", Status = "open"
2. Prioritize high-severity issues
3. Link to sprint tasks
```

---

## Common Questions

**Q: Can I assign issues to people?**
A: Not in Phase 1. Use status "In Progress" to indicate someone is working on it. Assignment feature planned for Phase 2.

**Q: Can I add comments to issues?**
A: Not yet. Edit the description to add notes for now. Comment thread feature planned for Phase 2.

**Q: What if I link to a non-existent task ID?**
A: Form validation will show an error. Issue won't be created until you fix the ID.

**Q: Can I filter issues by related task?**
A: Not in Phase 1. Use search bar to find task ID (e.g., search "1.2"). Planned for Phase 2.

**Q: How many issues can I create?**
A: No hard limit. Performance tested up to 1000 issues without lag.

**Q: Can I export issues to CSV/JSON?**
A: Issues are stored as JSON files in `.taskmaster/issues/`. You can process them with scripts. UI export planned for Phase 2.

**Q: Do issues sync across devices?**
A: If `.taskmaster/` is in version control (Git), issues sync when you pull changes. Otherwise, they're local only.

---

## Next Steps

- **[Search & Filter Guide](search-filter.md)** - Master advanced filtering techniques
- **[Task Viewer Guide](tasks.md)** - Learn about task features
- **[Quick Start Guide](quick-start.md)** - Review the basics

---

**Version**: 1.0 (Phase 1)
**Last Updated**: 2025-11-13
