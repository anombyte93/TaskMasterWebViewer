# Screenshot Directory

This directory contains screenshots for the TaskMaster Web Viewer user documentation.

## Screenshot Requirements

### Technical Specifications

- **Format**: PNG (preferred) or JPG
- **Max File Size**: 500KB per image
- **Resolution**:
  - Desktop: 1920x1080 or 2560x1440
  - Tablet: 1024x768 or 768x1024
  - Mobile: 375x667 (iPhone SE) or 414x896 (iPhone 11)
- **DPI**: 72 DPI (web optimized)
- **Color Space**: sRGB

### Naming Convention

```
[section]-[number]-[description].png

Examples:
tasks/01-card-anatomy-labeled.png
issues/03-create-issue-form.png
search/05-filter-buttons.png
```

### Annotation Guidelines

When annotating screenshots:

1. **Arrows**: Use to point out specific UI elements
2. **Labels**: Add text labels next to arrows
3. **Highlights**: Use semi-transparent colored boxes for emphasis
4. **Colors**:
   - Red arrows: Critical elements
   - Blue arrows: Informational
   - Yellow highlights: Interactive elements
5. **Font**: Use system font, 14-16px, bold for visibility

### Compression

Before committing screenshots:

```bash
# Install imagemagick if needed
sudo pacman -S imagemagick

# Optimize PNG files
mogrify -strip -quality 85 -resize 1920x1080\> *.png

# Or use online tools
# tinypng.com
# squoosh.app
```

---

## Screenshot List

### Main Documentation (README.md)

No screenshots needed - covered by section-specific guides.

### Quick Start Guide (quick-start.md)

```
screenshots/
├── 01-task-list-overview.png
│   Description: Main task list with 3-4 tasks visible, highlighting card components
│   Annotations: Arrow pointing to Task ID, Title, Status badge, Priority badge, Progress bar
│
├── 02-subtask-expansion.png
│   Description: Task card with expanded subtasks, showing nested hierarchy
│   Annotations: Highlight chevron icon, show expanded subtask cards with left border
│
├── 03-create-issue-form.png
│   Description: Issue creation modal with form fields filled in
│   Annotations: Label each form field (Title, Description, Severity, Status, Related Task ID)
│
├── 04-issue-card-created.png
│   Description: Issue tracker sidebar with newly created issue at top
│   Annotations: Highlight new issue card, show timestamp "just now"
│
├── 05-search-results.png
│   Description: Search bar with query entered ("auth"), filtered results below
│   Annotations: Show search bar with text, arrow to filtered task cards
│
├── 06-filter-menu.png
│   Description: Status filter popover opened with checkboxes
│   Annotations: Show popover aligned to Status button, highlight checkboxes
│
├── 07-active-filters.png
│   Description: Filter badges displayed with X buttons, filtered results below
│   Annotations: Highlight badge with X button, show "Clear all" button
│
├── 08-issue-detail-edit.png
│   Description: Issue detail modal in edit mode with Related Task ID field highlighted
│   Annotations: Arrow to Related Task ID input field, show Edit/Save buttons
│
├── 09-issue-with-task-link.png
│   Description: Issue card with "Task 1.2 →" link displayed
│   Annotations: Highlight task link, arrow pointing to it
│
└── 10-mobile-view.png
    Description: Mobile layout with bottom tabs and responsive design
    Annotations: Show tab bar at bottom, highlight Tasks/Issues tabs
```

### Task Viewer Guide (tasks.md)

```
screenshots/tasks/
├── 01-card-anatomy-labeled.png
│   Description: Task card with arrows pointing to each component (ID, title, description, badges, progress bar, chevron)
│   Annotations: Numbered arrows (1-7) to each component, matching guide text
│
├── 02-status-badges-all.png
│   Description: Six task cards side-by-side, each with different status (pending, in-progress, done, blocked, deferred, cancelled)
│   Annotations: Label each status name below its card
│
├── 03-priority-badges.png
│   Description: Three tasks with high/medium/low priorities side-by-side
│   Annotations: Highlight priority badges in red/yellow/blue
│
├── 04-task-with-subtasks.png
│   Description: Task card showing chevron, subtask count, and progress bar
│   Annotations: Three arrows pointing to: chevron icon, "3/5 subtasks" text, progress bar
│
├── 05-subtask-expansion-animation.png
│   Description: Before/after of task expansion, side-by-side comparison
│   Annotations: Show chevron rotation, subtasks appearing
│
├── 06-subtask-cards-expanded.png
│   Description: Task card with 3-4 subtasks fully expanded
│   Annotations: Highlight left border, indentation, compact card styling
│
├── 07-progress-bars.png
│   Description: Tasks with various progress levels (0%, 33%, 50%, 100%)
│   Annotations: Label percentage on each, show color segments
│
├── 08-subtask-counts.png
│   Description: Task cards with various subtask counts (0/3, 2/5, 8/8)
│   Annotations: Highlight subtask count text in metadata row
│
└── 09-task-id-examples.png
    Description: Task cards with various ID formats (1, 15, 1.2, 10.5, 100.1)
    Annotations: Highlight ID badges with monospace font
```

### Issue Tracker Guide (issues.md)

```
screenshots/issues/
├── 01-issue-tracker-locations.png
│   Description: Three views side-by-side - desktop (right sidebar), tablet (collapsible), mobile (bottom tab)
│   Annotations: Label each layout type, highlight issue tracker area
│
├── 02-new-issue-button.png
│   Description: Issue tracker header with "+ New Issue" button
│   Annotations: Arrow pointing to button, highlight placement
│
├── 03-create-issue-form.png
│   Description: Issue creation modal with all fields visible
│   Annotations: Label each field (1-7), show required vs optional markers
│
├── 04-issue-created-success.png
│   Description: Issue tracker with new issue at top, success toast visible
│   Annotations: Highlight new issue card, show toast notification
│
├── 05-issue-card-anatomy.png
│   Description: Issue card with arrows pointing to each component (ID, title, badges, link, timestamp)
│   Annotations: Numbered arrows to each component, show left border color
│
├── 06-severity-levels.png
│   Description: Four issue cards stacked, each with different severity (critical, high, medium, low)
│   Annotations: Label each severity, show left border colors (red, orange, yellow, blue)
│
├── 07-issue-statuses.png
│   Description: Three issue cards with open, in-progress, and resolved statuses
│   Annotations: Highlight status badges (blue, purple, green)
│
├── 08-link-issue-to-task.png
│   Description: Issue creation form with Related Task ID field filled in ("1.2")
│   Annotations: Arrow to Related Task ID field, show validation state
│
├── 09-related-task-link.png
│   Description: Issue card with "Task 1.2 →" link, arrow pointing to corresponding task card
│   Annotations: Show link on issue, arrow to task card, highlight both
│
├── 10-edit-issue-form.png
│   Description: Issue detail modal in edit mode with form fields editable
│   Annotations: Highlight Edit/Save/Cancel buttons, show editable fields
│
├── 11-delete-confirmation.png
│   Description: Delete confirmation dialog with "Delete" and "Cancel" buttons
│   Annotations: Highlight warning text, red Delete button
│
└── 12-issue-filters.png
    Description: Issue tracker with severity filter popover open
    Annotations: Show filter button, open popover with checkboxes
```

### Search & Filter Guide (search-filter.md)

```
screenshots/search/
├── 01-search-bar-location.png
│   Description: Dashboard showing search bar placement in desktop, tablet, mobile views
│   Annotations: Highlight search bar in each layout
│
├── 02-basic-search-typing.png
│   Description: Search bar with "auth" typed in, showing filtered results
│   Annotations: Show cursor in search bar, highlight matching results
│
├── 03-no-results-state.png
│   Description: Search with no results, empty state message visible
│   Annotations: Show "No tasks or issues found" message
│
├── 04-fuzzy-matching.png
│   Description: Search query with typo ("authntication") still finding results
│   Annotations: Highlight typo in search bar, show matched results
│
├── 05-filter-buttons.png
│   Description: Filter bar with Status and Priority buttons, badge counters visible
│   Annotations: Highlight each button, show counter badges (e.g., "Status [2]")
│
├── 06-filter-popover-open.png
│   Description: Status filter popover opened with checkboxes and labels
│   Annotations: Show popover alignment, highlight checkboxes
│
├── 07-multi-select-filters.png
│   Description: Filter menu with multiple checkboxes checked (Pending + In Progress)
│   Annotations: Highlight checked boxes, show multiple selections
│
├── 08-active-filter-badges.png
│   Description: Filter bar with active badges displayed ([Pending] [X], [High] [X])
│   Annotations: Highlight X buttons, show badge styling
│
├── 09-clear-all-button.png
│   Description: "Clear all" button visible with several active filter badges
│   Annotations: Arrow to Clear all button, show it only appears with active filters
│
└── 10-filter-counter-badge.png
    Description: Filter button with counter badge showing "2"
    Annotations: Close-up of button, highlight circular badge
```

---

## How to Capture Screenshots

### Desktop Screenshots

1. **Start the dashboard**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:5000`
3. **Set browser size**:
   - Chrome DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
   - Set to "Responsive" → 1920x1080
4. **Populate data**: Ensure tasks and issues are loaded
5. **Capture screen**:
   - Linux: `gnome-screenshot -a` (select area)
   - Or use browser extension (Nimbus Screenshot, etc.)
6. **Annotate**: Use GIMP, Inkscape, or online tool (Photopea.com)
7. **Export**: Save as PNG, optimize size

### Mobile Screenshots

1. **Chrome DevTools**: F12 → Toggle device toolbar
2. **Select device**: iPhone SE (375x667) or iPhone 11 (414x896)
3. **Rotate**: Test both portrait and landscape
4. **Capture**:
   - Chrome: Ctrl+Shift+P → "Capture screenshot"
   - Or use DevTools menu → More tools → Screenshot
5. **Annotate and optimize** as above

### Best Practices

**Do**:
- Use real data (not Lorem Ipsum)
- Show realistic task/issue counts (3-10 items)
- Use consistent Tokyo Night theme
- Capture at 100% zoom (no scaling)
- Include browser chrome for context (optional)

**Don't**:
- Use sensitive/confidential data
- Show overly cluttered views (>20 items)
- Capture at odd zoom levels
- Include desktop background (crop to browser only)
- Use outdated UI versions

---

## Annotation Tools

### Free Options

1. **GIMP** (Linux/Windows/Mac)
   - Full-featured image editor
   - Arrow and text tools built-in
   - Learning curve: Medium

2. **Photopea** (Web-based)
   - Photoshop-like interface
   - No installation needed
   - Free with ads
   - URL: photopea.com

3. **Excalidraw** (Web-based)
   - Quick annotations
   - Export as PNG
   - URL: excalidraw.com

4. **Flameshot** (Linux)
   - Screenshot + annotation in one tool
   - Built-in arrows, text, blur
   - Install: `sudo pacman -S flameshot`

### Recommended Workflow

```bash
# 1. Capture screenshot
flameshot gui

# 2. Annotate immediately in Flameshot
# (arrows, text, shapes)

# 3. Save to screenshots directory
# Save as: docs/user-guide/screenshots/tasks/01-card-anatomy-labeled.png

# 4. Optimize
cd docs/user-guide/screenshots
mogrify -strip -quality 85 -resize 1920x\> tasks/*.png
```

---

## Contributing Screenshots

When adding new screenshots:

1. Follow naming convention
2. Add entry to this README (above section list)
3. Optimize file size (<500KB)
4. Ensure annotations are clear and professional
5. Test that images load in documentation
6. Commit with descriptive message:
   ```bash
   git add docs/user-guide/screenshots/
   git commit -m "docs: add task card anatomy screenshots"
   ```

---

## Screenshot Checklist

Before committing screenshots, verify:

- [ ] Correct naming convention used
- [ ] File size <500KB
- [ ] Annotations are clear and professional
- [ ] No sensitive data visible
- [ ] Image loads correctly in markdown preview
- [ ] Listed in this README with description
- [ ] Compressed/optimized

---

**Version**: 1.0 (Phase 1)
**Last Updated**: 2025-11-13
