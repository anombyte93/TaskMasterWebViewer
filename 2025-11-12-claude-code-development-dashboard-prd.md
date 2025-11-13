# Claude Code Development Dashboard - Product Requirements Document

**Version:** 1.0
**Date:** 2025-11-12
**Mode:** Ultrathink Deep Analysis
**Target Platform:** Replit (also localhost, cloud deployable)

---

## Executive Summary

A lightweight, stable web dashboard providing real-time visibility into Claude Code terminal sessions, MCP server management, file navigation, git status, and issue tracking - without the crashes and feature bloat of traditional IDEs.

**Core Value Proposition:** Terminal-first stability with IDE-like observability.

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [Problem Statement](#2-problem-statement)
3. [Solution Architecture](#3-solution-architecture)
4. [Feature Requirements](#4-feature-requirements)
5. [Technical Specifications](#5-technical-specifications)
6. [Implementation Phases](#6-implementation-phases)
7. [User Interface Design](#7-user-interface-design)
8. [API Specifications](#8-api-specifications)
9. [Deployment Guide](#9-deployment-guide)
10. [Success Metrics](#10-success-metrics)

---

## 1. Vision & Philosophy

### 1.1 The Core Insight

Modern web IDEs (VSCode, Codespaces, Replit) are **observation tools first, editing tools second**. They show you what's happening in containers/terminals, with file editing as a convenience feature.

**This dashboard follows that pattern:** Terminal-first, WebUI for observability.

### 1.2 Design Principles

1. **Stability Over Features** - If it crashes, it fails
2. **Clarity Over Complexity** - Show what matters, hide what doesn't
3. **Terminal-First** - The terminal never lies, UI shows terminal truth
4. **Elegant by Default** - No configuration needed to look great
5. **Fast by Design** - < 1 second to see what Claude is doing

### 1.3 What This Is NOT

- ❌ Not a VSCode replacement
- ❌ Not a code editor first
- ❌ Not trying to do everything
- ✅ A mission control dashboard for Claude Code workflows

---

## 2. Problem Statement

### 2.1 Current Pain Points

**Problem 1: VSCode Crashes**
- VSCode crashes during Claude Code sessions
- Loss of context and workflow interruption
- Heavy resource usage (RAM, CPU)

**Problem 2: Terminal Isolation**
- Claude Code runs in terminal, can't see output from another window
- Need to switch between terminal and browser constantly
- Hard to track what Claude is doing in long sessions

**Problem 3: MCP Server Management**
- No visual way to see which MCP servers are running
- Can't easily discover available tools
- Debugging MCP connections is painful

**Problem 4: Git Status Invisibility**
- Need to run `git status` manually to see changes
- Can't track Claude's git operations visually

**Problem 5: Issue Tracking Fragmentation**
- Problems come up during development with no place to track them
- Screenshots, error messages scattered across tools
- No connection between issues and tasks

### 2.2 User Stories

**As a developer working with Claude Code, I want to:**

1. See Claude Code's terminal output in my browser so I don't have to switch windows
2. View my project's file structure with git status indicators
3. Know which MCP servers are running and what tools they provide
4. Track issues that come up during development
5. See my current Task Master task in the UI
6. Have a stable, crash-proof interface that won't lose my context

---

## 3. Solution Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Client)                    │
│  ┌─────────────┬──────────────────┬──────────────┐  │
│  │  File Tree  │   Terminal       │   Sidebar    │  │
│  │  Component  │   Viewer         │   (Git/MCP)  │  │
│  │  (React)    │   (xterm.js)     │   (React)    │  │
│  └─────────────┴──────────────────┴──────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────┴──────────────────────────────┐
│              Express Server (Node.js)                │
│  ┌──────────────────────────────────────────────┐   │
│  │  REST API        │  WebSocket Handler        │   │
│  │  (Routes)        │  (Socket.io)              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Services                                     │   │
│  │  - TerminalService (node-pty)                │   │
│  │  - FileService (fs/promises)                 │   │
│  │  - GitService (simple-git)                   │   │
│  │  - MCPService (.mcp.json reader)             │   │
│  │  - TaskMasterService (tasks.json reader)     │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│              Local File System                       │
│  - Project files                                     │
│  - .mcp.json (MCP servers)                          │
│  - .taskmaster/ (Task Master)                       │
│  - .claude/issues/ (Issue tracker)                  │
│  - .git/ (Git repository)                           │
└──────────────────────────────────────────────────────┘
```

### 3.2 Three-Panel Layout

```
┌────────────┬──────────────────────┬──────────────┐
│            │                      │              │
│   FILE     │    TERMINAL          │   SIDEBAR    │
│   TREE     │    VIEWER            │              │
│            │                      │   • Git      │
│  (20%)     │    (60%)             │   • MCP      │
│            │                      │   • Issues   │
│            │                      │   • Tasks    │
│            │                      │              │
│            │                      │   (20%)      │
└────────────┴──────────────────────┴──────────────┘
```

**Responsive Behavior:**
- Desktop (>1024px): Three panels side-by-side
- Tablet (768-1023px): Terminal full-width, sidebar collapsible
- Mobile (<768px): Single column, swipe between views

---

## 4. Feature Requirements

### 4.1 Terminal Viewer (Core Feature)

**Priority:** P0 (Must Have)

**Description:**
Real-time streaming terminal viewer using xterm.js, showing Claude Code session output.

**Functional Requirements:**

1. **Real-Time Streaming**
   - Stream terminal output with < 100ms latency
   - Support ANSI color codes and formatting
   - Handle large output volumes (100+ lines/second)

2. **Multiple Terminal Support**
   - Tab interface for multiple terminals
   - Auto-detect tmux sessions
   - Quick switch between terminals (Ctrl+1, Ctrl+2, etc.)

3. **Interaction Modes**
   - **Watch Mode (default):** Read-only, see Claude's output
   - **Interactive Mode:** Send commands to terminal
   - Toggle between modes with button or keyboard shortcut

4. **Session Persistence**
   - Reconnect to existing PTY session after page refresh
   - Save scroll position
   - Restore terminal state

5. **Terminal Actions**
   - Clear terminal
   - Copy selected text
   - Download terminal log
   - Search terminal history

**Technical Details:**

```typescript
// Terminal configuration
const terminalConfig = {
  theme: {
    background: '#1a1b26',      // Tokyo Night
    foreground: '#c0caf5',
    cursor: '#c0caf5',
    // ... full Tokyo Night color scheme
  },
  fontSize: 14,
  fontFamily: 'JetBrains Mono, monospace',
  cursorBlink: true,
  scrollback: 10000,
};
```

**API Endpoints:**
- `GET /api/terminal/sessions` - List active terminal sessions
- `POST /api/terminal/create` - Create new PTY session
- WebSocket: `attach-terminal`, `terminal-output`, `terminal-input`

**Success Criteria:**
- [ ] Can view Claude Code output in real-time
- [ ] Terminal renders all ANSI colors correctly
- [ ] < 100ms latency from terminal to browser
- [ ] Survives page refresh without losing session
- [ ] Can handle 1000+ lines of output without lag

---

### 4.2 File Tree Navigator

**Priority:** P0 (Must Have)

**Description:**
VSCode-style file tree showing project structure with git status indicators.

**Functional Requirements:**

1. **Directory Structure**
   - Recursive directory listing
   - Expand/collapse folders
   - File type icons (using lucide-react)
   - Sort by name, type, or modification date

2. **Git Status Integration**
   - Modified files: Orange dot
   - Untracked files: Green dot
   - Staged files: Green checkmark
   - Conflicted files: Red warning
   - Update in real-time on file changes

3. **File Operations**
   - Click file to view content in side panel (read-only)
   - Right-click context menu:
     - View in terminal (`cat file`)
     - Open in editor (if editing enabled)
     - Copy file path
     - Show git diff

4. **Search & Filter**
   - Fuzzy file search (Ctrl+P style)
   - Filter by file type
   - Filter by git status
   - Recent files list (last 10 opened)

5. **Performance**
   - Lazy loading for large directories (>1000 files)
   - Virtual scrolling for smooth performance
   - Debounced file system watching

**UI Component Structure:**

```tsx
<FileTree>
  <SearchBar onSearch={handleSearch} />
  <FilterBar filters={['modified', 'untracked']} />
  <VirtualizedTree>
    <FolderNode>
      <FileNode icon="file-code" gitStatus="modified" />
      <FileNode icon="file-text" gitStatus="untracked" />
    </FolderNode>
  </VirtualizedTree>
  <RecentFiles files={recentFiles} />
</FileTree>
```

**API Endpoints:**
- `GET /api/files?path=/src` - Get directory contents
- `GET /api/files/content?path=/src/app.ts` - Get file content
- `GET /api/files/recent` - Get recent files

**Success Criteria:**
- [ ] Can navigate project with >10,000 files smoothly
- [ ] Git status updates within 1 second of file change
- [ ] File search returns results in < 300ms
- [ ] Tree state persists across page refreshes

---

### 4.3 Git Dashboard

**Priority:** P1 (Should Have)

**Description:**
Real-time git status visualization showing branch, changes, commits, and quick actions.

**Functional Requirements:**

1. **Branch Information**
   - Current branch name
   - Upstream tracking (ahead/behind origin)
   - Last commit message
   - Commit author and time

2. **Changes Overview**
   - Count of modified files
   - Count of staged files
   - Count of untracked files
   - Conflicted files (if any)

3. **Staged Files List**
   - File path
   - Change type (modified, added, deleted)
   - Click to view diff
   - Unstage action

4. **Commit History**
   - Last 5 commits
   - Commit SHA (short)
   - Commit message
   - Author and timestamp
   - Click to view full commit details

5. **Quick Actions**
   - Run `git status` in terminal
   - Run `git diff` for specific file
   - View full git log in terminal
   - Create new branch (opens terminal with command)

**UI Layout:**

```
┌──────────────────────────────────────┐
│ 📊 Git Status                        │
├──────────────────────────────────────┤
│ Branch: feature/dashboard            │
│ ↑ 2 ahead, ↓ 0 behind origin         │
│                                      │
│ Changes:                             │
│ • 7 modified                         │
│ • 2 untracked                        │
│ • 3 staged                           │
│                                      │
│ Staged Files:                        │
│ ✓ src/app.ts         [Diff] [Unstage]│
│ ✓ README.md         [Diff] [Unstage]│
│                                      │
│ Recent Commits:                      │
│ abc123 feat: add git dashboard       │
│ def456 fix: terminal reconnect       │
│ ghi789 docs: update README           │
│                                      │
│ [View Full Log in Terminal]          │
└──────────────────────────────────────┘
```

**API Endpoints:**
- `GET /api/git/status` - Get git status
- `GET /api/git/commits?limit=5` - Get recent commits
- `GET /api/git/diff?file=src/app.ts` - Get file diff
- `POST /api/git/stage` - Stage files
- `POST /api/git/unstage` - Unstage files

**Technical Implementation:**

```typescript
// Using simple-git library
import simpleGit from 'simple-git';

const git = simpleGit(projectRoot);

async function getGitStatus() {
  const status = await git.status();
  return {
    branch: status.current,
    ahead: status.ahead,
    behind: status.behind,
    modified: status.modified,
    created: status.created,
    deleted: status.deleted,
    staged: status.staged,
  };
}
```

**Success Criteria:**
- [ ] Git status updates within 1 second of file changes
- [ ] Can view diffs for any file
- [ ] Quick actions open correct terminal commands
- [ ] No performance impact with large repos (>10k files)

---

### 4.4 MCP Server Manager

**Priority:** P1 (Should Have)

**Description:**
Visual dashboard for managing Model Context Protocol servers, showing status, tools, and configurations.

**Functional Requirements:**

1. **Server Discovery**
   - Read `.mcp.json` configuration
   - Detect installed MCP servers
   - Show server metadata (name, command, args)

2. **Server Status**
   - Running: Green indicator
   - Stopped: Gray indicator
   - Error: Red indicator with error message
   - Auto-refresh status every 5 seconds

3. **Server Actions**
   - Start server
   - Stop server
   - Restart server
   - View server logs
   - Test connection (health check)

4. **Tool Discovery**
   - List all tools provided by each server
   - Tool name and description
   - Tool parameters (input schema)
   - Tool usage examples
   - Click tool to copy usage command

5. **Add New Server**
   - Form to add new MCP server
   - Fields: name, command, args, environment variables
   - Validate configuration before saving
   - Save to `.mcp.json`

6. **Server Logs**
   - Real-time log streaming
   - Filter by log level (error, warn, info, debug)
   - Download logs
   - Clear logs

**UI Layout:**

```
┌────────────────────────────────────────┐
│ 🔌 MCP Servers                         │
├────────────────────────────────────────┤
│ ✅ task-master-ai         [Running]    │
│    Tools: 42 tools available           │
│    Last used: 2 minutes ago            │
│    [Stop] [Logs] [Tools List] [Test]   │
│                                        │
│ ✅ perplexity-api-free    [Running]    │
│    Tools: 3 tools available            │
│    Last used: 5 minutes ago            │
│    [Stop] [Logs] [Tools List] [Test]   │
│                                        │
│ ❌ system-knowledge       [Error]      │
│    Error: Connection refused (port 6333)│
│    Last attempt: 10 seconds ago        │
│    [Retry] [Logs] [Remove] [Debug]     │
│                                        │
│ ⚪ custom-server         [Stopped]     │
│    Last run: 1 hour ago                │
│    [Start] [Configure] [Remove]        │
│                                        │
│ [+ Add MCP Server]                     │
└────────────────────────────────────────┘
```

**Tool Details Modal:**

```
┌────────────────────────────────────────┐
│ Tools: task-master-ai (42 tools)       │
├────────────────────────────────────────┤
│ 📋 Task Management (15 tools)          │
│   • get_tasks - List all tasks         │
│   • get_task - Get task details        │
│   • set_task_status - Update status    │
│   ...                                  │
│                                        │
│ 📊 Analysis (8 tools)                  │
│   • analyze_complexity - Analyze tasks │
│   • complexity_report - View report    │
│   ...                                  │
│                                        │
│ 🔍 Research (4 tools)                  │
│   • research - Perplexity research     │
│   ...                                  │
│                                        │
│ [Close]                                │
└────────────────────────────────────────┘
```

**API Endpoints:**
- `GET /api/mcp/servers` - List all MCP servers
- `GET /api/mcp/servers/:name/status` - Get server status
- `POST /api/mcp/servers/:name/start` - Start server
- `POST /api/mcp/servers/:name/stop` - Stop server
- `GET /api/mcp/servers/:name/tools` - List server tools
- `GET /api/mcp/servers/:name/logs` - Get server logs
- `POST /api/mcp/servers` - Add new server
- `DELETE /api/mcp/servers/:name` - Remove server

**Technical Implementation:**

```typescript
// MCP Server Manager
interface MCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  tools: MCPTool[];
  lastError?: string;
  lastUsed?: Date;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
  examples?: string[];
}

// Read .mcp.json
async function loadMCPConfig(): Promise<MCPServer[]> {
  const mcpPath = path.join(projectRoot, '.mcp.json');
  const config = await fs.readFile(mcpPath, 'utf-8');
  return JSON.parse(config).mcpServers;
}

// Check server status
async function getServerStatus(server: MCPServer): Promise<'running' | 'stopped' | 'error'> {
  if (!server.pid) return 'stopped';

  try {
    // Check if process is alive
    process.kill(server.pid, 0);
    return 'running';
  } catch (error) {
    return 'stopped';
  }
}
```

**Success Criteria:**
- [ ] Can see all MCP servers from `.mcp.json`
- [ ] Server status updates automatically
- [ ] Can start/stop servers from UI
- [ ] Tool list shows all available tools
- [ ] Logs stream in real-time
- [ ] Can add new server through form

---

### 4.5 Issue Tracker

**Priority:** P2 (Nice to Have)

**Description:**
Lightweight issue tracking system for problems discovered during development.

**Functional Requirements:**

1. **Issue Creation**
   - Title (required)
   - Description with markdown support
   - Severity: critical, high, medium, low
   - Related Task ID (Task Master integration)
   - Related File/Line (optional)
   - Tags (multiple, autocomplete)
   - Attachments (screenshots, logs)

2. **Issue List**
   - Table view with columns: ID, Title, Severity, Status, Task
   - Filter by severity, status, tags
   - Search by title/description
   - Sort by creation date, severity, status
   - Pagination for > 100 issues

3. **Issue Detail View**
   - Full description with markdown rendering
   - File/line link (opens in file tree)
   - Related task link (opens in Task Master panel)
   - Attachments preview
   - Edit/delete actions
   - Status change dropdown
   - Comment system (future enhancement)

4. **Issue Storage**
   - Store as JSON files in `.claude/issues/`
   - File naming: `issue-{id}.json`
   - Index file: `.claude/issues/index.json`
   - Auto-backup on change

5. **Export & Integration**
   - Export to markdown
   - Export to GitHub issues (future)
   - Export to Jira (future)
   - Link to git commits (future)

**UI Layout:**

```
┌────────────────────────────────────────┐
│ 🐛 Issues (12 open, 8 closed)          │
├────────────────────────────────────────┤
│ [+ New Issue]        [Export] [Filter] │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ ID   Title           Severity Status││
│ ├────────────────────────────────────┤ │
│ │ #001 Terminal lag   High     Open  ││
│ │ #002 Git diff err   Critical Open  ││
│ │ #003 MCP timeout    Medium   Open  ││
│ │ #004 File tree lag  Low      Open  ││
│ └────────────────────────────────────┘ │
│                                        │
│ Selected: #001 - Terminal lag          │
│ Severity: High | Task: #8.7            │
│                                        │
│ Description:                           │
│ Terminal output lags behind by 2-3     │
│ seconds when Claude generates large    │
│ code blocks...                         │
│                                        │
│ File: src/TerminalViewer.tsx:145       │
│ Tags: performance, terminal            │
│                                        │
│ [Edit] [Close Issue] [View Task]       │
└────────────────────────────────────────┘
```

**Issue Creation Form:**

```
┌────────────────────────────────────────┐
│ Create New Issue                       │
├────────────────────────────────────────┤
│ Title: *                               │
│ [Terminal lag with large outputs]      │
│                                        │
│ Description: *                         │
│ [Markdown editor with preview]         │
│                                        │
│ Severity: * [High ▼]                   │
│                                        │
│ Related Task: [8.7 ▼] (optional)       │
│                                        │
│ File/Line: [Browse...] (optional)      │
│ src/TerminalViewer.tsx:145             │
│                                        │
│ Tags: [performance] [terminal] [+]     │
│                                        │
│ Attachments: [Upload Files]            │
│                                        │
│ [Cancel] [Create Issue]                │
└────────────────────────────────────────┘
```

**API Endpoints:**
- `GET /api/issues` - List issues (with filters)
- `GET /api/issues/:id` - Get issue details
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/attachments` - Upload attachment
- `GET /api/issues/export` - Export to markdown

**Data Structure:**

```json
{
  "id": "issue-001",
  "title": "Terminal lag with large outputs",
  "description": "Terminal output lags behind by 2-3 seconds when Claude generates large code blocks (>500 lines)...",
  "severity": "high",
  "status": "open",
  "relatedTaskId": "8.7",
  "relatedFile": "src/TerminalViewer.tsx",
  "relatedLine": 145,
  "tags": ["performance", "terminal"],
  "attachments": [
    {
      "name": "terminal-lag-screenshot.png",
      "path": ".claude/issues/attachments/issue-001-1.png"
    }
  ],
  "createdAt": "2025-11-12T10:30:00Z",
  "updatedAt": "2025-11-12T10:30:00Z"
}
```

**Success Criteria:**
- [ ] Can create issues with all fields
- [ ] Issues persist across sessions
- [ ] Can filter and search issues efficiently
- [ ] File/line links open correct location
- [ ] Task links integrate with Task Master

---

### 4.6 Task Master Integration

**Priority:** P2 (Nice to Have)

**Description:**
Read-only integration with Task Master showing current task and quick actions.

**Functional Requirements:**

1. **Current Task Display**
   - Show next available task (from `task-master next`)
   - Task ID and title
   - Status and priority
   - Subtask completion progress
   - Dependencies

2. **Task List View**
   - All tasks with status
   - Expandable subtasks
   - Filter by status, priority
   - Visual progress indicators

3. **Quick Actions**
   - View task details in modal
   - Open task in terminal (`task-master show <id>`)
   - Mark task done (runs `task-master set-status`)
   - View next task

4. **Auto-Refresh**
   - Watch `.taskmaster/tasks/tasks.json` for changes
   - Update UI when tasks change
   - Notify when current task changes

**UI Layout:**

```
┌────────────────────────────────────────┐
│ 📋 Task Master                         │
├────────────────────────────────────────┤
│ Current Task:                          │
│ #8.7 Fix Timeout Configuration         │
│ Status: pending | Priority: high       │
│ Dependencies: None                     │
│                                        │
│ Progress: 6/10 subtasks complete       │
│ [█████████░░░░░░░░░░] 60%             │
│                                        │
│ [View Details] [Open Terminal]         │
│ [Mark Done] [Next Task]                │
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ All Tasks:                             │
│ ✓ #1-7 Completed (7 tasks)            │
│ ▶ #8 In Progress (1 task)             │
│ ○ #9-19 Pending (11 tasks)            │
│                                        │
│ [View All in Terminal]                 │
└────────────────────────────────────────┘
```

**API Endpoints:**
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/current` - Get current task (next available)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks/:id/status` - Update task status (runs CLI)

**Technical Implementation:**

```typescript
// Task Master Integration
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getCurrentTask(): Promise<Task> {
  const { stdout } = await execAsync('task-master next --format=json');
  return JSON.parse(stdout);
}

async function setTaskStatus(taskId: string, status: string): Promise<void> {
  await execAsync(`task-master set-status --id=${taskId} --status=${status}`);
}

// Watch tasks.json for changes
import chokidar from 'chokidar';

const watcher = chokidar.watch('.taskmaster/tasks/tasks.json');
watcher.on('change', async () => {
  const tasks = await loadTasks();
  io.emit('tasks-updated', tasks);
});
```

**Success Criteria:**
- [ ] Can see current task in UI
- [ ] Task list shows all tasks with status
- [ ] Quick actions work correctly
- [ ] UI updates when tasks.json changes
- [ ] Can mark tasks done from UI

---

## 5. Technical Specifications

### 5.1 Technology Stack

**Frontend:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Terminal:** xterm.js 5
- **Icons:** Lucide React
- **State Management:** React Context + hooks
- **HTTP Client:** Fetch API
- **WebSocket:** Socket.io-client

**Backend:**
- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4
- **Language:** TypeScript
- **WebSocket:** Socket.io
- **PTY:** node-pty
- **Git:** simple-git
- **File Watching:** chokidar
- **Process Management:** PM2 (production)

**Development Tools:**
- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** Vitest (unit), Playwright (e2e)

**Deployment:**
- **Replit:** Native support via `.replit` config
- **Docker:** Dockerfile for containerized deployment
- **VPS:** PM2 ecosystem file for production

### 5.2 Project Structure

```
claude-code-dashboard/
├── client/                       # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── ThreePanel.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── terminal/
│   │   │   │   ├── TerminalViewer.tsx
│   │   │   │   ├── TerminalTabs.tsx
│   │   │   │   └── TerminalControls.tsx
│   │   │   ├── files/
│   │   │   │   ├── FileTree.tsx
│   │   │   │   ├── FileNode.tsx
│   │   │   │   └── FileSearch.tsx
│   │   │   ├── git/
│   │   │   │   ├── GitDashboard.tsx
│   │   │   │   ├── GitStatus.tsx
│   │   │   │   └── CommitHistory.tsx
│   │   │   ├── mcp/
│   │   │   │   ├── MCPManager.tsx
│   │   │   │   ├── ServerCard.tsx
│   │   │   │   └── ToolsList.tsx
│   │   │   ├── issues/
│   │   │   │   ├── IssueTracker.tsx
│   │   │   │   ├── IssueList.tsx
│   │   │   │   └── IssueForm.tsx
│   │   │   └── tasks/
│   │   │       ├── TaskMasterPanel.tsx
│   │   │       └── TaskCard.tsx
│   │   ├── hooks/
│   │   │   ├── useTerminal.ts
│   │   │   ├── useFileTree.ts
│   │   │   ├── useGitStatus.ts
│   │   │   ├── useMCPServers.ts
│   │   │   └── useWebSocket.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── socket.ts
│   │   │   └── theme.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                       # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── files.ts
│   │   │   ├── git.ts
│   │   │   ├── mcp.ts
│   │   │   ├── issues.ts
│   │   │   └── tasks.ts
│   │   ├── services/
│   │   │   ├── TerminalService.ts
│   │   │   ├── FileService.ts
│   │   │   ├── GitService.ts
│   │   │   ├── MCPService.ts
│   │   │   ├── IssueService.ts
│   │   │   └── TaskMasterService.ts
│   │   ├── websocket/
│   │   │   └── terminal.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── config.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── shared/                       # Shared types
│   └── types.ts
├── docs/                         # Documentation
│   ├── API.md
│   ├── DEVELOPMENT.md
│   └── DEPLOYMENT.md
├── .replit                       # Replit config
├── replit.nix                    # Nix packages
├── Dockerfile                    # Docker config
├── docker-compose.yml            # Docker Compose
├── .env.example                  # Environment variables
├── package.json                  # Root package.json
├── README.md
└── LICENSE
```

### 5.3 Environment Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=development  # or 'production'

# Project Configuration
PROJECT_ROOT=/path/to/your/project  # Required

# Optional: Custom paths
TASKMASTER_PATH=.taskmaster
CLAUDE_PATH=.claude
MCP_CONFIG_PATH=.mcp.json

# Optional: Feature flags
ENABLE_EDITING=false        # Enable file editing
ENABLE_GIT_ACTIONS=false    # Enable git push/pull
ENABLE_MCP_MANAGEMENT=true  # Enable MCP server start/stop

# Optional: WebSocket configuration
WS_HEARTBEAT_INTERVAL=30000  # 30 seconds
WS_TIMEOUT=60000             # 60 seconds

# Optional: Terminal configuration
TERMINAL_ROWS=30
TERMINAL_COLS=120
TERMINAL_SCROLLBACK=10000

# Optional: Git configuration
GIT_COMMIT_LIMIT=10  # Number of commits to show

# Optional: Logging
LOG_LEVEL=info  # error, warn, info, debug
```

### 5.4 API Design

**Base URL:** `http://localhost:5000/api`

#### File Operations

```typescript
// GET /api/files?path=/src
interface FileTreeRequest {
  path?: string;  // Default: project root
  depth?: number; // Default: unlimited
  includeGitStatus?: boolean; // Default: true
}

interface FileTreeResponse {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string; // ISO 8601
  gitStatus?: 'modified' | 'untracked' | 'staged' | 'deleted' | 'conflicted';
  children?: FileTreeResponse[];
}

// GET /api/files/content?path=/src/app.ts
interface FileContentRequest {
  path: string;
  encoding?: 'utf8' | 'base64'; // Default: utf8
}

interface FileContentResponse {
  path: string;
  content: string;
  encoding: string;
  size: number;
  modified: string;
}

// GET /api/files/recent
interface RecentFilesResponse {
  files: Array<{
    path: string;
    lastAccessed: string;
  }>;
}
```

#### Git Operations

```typescript
// GET /api/git/status
interface GitStatusResponse {
  branch: string;
  ahead: number;
  behind: number;
  modified: string[];
  created: string[];
  deleted: string[];
  renamed: Array<{ from: string; to: string }>;
  staged: string[];
  conflicted: string[];
  isClean: boolean;
}

// GET /api/git/commits?limit=5
interface GitCommitsRequest {
  limit?: number; // Default: 10
  offset?: number; // Default: 0
}

interface GitCommitsResponse {
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
  total: number;
}

// GET /api/git/diff?file=/src/app.ts
interface GitDiffRequest {
  file: string;
  staged?: boolean; // Default: false (working directory)
}

interface GitDiffResponse {
  file: string;
  diff: string; // Unified diff format
}
```

#### MCP Server Management

```typescript
// GET /api/mcp/servers
interface MCPServersResponse {
  servers: Array<{
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
    status: 'running' | 'stopped' | 'error';
    pid?: number;
    toolCount: number;
    lastUsed?: string;
    lastError?: string;
  }>;
}

// GET /api/mcp/servers/:name/tools
interface MCPToolsResponse {
  serverName: string;
  tools: Array<{
    name: string;
    description: string;
    inputSchema: object;
  }>;
}

// POST /api/mcp/servers/:name/start
interface MCPServerStartResponse {
  success: boolean;
  pid?: number;
  error?: string;
}

// GET /api/mcp/servers/:name/logs?limit=100
interface MCPLogsRequest {
  limit?: number;
  level?: 'error' | 'warn' | 'info' | 'debug';
}

interface MCPLogsResponse {
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}
```

#### Issue Tracking

```typescript
// GET /api/issues?status=open&severity=high
interface IssuesRequest {
  status?: 'open' | 'closed';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  tag?: string;
  search?: string;
}

interface IssuesResponse {
  issues: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    relatedTaskId?: string;
    createdAt: string;
  }>;
  total: number;
}

// POST /api/issues
interface CreateIssueRequest {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  relatedTaskId?: string;
  relatedFile?: string;
  relatedLine?: number;
  tags?: string[];
}

interface CreateIssueResponse {
  id: string;
  success: boolean;
}
```

#### Task Master Integration

```typescript
// GET /api/tasks
interface TasksResponse {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dependencies: string[];
    subtasks?: Array<{
      id: string;
      title: string;
      status: string;
    }>;
  }>;
}

// GET /api/tasks/current
interface CurrentTaskResponse {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    description: string;
    subtasksComplete: number;
    subtasksTotal: number;
  } | null;
}

// POST /api/tasks/:id/status
interface UpdateTaskStatusRequest {
  status: 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred';
}
```

#### WebSocket Events

```typescript
// Client → Server
socket.emit('attach-terminal', {
  sessionId?: string; // Attach to existing, or create new
  cwd?: string;       // Working directory
  shell?: string;     // Shell to use (default: $SHELL)
});

socket.emit('terminal-input', {
  sessionId: string;
  data: string;
});

socket.emit('terminal-resize', {
  sessionId: string;
  rows: number;
  cols: number;
});

// Server → Client
socket.on('terminal-output', (data: {
  sessionId: string;
  data: string; // ANSI output
}) => { });

socket.on('terminal-ready', (data: {
  sessionId: string;
  pid: number;
  cwd: string;
}) => { });

socket.on('terminal-exit', (data: {
  sessionId: string;
  exitCode: number;
}) => { });

// File watching
socket.on('file-changed', (data: {
  path: string;
  event: 'add' | 'change' | 'unlink';
}) => { });

// Tasks updated
socket.on('tasks-updated', (data: {
  tasks: Task[];
}) => { });
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Basic terminal viewing + file tree

**Tasks:**

1. **Project Setup** (Day 1)
   - Initialize monorepo with client/ and server/
   - Setup TypeScript configs
   - Configure Vite (client) and Express (server)
   - Setup Tailwind CSS
   - Create basic layout components

2. **Terminal Viewer** (Days 2-3)
   - Integrate xterm.js
   - Create TerminalService with node-pty
   - Implement WebSocket terminal streaming
   - Add terminal controls (clear, copy, download)
   - Apply Tokyo Night theme

3. **File Tree** (Days 4-5)
   - Build recursive file tree component
   - Integrate file type icons
   - Add file search functionality
   - Implement lazy loading for large directories

4. **Testing & Polish** (Days 6-7)
   - Write unit tests for services
   - Test with large projects (>10k files)
   - Fix bugs and performance issues
   - Basic documentation

**Deliverables:**
- ✅ Can view terminal output in real-time
- ✅ Can navigate file tree
- ✅ UI loads in < 1 second
- ✅ Terminal has < 100ms latency

**Demo Requirements:**
- Record video showing terminal streaming
- Screenshot of file tree with 1000+ files

---

### Phase 2: Git + MCP (Week 2)

**Goal:** Git visibility + MCP management

**Tasks:**

1. **Git Integration** (Days 1-2)
   - Integrate simple-git library
   - Build GitDashboard component
   - Implement git status API
   - Add commit history view
   - Add file diff viewer

2. **Git Status in File Tree** (Day 3)
   - Add git status indicators to FileNode
   - Watch git changes in real-time
   - Update UI when git status changes

3. **MCP Server Manager** (Days 4-5)
   - Read .mcp.json configuration
   - Build MCPManager component
   - Implement server status checking
   - Add start/stop server functionality
   - Create tools list modal

4. **MCP Logs** (Day 6)
   - Implement log streaming for MCP servers
   - Add log filtering
   - Create log viewer component

5. **Testing & Polish** (Day 7)
   - Test git operations with real repos
   - Test MCP server lifecycle
   - Performance optimization
   - Bug fixes

**Deliverables:**
- ✅ Can see git status in real-time
- ✅ Can view file diffs
- ✅ Can see all MCP servers
- ✅ Can start/stop MCP servers
- ✅ Can view server tools

**Demo Requirements:**
- Video showing git status updates
- Screenshot of MCP manager with servers

---

### Phase 3: Issues + Tasks (Week 3)

**Goal:** Issue tracking + Task Master integration

**Tasks:**

1. **Issue Tracker Backend** (Days 1-2)
   - Create IssueService
   - Implement issue storage (.claude/issues/)
   - Build REST API for issues
   - Add file attachment support

2. **Issue Tracker UI** (Days 3-4)
   - Build IssueTracker component
   - Create issue list with filters
   - Implement issue creation form
   - Add issue detail modal
   - Integrate markdown editor

3. **Task Master Integration** (Days 5-6)
   - Create TaskMasterService
   - Read tasks.json
   - Build TaskMasterPanel component
   - Implement task actions (mark done, view details)
   - Watch tasks.json for changes

4. **Cross-Feature Integration** (Day 7)
   - Link issues to tasks
   - Link issues to files
   - Link tasks to git commits (future)
   - Test all features together

**Deliverables:**
- ✅ Can create and view issues
- ✅ Issues persist across sessions
- ✅ Can see current Task Master task
- ✅ Can mark tasks done from UI
- ✅ All features work together

**Demo Requirements:**
- Video showing issue creation workflow
- Screenshot of Task Master panel

---

### Phase 4: Polish + Deploy (Week 4)

**Goal:** Production-ready deployment

**Tasks:**

1. **Dark Mode** (Day 1)
   - Implement Tokyo Night theme
   - Add theme toggle
   - Ensure all components support dark mode

2. **Responsive Design** (Day 2)
   - Test on mobile devices
   - Fix layout issues
   - Optimize for tablets

3. **Performance** (Days 3-4)
   - Optimize bundle size
   - Add lazy loading for routes
   - Implement virtual scrolling where needed
   - Optimize WebSocket usage
   - Profile and fix memory leaks

4. **Error Handling** (Day 5)
   - Add error boundaries
   - Improve error messages
   - Add retry logic for failed requests
   - Handle network disconnects

5. **Documentation** (Day 6)
   - Complete README.md
   - API documentation
   - Deployment guides (Replit, Docker, VPS)
   - User guide with screenshots

6. **Deployment** (Day 7)
   - Create .replit configuration
   - Test on Replit
   - Create Dockerfile
   - Test Docker deployment
   - Create PM2 ecosystem file
   - Test VPS deployment

**Deliverables:**
- ✅ Dark mode working
- ✅ Mobile-friendly UI
- ✅ < 100ms UI response time
- ✅ No crashes after 8 hours
- ✅ Complete documentation
- ✅ Deployable to Replit/Docker/VPS

**Demo Requirements:**
- Video walkthrough of all features
- Screenshots on desktop, tablet, mobile
- Performance metrics

---

## 7. User Interface Design

### 7.1 Design System

**Typography:**
- Font: Inter (UI), JetBrains Mono (code/terminal)
- Sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)

**Colors (Tokyo Night):**
```css
:root {
  --bg-primary: #1a1b26;
  --bg-secondary: #16161e;
  --bg-tertiary: #24283b;
  --text-primary: #c0caf5;
  --text-secondary: #a9b1d6;
  --text-tertiary: #565f89;
  --accent-blue: #7aa2f7;
  --accent-green: #9ece6a;
  --accent-red: #f7768e;
  --accent-yellow: #e0af68;
  --accent-purple: #bb9af7;
  --border: #3b4261;
}
```

**Spacing:**
- Use Tailwind units: 2 (0.5rem), 4 (1rem), 6 (1.5rem), 8 (2rem)

**Components:**
- Cards: rounded-lg, border, shadow-sm
- Buttons: px-4 py-2, rounded-md, font-medium
- Inputs: px-3 py-2, rounded-md, border
- Badges: px-2 py-1, rounded-full, text-xs

### 7.2 Layout Specifications

**Desktop (>1024px):**
```
┌─────────────────────────────────────────────────────┐
│ Header (h-16)                                       │
├──────────┬─────────────────────────┬────────────────┤
│          │                         │                │
│  File    │  Terminal Viewer        │   Sidebar      │
│  Tree    │  (xterm.js)             │   (tabs)       │
│          │                         │                │
│  20%     │  60%                    │   20%          │
│          │                         │                │
│          │                         │ • Git          │
│          │                         │ • MCP          │
│          │                         │ • Issues       │
│          │                         │ • Tasks        │
│          │                         │                │
└──────────┴─────────────────────────┴────────────────┘
```

**Tablet (768-1023px):**
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Terminal Viewer (full width)        │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ [File Tree] [Git] [MCP] [Issues]    │
│ Collapsible sidebar                 │
└─────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌────────────────┐
│ Header         │
├────────────────┤
│ Terminal       │
│ (swipe views)  │
│                │
│ [T][F][G][I]   │ ← Tab bar
└────────────────┘
```

### 7.3 Component Mockups

*(Detailed mockups would be created in Figma/Excalidraw, showing:)*
- Terminal viewer with tabs
- File tree with git status
- Git dashboard expanded
- MCP manager with server list
- Issue tracker with form
- Task Master panel

---

## 8. Deployment Guide

### 8.1 Replit Deployment

**`.replit` configuration:**
```toml
run = "npm run dev"
entrypoint = "server/src/server.ts"

[nix]
channel = "stable-22_11"

[deployment]
run = ["npm", "run", "start"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80

[env]
PROJECT_ROOT = "."
```

**Steps:**
1. Create new Repl on Replit
2. Import from GitHub repository
3. Run `npm install` (automatic)
4. Click "Run" button
5. Access at: `https://<repl-name>.<username>.repl.co`

**Environment Variables (Replit):**
- Set in "Secrets" tab (not .env)
- `PROJECT_ROOT=/home/runner/<repl-name>`

---

### 8.2 Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:20-alpine

# Install dependencies for node-pty
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source
COPY . .

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PROJECT_ROOT=/app

# Start server
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - ./your-project:/project:ro  # Mount project as read-only
    environment:
      - PROJECT_ROOT=/project
      - NODE_ENV=production
    restart: unless-stopped
```

**Steps:**
1. Build: `docker build -t claude-code-dashboard .`
2. Run: `docker-compose up -d`
3. Access: `http://localhost:5000`

---

### 8.3 VPS Deployment (with PM2)

**PM2 Ecosystem File (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'claude-code-dashboard',
    script: './server/dist/server.js',
    cwd: '/path/to/claude-code-dashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      PROJECT_ROOT: '/path/to/your/project'
    }
  }]
};
```

**Steps:**

1. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install nodejs npm git
   npm install -g pm2
   ```

2. **Clone and build:**
   ```bash
   git clone <repo>
   cd claude-code-dashboard
   npm install
   cd client && npm run build && cd ..
   cd server && npm run build && cd ..
   ```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Enable on boot
   ```

4. **Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name dashboard.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL with Certbot:**
   ```bash
   sudo certbot --nginx -d dashboard.yourdomain.com
   ```

---

## 9. Success Metrics

### 9.1 Functional Metrics

**Core Features:**
- [ ] Terminal streams Claude Code output in real-time
- [ ] File tree shows all files with git status
- [ ] Git dashboard updates on file changes
- [ ] MCP manager shows all servers and tools
- [ ] Can create and view issues
- [ ] Task Master integration shows current task

**Integration:**
- [ ] Issues link to tasks correctly
- [ ] Issues link to files/lines correctly
- [ ] Task actions work from UI
- [ ] MCP servers can be managed from UI

### 9.2 Performance Metrics

**Speed:**
- [ ] UI loads in < 1 second
- [ ] Terminal streaming has < 100ms latency
- [ ] File tree renders 10,000+ files without lag
- [ ] Git status updates in < 1 second
- [ ] API responses in < 200ms

**Resource Usage:**
- [ ] Memory usage < 500MB
- [ ] CPU usage < 10% when idle
- [ ] No memory leaks after 8 hours

### 9.3 Stability Metrics (Critical)

**Uptime:**
- [ ] No crashes after 8 hours of continuous use
- [ ] Survives Claude Code restarts
- [ ] Handles network disconnects gracefully
- [ ] Terminal reconnects automatically

**Error Handling:**
- [ ] Clear error messages for all failures
- [ ] Recovers from API errors
- [ ] Handles missing files/directories
- [ ] Handles invalid MCP configurations

### 9.4 Usability Metrics

**User Experience:**
- [ ] Intuitive navigation (no documentation needed for basics)
- [ ] Clear visual hierarchy
- [ ] Accessible (WCAG AA)
- [ ] Works on mobile devices

**Documentation:**
- [ ] Complete README with setup instructions
- [ ] API documentation for all endpoints
- [ ] Deployment guides for all platforms
- [ ] User guide with screenshots

---

## 10. Future Enhancements (Post-MVP)

### Phase 5: Editing Capabilities

1. **File Editing**
   - Monaco editor integration
   - Syntax highlighting
   - Auto-save
   - Diff view

2. **Git Actions**
   - Stage/unstage from UI
   - Commit from UI
   - Push/pull (with confirmation)
   - Branch management

### Phase 6: Advanced Features

1. **Collaboration**
   - Multiple user sessions
   - Shared terminal viewing
   - Issue comments
   - Real-time updates

2. **AI Integration**
   - Claude Code conversation history
   - AI suggestions in issues
   - Code review automation

3. **Analytics**
   - Task completion stats
   - Time tracking
   - Productivity metrics

---

## Appendix A: Installation

**Quick Start:**

```bash
# Clone repository
git clone https://github.com/yourusername/claude-code-dashboard.git
cd claude-code-dashboard

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env and set PROJECT_ROOT

# Start development server
npm run dev

# Open browser
open http://localhost:5000
```

**Production Build:**

```bash
# Build client
cd client && npm run build

# Build server
cd ../server && npm run build

# Start production server
npm start
```

---

## Appendix B: Troubleshooting

**Problem:** Terminal not connecting

**Solutions:**
1. Check WebSocket connection in browser DevTools
2. Verify PORT is not blocked by firewall
3. Check server logs for PTY errors
4. Restart server

**Problem:** File tree not showing files

**Solutions:**
1. Verify PROJECT_ROOT environment variable
2. Check file permissions
3. Look for errors in browser console
4. Check server logs

**Problem:** MCP servers not starting

**Solutions:**
1. Verify .mcp.json syntax
2. Check server command and args
3. Verify environment variables
4. Check server logs for startup errors

---

## Appendix C: Contributing

**Development Workflow:**

1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests: `npm test`
5. Submit pull request

**Code Style:**
- Use TypeScript strict mode
- Follow ESLint rules
- Add JSDoc comments for functions
- Write tests for new features

---

## Conclusion

This dashboard provides a **stable, lightweight alternative to VSCode** for Claude Code workflows, focusing on **observability and control** without the crashes and bloat of traditional IDEs.

**Key Benefits:**
- 🚀 **Fast:** < 1 second load time
- 💪 **Stable:** Terminal-first architecture prevents crashes
- 🎨 **Beautiful:** Tokyo Night theme, clean UI
- 🔧 **Integrated:** Task Master + MCP + Git in one place
- 📦 **Deployable:** Works on Replit, Docker, VPS

**Next Steps:**
1. Star the repository on GitHub
2. Try it on Replit (one-click deploy)
3. Report bugs and feature requests
4. Contribute improvements

---

**Generated with Ultrathink** | Version 1.0 | 2025-11-12
