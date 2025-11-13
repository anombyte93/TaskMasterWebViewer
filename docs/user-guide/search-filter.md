# Search & Filter Guide

> **Become a search power user and master advanced filtering techniques.**

This guide covers everything you need to know about searching and filtering in TaskMaster Web Viewer, from basic queries to advanced power user techniques.

---

## Table of Contents

1. [Search Bar Basics](#search-bar-basics)
2. [Fuzzy Search](#fuzzy-search)
3. [Filter System](#filter-system)
4. [Combining Search and Filters](#combining-search-and-filters)
5. [Advanced Techniques](#advanced-techniques)
6. [Performance Tips](#performance-tips)
7. [Common Workflows](#common-workflows)

---

## Search Bar Basics

The search bar is your primary tool for quickly finding specific tasks or issues.

### Search Bar Location

**Desktop/Tablet**:
- Top of main content area
- Above filter buttons
- Full width of task list section

**Mobile**:
- Top of screen (below header)
- Full width
- Sticky position (scrolls with content)

**Screenshot placeholder**: `screenshots/search/01-search-bar-location.png`
```
[Show: Dashboard with search bar highlighted in desktop, tablet, and mobile views]
```

### Basic Search

**How to search**:
1. **Click search bar** (or press `/` - planned feature)
2. **Type your query** (e.g., "authentication")
3. **Results filter instantly** as you type
4. **Clear search** by clicking X button or deleting text

**What gets searched**:
- Task titles
- Task descriptions
- Issue titles
- Issue descriptions
- Tags (when implemented in Phase 2)

**Screenshot placeholder**: `screenshots/search/02-basic-search-typing.png`
```
[Show: Search bar with "auth" typed in, showing filtered results below]
```

### Search Input Features

**Placeholder text**:
```
"Search tasks and issues..."
```
Reminds you that search covers both entities.

**Clear button (X)**:
- Appears when text is entered
- Click to clear search instantly
- Keyboard shortcut: Escape key

**Loading indicator**:
- Shown briefly for large datasets (>500 items)
- Debounced to prevent excessive filtering

### Real-Time Filtering

**Instant results**:
- Results update as you type
- No need to press Enter
- Debounced by 150ms for performance
- Smooth, responsive experience

**Empty states**:
- No matches: "No tasks or issues found"
- Empty search: Shows all items
- Filtered out: "No results match your filters"

**Screenshot placeholder**: `screenshots/search/03-no-results-state.png`
```
[Show: Search bar with query that returns no results, empty state message visible]
```

---

## Fuzzy Search

Fuzzy search allows matches even with typos or partial words. It uses the Fuse.js library for intelligent matching.

### How Fuzzy Search Works

**Matching algorithm**:
1. Exact matches: Highest priority
2. Prefix matches: "auth" matches "authentication"
3. Word boundary matches: "user auth" matches "user authentication"
4. Fuzzy matches: Handles typos and misspellings

**Threshold**: Configured at 0.3 (lower = stricter)

**Example matches**:
```
Query: "authen"
Matches: "authentication", "authenticated", "authenticator"

Query: "uset"
Matches: "user", "users", "usertable"

Query: "logins"
Matches: "login", "login form", "OAuth login"
```

**Screenshot placeholder**: `screenshots/search/04-fuzzy-matching.png`
```
[Show: Search query with typo ("authntication") still finding results]
```

### Fuzzy Search Configuration

**Search fields** (ranked by importance):
1. **Title** (weight: 2.0) - Most important
2. **Description** (weight: 1.0) - Standard importance
3. **Tags** (weight: 1.5) - Above average (Phase 2)

**Keys searched**:
```javascript
// Tasks
- title
- description
- id (exact match only)

// Issues
- title
- description
- id (exact match only)
- tags (Phase 2)
```

### Search Limitations

**Does NOT search**:
- Status values (use filters instead)
- Priority values (use filters instead)
- Severity values (use filters instead)
- Dependencies
- Timestamps
- File attachments (Phase 2)

**Why?** These are better filtered using the filter system.

### Optimizing Fuzzy Search

**Tips for better results**:
```
✓ Use keywords (not full sentences)
✓ Try first few letters of a word
✓ Use multiple short words
✓ Don't worry about exact spelling
✗ Avoid overly generic terms ("the", "and", "is")
✗ Don't use boolean operators (AND, OR, NOT)
```

**Good queries**:
```
"auth bug"          → Finds authentication bugs
"api validation"    → Finds API validation issues
"mobile layout"     → Finds mobile layout tasks
"1.2"               → Finds task 1.2 (exact ID match)
```

**Poor queries**:
```
"the user"          → Too generic, many matches
"is broken"         → Matches too broadly
"fix this bug"      → Vague, use specific feature name
```

---

## Filter System

Filters complement search by narrowing results based on structured metadata.

### Available Filters

**Task Filters**:
- Status (6 options)
- Priority (3 options)

**Issue Filters** (in issue tracker section):
- Status (3 options)
- Severity (4 options)

**Global Filters** (in main content area):
- Applies to tasks only
- Issues have separate filters in sidebar

**Screenshot placeholder**: `screenshots/search/05-filter-buttons.png`
```
[Show: Filter bar with Status and Priority buttons, badge counters visible]
```

### Opening Filter Menus

**Desktop**:
1. Click "Status" or "Priority" button
2. Popover menu opens below button
3. Aligned to left edge of button

**Mobile**:
1. Tap filter button (44px touch target)
2. Popover appears (optimized for touch)
3. Larger touch targets inside menu

**Keyboard**:
1. Tab to filter button
2. Press Enter to open
3. Arrow keys to navigate options
4. Space to toggle checkboxes
5. Escape to close

**Screenshot placeholder**: `screenshots/search/06-filter-popover-open.png`
```
[Show: Status filter popover opened with checkboxes and labels]
```

### Filter Menu Contents

**Structure**:
```
┌─────────────────────────┐
│ Filter by Status        │ ◄── Header
│                         │
│ □ Pending              │ ◄── Checkbox + label
│ □ In Progress          │
│ ☑ Done                 │ ◄── Checked
│ □ Blocked              │
│ □ Deferred             │
│ □ Cancelled            │
└─────────────────────────┘
```

**Interactive elements**:
- **Checkbox**: Toggle filter on/off
- **Label**: Click to toggle (same as checkbox)
- **Row**: Hover state for better UX
- Keyboard accessible (Space to toggle)

### Multi-Select Filtering

**How multi-select works**:
- Check **multiple options** in a filter category
- Results show items matching **ANY** selected value (OR logic)
- Example: Status = [Pending, In Progress] shows pending OR in-progress tasks

**Example**:
```
Filter: Status
Selected: ☑ Pending, ☑ In Progress

Result: Shows tasks with status "pending" OR "in-progress"
Does NOT require tasks to have both statuses (impossible anyway)
```

**Screenshot placeholder**: `screenshots/search/07-multi-select-filters.png`
```
[Show: Filter menu with multiple checkboxes checked]
```

### Active Filter Badges

**Visual representation**:
- Selected filters appear as **badges** below filter buttons
- Each badge shows: Filter value + X button
- Badge color: Secondary (gray)
- Compact, easy to scan

**Badge format**:
```
[Pending] [X]
[High] [X]
```

**Screenshot placeholder**: `screenshots/search/08-active-filter-badges.png`
```
[Show: Filter bar with active badges displayed, X buttons visible]
```

### Removing Filters

**Method 1: Badge X Button**
1. Click **X** on individual badge
2. That filter value is removed
3. Results update immediately

**Method 2: Clear All Button**
1. Appears when any filters are active
2. Click **"Clear all"** to reset
3. All filters removed at once

**Method 3: Uncheck in Menu**
1. Open filter popover
2. Uncheck option
3. Menu stays open (can adjust multiple)
4. Click outside to close

**Screenshot placeholder**: `screenshots/search/09-clear-all-button.png`
```
[Show: "Clear all" button highlighted, with several active filter badges]
```

### Filter Counter Badges

**Badge count indicator**:
- Small circular badge on filter button
- Shows number of active filters in that category
- Example: "Status [2]" means 2 status filters active

**Visual design**:
- Gray background
- White text
- Positioned top-right of button label

**Screenshot placeholder**: `screenshots/search/10-filter-counter-badge.png`
```
[Show: Filter button with counter badge showing "2"]
```

---

## Combining Search and Filters

The true power comes from using search and filters together.

### Search + Filter Logic

**How they combine**:
```
Results = Items matching search query AND matching all active filters
```

**Example**:
```
Search: "authentication"
Filters: Status = [Pending], Priority = [High]

Result: Tasks containing "authentication"
        that are pending
        AND have high priority
```

### Typical Workflows

**Finding Specific In-Progress Work**:
```
1. Type: "api"
2. Filter: Status = "in-progress"
Result: All in-progress API-related tasks
```

**Critical Open Issues**:
```
1. Clear search bar (empty)
2. Switch to issue tracker
3. Filter: Severity = "critical", Status = "open"
Result: Critical issues needing immediate attention
```

**High-Priority Pending Tasks**:
```
1. Clear search (empty)
2. Filter: Status = "pending", Priority = "high"
Result: Important tasks ready to start
```

**Blocked Tasks Needing Attention**:
```
1. Search: "" (empty)
2. Filter: Status = "blocked"
Result: All blocked tasks (good for standup review)
```

### Order of Operations

**Recommended workflow**:
1. **Start broad**: Apply filters first
2. **Narrow down**: Add search query if needed
3. **Refine**: Adjust filters or search as needed

**Example progression**:
```
Step 1: Filter by "in-progress" (20 results)
Step 2: Search for "auth" (5 results)
Step 3: Add Priority = "high" filter (2 results)
Result: 2 high-priority in-progress auth tasks
```

---

## Advanced Techniques

### Power User Tips

**1. ID-Based Search**
```
Search: "1.2"
Result: Exact match for task 1.2 (bypasses fuzzy search)
Use: Quick navigation to specific task
```

**2. Multi-Word Search**
```
Search: "user auth form"
Result: Matches tasks containing all three words (any order)
Use: Precise filtering
```

**3. Prefix Search**
```
Search: "auth"
Result: Matches "authentication", "authorize", "authenticated"
Use: Finding related tasks by feature area
```

**4. Filter Stacking**
```
Filters: Status = [Pending, In Progress], Priority = [High]
Result: High-priority tasks that are either pending or in-progress
Use: Finding next tasks to work on
```

**5. Empty Search + Focused Filter**
```
Search: "" (clear it)
Filter: Status = "done"
Result: All completed tasks (great for standups)
Use: Review recent accomplishments
```

### Keyboard Shortcuts (Planned Phase 2)

**Navigation**:
```
/        → Focus search bar
Escape   → Clear search and unfocus
Ctrl+K   → Open command palette (quick filters)
```

**Filter shortcuts**:
```
Alt+S    → Open Status filter
Alt+P    → Open Priority filter
Alt+C    → Clear all filters
```

### URL Parameters (Planned Phase 2)

**Shareable filtered views**:
```
?search=authentication&status=pending&priority=high

Result: URL preserves search and filter state
Use: Share specific views with team members
```

---

## Performance Tips

### Large Datasets

**Optimizations built-in**:
- Search debounced by 150ms
- Filters use memoization
- Virtual scrolling for 1000+ items (planned)

**User tips**:
```
✓ Apply filters first (reduces search space)
✓ Use specific search terms (faster than generic)
✓ Clear filters when not needed (improves rendering)
✗ Don't leave many filters active when browsing all
```

### Search Performance

**Fast queries**:
```
"auth"              → Small keyword, fast
"1.2"               → Exact match, instant
"api bug"           → Two keywords, efficient
```

**Slower queries** (still fast, but relatively):
```
"a"                 → Single letter, many matches
"the user flow"     → Common words, broad matches
"implement feature" → Generic terms
```

**Why it matters**: Fuzzy search is computationally expensive for very broad queries on large datasets.

### Filter Performance

**Filters are fast** because:
- No fuzzy matching (exact equality checks)
- Multi-select uses Set data structure
- Results cached until filters change

**No performance penalty** for:
- Many active filters
- Frequent filter changes
- Combining search + filters

---

## Common Workflows

### Daily Task Management

**Morning Standup Prep**:
```
Workflow:
1. Clear all filters and search
2. Filter: Status = "done"
3. Review yesterday's completed tasks
4. Take notes for standup
5. Clear filters
6. Filter: Status = "in-progress"
7. Identify today's continuing work
8. Filter: Status = "pending", Priority = "high"
9. Pick next task to start
```

**Starting New Task**:
```
Workflow:
1. Clear search
2. Filter: Status = "pending", Priority = "high"
3. Review available tasks
4. Expand subtasks to understand scope
5. Use TaskMaster CLI to mark as "in-progress"
6. Filter: Status = "in-progress"
7. Verify task now shows in active work
```

**Finding Specific Task**:
```
Workflow:
1. Remember task keyword (e.g., "validation")
2. Type in search: "validation"
3. Scan results (should be <10)
4. If too many, add filter (e.g., Status = "in-progress")
5. Expand task to view details
```

### Issue Management

**Critical Issue Review**:
```
Workflow:
1. Navigate to issue tracker (sidebar/tab)
2. Filter: Severity = "critical", Status = "open"
3. Review each critical issue
4. Update status to "in-progress" for ones you're addressing
5. Create linked issues for blockers
```

**Daily Issue Triage**:
```
Workflow:
1. Filter: Status = "open"
2. Sort by created date (newest first - default)
3. Review new issues
4. Assign severity levels
5. Link to related tasks
6. Update status to "in-progress" for immediate work
```

**Closing Resolved Issues**:
```
Workflow:
1. Filter: Status = "in-progress"
2. Review each issue
3. Verify fix is deployed and working
4. Update status to "resolved"
5. Add resolution notes in description
```

### Debugging and Investigation

**Finding Related Tasks**:
```
Workflow:
1. Have bug/issue in specific feature (e.g., "OAuth login")
2. Search: "oauth login"
3. Review all related tasks
4. Identify which task introduced the bug
5. Create issue linked to that task
```

**Tracking Down Blocker**:
```
Workflow:
1. Task is blocked (marked in TaskMaster CLI)
2. Search task ID (e.g., "3.2")
3. Check task dependencies in CLI output
4. Search dependency tasks
5. Identify which dependency is incomplete
6. Update that task or create issue
```

**Code Archaeology**:
```
Workflow:
1. Found weird code, need context
2. Search for feature name in tasks
3. Review task that implemented it
4. Check subtasks for implementation details
5. Look for related issues for context on decisions
```

---

## Troubleshooting

### Search Not Finding Results

**Symptoms**:
- Known task/issue not appearing
- Empty results for valid query

**Solutions**:

1. **Check active filters**:
   ```
   Problem: Filters excluding your target
   Solution: Click "Clear all" to reset filters
   ```

2. **Try shorter query**:
   ```
   Problem: Full sentence too specific
   Solution: Use 1-2 keywords instead
   ```

3. **Check spelling**:
   ```
   Problem: Fuzzy search has limits
   Solution: Try different spelling or synonym
   ```

4. **Search by ID**:
   ```
   Problem: Title search not working
   Solution: Type task/issue ID directly
   ```

### Filters Not Working

**Symptoms**:
- Checking filter has no effect
- Wrong items showing after filter

**Solutions**:

1. **Verify filter category**:
   ```
   Problem: Using task filter on issues (or vice versa)
   Solution: Task filters only affect task list
   ```

2. **Check multi-select logic**:
   ```
   Problem: Expecting AND, getting OR
   Solution: Multiple values within a category use OR logic
   ```

3. **Clear and reapply**:
   ```
   Problem: Stale filter state
   Solution: Click "Clear all", then reapply filters
   ```

### Performance Issues

**Symptoms**:
- Lag when typing in search
- Slow filter application
- UI freezing

**Solutions**:

1. **Reduce dataset size**:
   ```
   Problem: 1000+ tasks causing lag
   Solution: Apply filters before searching
   ```

2. **Use more specific queries**:
   ```
   Problem: Single letter ("a") matches everything
   Solution: Type at least 2-3 characters
   ```

3. **Close other browser tabs**:
   ```
   Problem: Low memory
   Solution: Free up system resources
   ```

---

## Future Enhancements (Planned)

### Phase 2 Features

**Advanced Search**:
- Boolean operators (AND, OR, NOT)
- Field-specific search (title:auth, description:bug)
- Regex support for power users
- Search history and saved searches

**Enhanced Filters**:
- Date range filters (created/updated)
- Assignee filter (when user assignments added)
- Tag filter (multi-select)
- Custom filter combinations (save presets)

**UI Improvements**:
- Keyboard shortcuts for all actions
- Command palette (Cmd+K)
- Search suggestions as you type
- Recent searches dropdown

**Performance**:
- Virtual scrolling for 10,000+ items
- Web workers for search processing
- IndexedDB caching for offline use
- Optimistic UI updates

---

## Summary

### Quick Reference

**Basic Search**:
```
- Click search bar, type query
- Results filter in real-time
- Clear with X button or Escape
```

**Using Filters**:
```
- Click Status/Priority/Severity buttons
- Check multiple options (OR logic)
- Remove with badge X or "Clear all"
```

**Combining Both**:
```
- Apply filters first (narrows dataset)
- Add search query second (refines further)
- Results match search AND all filters
```

**Power Tips**:
```
- Search by ID for exact match
- Use 2-3 keywords for precision
- Apply filters before searching for speed
- Clear filters when browsing all items
```

---

## Next Steps

- **[Task Viewer Guide](tasks.md)** - Learn advanced task features
- **[Issue Tracker Guide](issues.md)** - Master issue management
- **[Quick Start Guide](quick-start.md)** - Review the basics

---

**Version**: 1.0 (Phase 1)
**Last Updated**: 2025-11-13
