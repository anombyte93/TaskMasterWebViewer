# Task Viewer Guide

> **Master the art of navigating and understanding your TaskMaster tasks in the web dashboard.**

This guide covers everything you need to know about viewing, exploring, and understanding tasks in the TaskMaster Web Viewer.

---

## Table of Contents

1. [Task Card Anatomy](#task-card-anatomy)
2. [Status System](#status-system)
3. [Priority System](#priority-system)
4. [Subtask Navigation](#subtask-navigation)
5. [Progress Tracking](#progress-tracking)
6. [Task Dependencies](#task-dependencies)
7. [Task IDs](#task-ids)
8. [Best Practices](#best-practices)

---

## Task Card Anatomy

Every task is displayed as a card with multiple components. Understanding each part helps you quickly assess task status.

### Card Structure

```
┌─────────────────────────────────────────────┐
│ [1] ◄── Task ID Badge                      │
│                                             │
│ Implement User Authentication              │ ◄── Title
│                                             │
│ Set up JWT-based authentication system     │ ◄── Description
│ with bcrypt password hashing and...        │     (max 2 lines)
│                                             │
│ [In Progress] [High] 3/5 subtasks          │ ◄── Metadata
│                                             │
│ ████████░░░░░░░ 60%                         │ ◄── Progress Bar
│                                             │
│                                    [▼]      │ ◄── Expand Chevron
└─────────────────────────────────────────────┘
│ Colored Left Border (status indicator)
```

### Component Breakdown

**1. Status Indicator (Left Border)**
- Vertical colored bar on the left edge
- Color indicates task status at a glance
- Always visible, even when skimming

**2. Task ID Badge**
- Monospace font for readability
- Located top-left corner
- Format: Number (e.g., `1`, `2`, `15`) or dotted (e.g., `1.2`, `3.1`)
- Gray background with rounded corners

**3. Task Title**
- Bold font weight for hierarchy
- 16px font size (base)
- Full title always visible (no truncation)

**4. Task Description**
- Regular font weight
- 14px font size (smaller)
- Muted color (lighter gray)
- Truncated to 2 lines with ellipsis (...)
- Hover to see full text (planned feature)

**5. Metadata Row**
- Status badge (colored pill)
- Priority badge (colored pill)
- Subtask count (plain text)
- All aligned horizontally

**6. Progress Bar**
- Only shown for tasks with subtasks
- Green segment = completed subtasks
- Gray segment = remaining subtasks
- Percentage displayed at end

**7. Expand Chevron**
- Only shown for tasks with subtasks
- Rotates 180° when expanded
- 44×44px touch target (mobile-friendly)

**Screenshot placeholder**: `screenshots/tasks/01-card-anatomy-labeled.png`
```
[Show: Task card with arrows pointing to each component and labels]
```

---

## Status System

Tasks can be in one of six states. Each status has a unique color for visual identification.

### Status Types

| Status | Color | Border | Badge | Meaning |
|--------|-------|--------|-------|---------|
| **Pending** | Gray | `bg-gray-400` | Gray pill | Ready to start, not begun |
| **In Progress** | Blue | `bg-blue-500` | Blue pill | Currently being worked on |
| **Done** | Green | `bg-green-500` | Green pill | Completed and verified |
| **Blocked** | Red | `bg-red-500` | Red pill | Cannot proceed (dependency/issue) |
| **Deferred** | Yellow | `bg-yellow-500` | Yellow pill | Postponed to later |
| **Cancelled** | Dark Gray | `bg-gray-500` | Gray pill | No longer needed |

### Visual Identification

**At a glance**:
- **Left border color** is your fastest indicator
- **Badge color** confirms the status
- **Badge text** provides explicit status name

**Status Badge Format**:
- Uppercase text (e.g., "IN PROGRESS")
- Rounded pill shape
- Colored background matching border
- Semi-transparent effect

**Screenshot placeholder**: `screenshots/tasks/02-status-badges-all.png`
```
[Show: Six task cards side-by-side, each with a different status]
```

### Status Meanings in Context

**Pending**
- Task is ready to be worked on
- All dependencies met (or no dependencies)
- Waiting for someone to pick it up

**In Progress**
- Someone is actively working on this task
- May have partial implementation
- Use this when you start coding

**Done**
- Task fully completed
- Code written, tested, and merged
- No further work needed

**Blocked**
- Cannot proceed due to external factor
- Waiting on another task, person, or resource
- Create an issue to track the blocker

**Deferred**
- Intentionally postponed
- Not urgent or deprioritized
- Will be revisited later

**Cancelled**
- Task no longer relevant
- Requirements changed
- Won't be implemented

---

## Priority System

Priorities help you decide what to work on next. Not all tasks have priorities set.

### Priority Levels

| Priority | Color | Badge | When to Use |
|----------|-------|-------|-------------|
| **High** | Red | Red pill | Critical path, blocking others, urgent |
| **Medium** | Yellow | Yellow pill | Important but not blocking, standard work |
| **Low** | Blue | Blue pill | Nice to have, polish, non-critical |

### Priority Badge Design

**Format**:
- Uppercase text (e.g., "HIGH")
- Rounded pill shape
- Colored background with border
- Slightly smaller than status badges

**If No Priority**:
- No badge displayed
- Defaults to medium priority implicitly
- TaskMaster CLI doesn't require priority field

**Screenshot placeholder**: `screenshots/tasks/03-priority-badges.png`
```
[Show: Three tasks with high/medium/low priorities side-by-side]
```

### Priority Best Practices

**High Priority**:
```
Use for:
- Blocking other team members
- Production bugs
- Security issues
- Deadline-critical work
```

**Medium Priority**:
```
Use for:
- Standard feature work
- Planned refactoring
- Non-blocking improvements
- Most tasks fall here
```

**Low Priority**:
```
Use for:
- Code cleanup
- Documentation updates
- Nice-to-have features
- Performance optimizations (non-critical)
```

---

## Subtask Navigation

Tasks can contain subtasks, creating a hierarchy. The dashboard makes navigating this hierarchy smooth and intuitive.

### Identifying Tasks with Subtasks

**Visual cues**:
1. **Chevron icon (▼)** appears on the right side
2. **Subtask count** displayed in metadata (e.g., "3/5 subtasks")
3. **Progress bar** shown below metadata

**Screenshot placeholder**: `screenshots/tasks/04-task-with-subtasks.png`
```
[Show: Task card with chevron, subtask count, and progress bar highlighted]
```

### Expanding Subtasks

**To expand**:
1. Click the **chevron icon** on the right
2. OR click anywhere on the card (planned feature)

**Animation**:
- Smooth accordion expand (200ms duration)
- Subtasks slide down below parent card
- Chevron rotates 180° to point up

**Screenshot placeholder**: `screenshots/tasks/05-subtask-expansion-animation.png`
```
[Show: Before/after of task expansion, side-by-side]
```

### Subtask Display

**Visual hierarchy**:
- **Left border** (2px) connects subtasks to parent
- **Indentation** (32px padding-left) shows nesting
- **Background color** (muted gray) differentiates from parent
- **Compact cards** (less padding) save space

**Subtask card shows**:
1. Subtask ID (e.g., `1.1`, `1.2`, `1.3`)
2. Subtask title (smaller font)
3. Subtask description (truncated to 1 line)
4. Status badge (smaller size)
5. Priority badge (if set, smaller size)

**Screenshot placeholder**: `screenshots/tasks/06-subtask-cards-expanded.png`
```
[Show: Task card with 3-4 subtasks fully expanded]
```

### Collapsing Subtasks

**To collapse**:
1. Click the **chevron icon** (now pointing up ▲)
2. Subtasks slide up with animation
3. Chevron rotates back to pointing down

**State persistence**:
- Expansion state NOT saved (resets on page reload)
- Planned feature: Remember expanded state in localStorage

### Nested Subtasks

**Current limitation**: Dashboard shows two levels only:
- Main task (e.g., `1`)
- Subtasks (e.g., `1.1`, `1.2`)
- Sub-subtasks (e.g., `1.1.1`) are flattened

**Reason**: Keeps UI simple and prevents deep nesting complexity.

**Planned feature**: Show sub-subtasks with additional indentation in Phase 2.

---

## Progress Tracking

For tasks with subtasks, the dashboard calculates and displays completion progress.

### Progress Bar Anatomy

```
████████████░░░░░░░░░░ 60%
│           │         │
Green       Gray      Percentage
(completed) (remaining)
```

**Components**:
1. **Green segment**: Completed subtasks (status = "done")
2. **Gray segment**: Remaining subtasks (any other status)
3. **Percentage**: Numeric completion rate

**Calculation**:
```
progress = (completed_subtasks / total_subtasks) × 100
completed_subtasks = count where status === "done"
```

**Screenshot placeholder**: `screenshots/tasks/07-progress-bars.png`
```
[Show: Tasks with various progress levels: 0%, 33%, 50%, 100%]
```

### Progress Interpretation

**0% (No green)**:
- No subtasks completed yet
- Task just started or planning phase
- All subtasks pending/in-progress

**1-99% (Partial green)**:
- Some subtasks done, some remaining
- Active development in progress
- Good indicator of momentum

**100% (Full green)**:
- All subtasks marked as done
- Parent task likely done (verify status badge)
- Ready for final review/merge

### Subtask Count Display

**Format**: `X/Y subtasks`
- X = completed subtasks (status = "done")
- Y = total subtasks

**Examples**:
- `0/5 subtasks` - None completed
- `3/5 subtasks` - Three of five done
- `5/5 subtasks` - All completed

**Location**: In metadata row, after status and priority badges

**Screenshot placeholder**: `screenshots/tasks/08-subtask-counts.png`
```
[Show: Task cards with various subtask counts: 0/3, 2/5, 8/8]
```

### Progress Best Practices

**Interpreting Progress**:
```
< 25%:  Just started, long way to go
25-50%: Making good progress
50-75%: More than halfway, approaching completion
75-99%: Almost done, final touches
100%:   Complete, ready to mark parent as done
```

**When Parent Task Shows 100%**:
- Verify all subtasks truly complete
- Consider marking parent task status as "done"
- Update TaskMaster CLI: `task-master set-status --id=1 --status=done`

---

## Task Dependencies

Tasks can depend on other tasks. Dependencies affect work order and task readiness.

### Current Limitation

**Phase 1**: Dependencies are NOT displayed in the dashboard.
- Stored in `tasks.json` under `dependencies` field
- Not shown on task cards
- Planned for Phase 2

### Viewing Dependencies

**Workaround**:
1. Use TaskMaster CLI: `task-master show <id>`
2. Look for "Dependencies" field in CLI output
3. Note which tasks must be completed first

### Understanding Dependency Logic

**Blocked Status**:
- If task status is "blocked", it may be waiting on dependencies
- Check CLI output or tasks.json for dependency list
- Create an issue to track the blocker

**Planned Features** (Phase 2):
- Dependency graph visualization
- Highlight dependent tasks when hovering
- Show "Waiting on: Task 1, Task 3" label
- Dependency validation warnings

---

## Task IDs

Understanding task IDs helps you reference tasks accurately.

### ID Format

**Main tasks**: Single number
```
1, 2, 3, 4, ..., 99, 100
```

**Subtasks**: Parent ID + dot + subtask number
```
1.1, 1.2, 1.3
2.1, 2.2
15.1, 15.2, 15.3
```

**Sub-subtasks**: Parent ID + dot + sub ID + dot + number
```
1.1.1, 1.1.2
3.2.1, 3.2.2, 3.2.3
```

**Note**: Dashboard currently flattens sub-subtasks to show only two levels.

### ID Display

**Monospace Font**:
- Task IDs use JetBrains Mono or system monospace
- Easier to distinguish similar-looking digits (0 vs O, 1 vs l)

**Badge Style**:
- Small rounded rectangle
- Gray background
- Positioned top-left of card
- Always visible (not truncated)

**Screenshot placeholder**: `screenshots/tasks/09-task-id-examples.png`
```
[Show: Task cards with various ID formats: 1, 15, 1.2, 10.5, 100.1]
```

### Using Task IDs

**Linking Issues**:
```
When creating an issue:
Related Task ID: 1.2

Result: Issue card shows "Task 1.2 →" link
```

**CLI References**:
```bash
# View specific task
task-master show 1.2

# Update task
task-master update-task --id=1.2 --prompt="changes"

# Mark complete
task-master set-status --id=1.2 --status=done
```

**Search by ID**:
```
Type "1.2" in search bar
Result: Shows task 1.2 (exact match)
```

---

## Best Practices

### Efficient Task Navigation

**1. Use Status Filters for Context Switching**
```
Morning: Filter by "in-progress" to continue yesterday's work
Afternoon: Filter by "pending" + "high" to pick next task
End of day: Filter by "done" to review accomplishments
```

**2. Expand Subtasks Strategically**
```
Don't expand all tasks at once (clutters view)
Expand only the task you're actively working on
Collapse when switching to different task
```

**3. Leverage Progress Bars**
```
Quickly scan for tasks near completion (>75%)
Focus on finishing high-progress tasks before starting new ones
Use progress to estimate remaining effort
```

**4. Combine Search + Filters**
```
Search: "authentication"
Filter: Status = "in-progress"
Result: Find your in-progress auth work instantly
```

### Task Management Workflow

**Morning Standup**:
```
1. Filter: Status = "done"
2. Review completed tasks from yesterday
3. Note accomplishments for standup meeting
4. Clear filter
5. Filter: Status = "in-progress"
6. Identify today's focus areas
```

**Starting New Task**:
```
1. Filter: Status = "pending", Priority = "high"
2. Pick highest priority pending task
3. Expand subtasks to understand scope
4. Use TaskMaster CLI to mark as in-progress
5. Create issue if blockers exist
```

**Tracking Blockers**:
```
1. Filter: Status = "blocked"
2. For each blocked task, create an issue:
   - Title: "Blocker: [reason]"
   - Severity: High or Critical
   - Related Task ID: [blocked task]
3. Track resolution in issue tracker
```

**End-of-Day Review**:
```
1. Filter: Status = "in-progress"
2. Update TaskMaster CLI with progress notes:
   task-master update-subtask --id=X --prompt="What I accomplished"
3. Mark completed subtasks as done
4. Identify tomorrow's starting point
```

### Keyboard Navigation Tips

**Tab Navigation**:
```
Tab key moves through:
1. Search bar
2. Filter buttons
3. Expand chevrons
4. Issue tracker (sidebar)
```

**Quick Filter Access**:
```
Tab to "Status" button
Press Enter to open
Arrow keys to navigate options
Space to toggle checkbox
Escape to close
```

---

## Common Questions

**Q: Why can't I edit task titles?**
A: Tasks are read-only in the dashboard. TaskMaster CLI is the source of truth. Use `task-master update-task` to modify tasks.

**Q: How do I mark a task as complete?**
A: Use TaskMaster CLI: `task-master set-status --id=1 --status=done`

**Q: Can I reorder tasks?**
A: Not in Phase 1. Use TaskMaster CLI: `task-master move --from=1 --to=3`

**Q: Why don't I see sub-subtasks?**
A: Phase 1 shows two levels only (task + subtasks). Sub-subtasks are flattened. Full hierarchy support planned for Phase 2.

**Q: How often do tasks refresh?**
A: Automatically every 5 seconds. You can also use pull-to-refresh on mobile.

**Q: What if a task has no priority?**
A: No badge is shown. The task implicitly has medium priority.

**Q: Can I filter by multiple statuses?**
A: Yes! Check multiple boxes in the Status filter menu. Tasks matching ANY selected status will be shown.

---

## Next Steps

- **[Issue Tracker Guide](issues.md)** - Learn to create and manage issues
- **[Search & Filter Guide](search-filter.md)** - Master advanced search techniques
- **[Quick Start Guide](quick-start.md)** - Review the basics

---

**Version**: 1.0 (Phase 1)
**Last Updated**: 2025-11-13
