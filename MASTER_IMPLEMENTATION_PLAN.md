# TaskMaster Dashboard - Master Implementation Plan

**Version**: 1.0
**Date**: 2025-11-12
**Status**: Single Source of Truth
**Approach**: Hybrid Phased (Original PRD → Terminal → Full Dashboard)

> **This document supersedes all other planning documents.** All implementation should reference this document as the authoritative source.

---

## Table of Contents

1. [Vision & Strategy](#1-vision--strategy)
2. [Current State](#2-current-state)
3. [Technical Architecture](#3-technical-architecture)
4. [Implementation Roadmap](#4-implementation-roadmap)
5. [TaskMaster Integration](#5-taskmaster-integration)
6. [Design System](#6-design-system)
7. [Development Workflow](#7-development-workflow)
8. [Deployment](#8-deployment)

---

## 1. Vision & Strategy

### 1.1 The Unified Vision

**What We're Building:**
A progressive web dashboard that evolves from a focused TaskMaster task viewer into a comprehensive Claude Code development dashboard.

**Core Value Propositions:**
1. **Phase 1**: Visual task management for TaskMaster users (week 3)
2. **Phase 2**: Real-time terminal viewing for Claude Code users (week 4)
3. **Phase 3**: Full IDE replacement with file tree, git, MCP (week 8+)

### 1.2 Why Hybrid Approach?

**The Problem:**
- Original PRD: Focused but limited scope (tasks + issues only)
- New PRD: Ambitious but high risk (6+ weeks, complex features)
- Current state: 0% implementation, excellent infrastructure

**The Solution:**
Build incrementally, validate early, ship value fast.

```
Week 1-3: Tasks + Issues (MVP) ───→ Ship to users
Week 4:   Terminal Viewer        ───→ Validate killer feature
Week 5-8: File Tree + Git + MCP  ───→ Full platform (optional)
```

**Decision Points:**
- After Week 3: Is task viewer valuable? Ship it.
- After Week 4: Does terminal change the game? Continue.
- After Week 8: Full dashboard or focus elsewhere?

### 1.3 Design Philosophy

**Principles** (WWSJD):
1. **Elegant by default** - Ship something great, not everything mediocre
2. **Simplify ruthlessly** - Each phase should feel complete
3. **Terminal-first** - The terminal never lies, UI shows terminal truth
4. **Information density** - Developer tools need clarity, not decoration
5. **Stability over features** - If it crashes, it fails

**Design Language:**
Linear + Material Design hybrid (per design_guidelines.md)
- Linear: Clean task management aesthetic
- Material: Robust data display patterns
- Tokyo Night: Terminal and code theming

---

## 2. Current State

### 2.1 What Exists

**Infrastructure** (✅ 100% Complete):
```
Build System:
├── React 18 + TypeScript 5.6
├── Vite 5.4 (fast builds)
├── Express 4.21 (backend)
├── Tailwind CSS 3.4
├── shadcn/ui (Radix UI components)
└── Replit deployment ready

Project Structure:
├── client/           # React frontend (empty)
├── server/           # Express backend (skeleton)
├── shared/           # Shared types
├── package.json      # Dependencies configured
└── .replit           # Deployment config
```

**UI Framework** (✅ 100% Complete):
- Full Radix UI component suite
- lucide-react icons
- Tailwind + animate plugins
- Theme system (next-themes)
- Form handling (react-hook-form + zod)

### 2.2 What's Missing

**Services** (❌ 0/6 Complete):
```
server/src/services/
├── TaskMasterService.ts    ❌ Critical
├── IssueService.ts         ❌ Critical
├── TerminalService.ts      ❌ Phase 2
├── FileService.ts          ❌ Phase 3
├── GitService.ts           ❌ Phase 3
└── MCPService.ts           ❌ Phase 3
```

**Components** (❌ 0/~25 Complete):
```
client/src/components/
├── layout/                 ❌ Header, Sidebar, ThreePanel
├── tasks/                  ❌ TaskList, TaskCard, TaskDetail
├── issues/                 ❌ IssueTracker, IssueForm
├── terminal/               ❌ TerminalViewer, TerminalTabs
├── files/                  ❌ FileTree, FileNode
├── git/                    ❌ GitDashboard
└── mcp/                    ❌ MCPManager
```

**Dependencies Missing**:
```bash
# Phase 2 (Terminal)
xterm @xterm/addon-fit @xterm/addon-web-links
node-pty socket.io socket.io-client

# Phase 3 (Git + Files)
simple-git chokidar
```

### 2.3 Progress Metrics

| Phase | Features | Implementation | Status |
|-------|----------|---------------|--------|
| **Infrastructure** | Build, UI framework | 100% | ✅ Complete |
| **Phase 1** | Tasks + Issues | 0% | ❌ Not started |
| **Phase 2** | Terminal Viewer | 0% | ❌ Not started |
| **Phase 3** | File Tree + Git + MCP | 0% | ❌ Not started |

**Overall Progress**: 5% (infrastructure only)

---

## 3. Technical Architecture

### 3.1 System Overview

```
┌─────────────────────────────────────────────────────┐
│           Browser (React + TypeScript)               │
│  ┌────────────┬──────────────┬───────────────────┐  │
│  │  Tasks     │  Terminal    │   Sidebar         │  │
│  │  (Phase 1) │  (Phase 2)   │   (Issues, Git)   │  │
│  └────────────┴──────────────┴───────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────┴──────────────────────────────┐
│         Express Server (Node.js + TypeScript)        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Services Layer                              │   │
│  │  - TaskMasterService (reads tasks.json)      │   │
│  │  - IssueService (R/W .taskmaster/issues/)    │   │
│  │  - TerminalService (node-pty + PTY)          │   │
│  │  - FileService (fs/promises + chokidar)      │   │
│  │  - GitService (simple-git)                   │   │
│  │  - MCPService (.mcp.json + process mgmt)     │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│              TaskMaster Integration                  │
│  ┌──────────────────────────────────────────────┐   │
│  │  .taskmaster/                                │   │
│  │  ├── tasks/tasks.json    (read-only)        │   │
│  │  └── issues/             (read-write)       │   │
│  │                                              │   │
│  │  .mcp.json               (MCP servers)       │   │
│  │  .git/                   (Git repository)    │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

**Phase 1 (Tasks + Issues):**
```
tasks.json ──→ TaskMasterService ──→ REST API ──→ React Components
              ↓ (file watching)
              Updates UI on change

issues/*.json ──→ IssueService ──→ REST API ──→ React Components
                  ↑ (CRUD ops)
                  User creates/edits issues
```

**Phase 2 (Terminal):**
```
PTY Process ──→ TerminalService ──→ WebSocket ──→ xterm.js
                ↓ (real-time stream)
                < 100ms latency

User Input ──→ xterm.js ──→ WebSocket ──→ PTY stdin
```

**Phase 3 (Files + Git + MCP):**
```
File System ──→ FileService ──→ REST API ──→ FileTree Component
               ↓ (chokidar watch)
               Real-time updates

.git/ ──→ GitService ──→ REST API ──→ GitDashboard
         ↓ (simple-git)
         Status, commits, diffs

.mcp.json ──→ MCPService ──→ REST API ──→ MCPManager
              ↓ (spawn child process)
              Server status, tools list
```

### 3.3 Technology Stack

**Frontend:**
```json
{
  "framework": "React 18",
  "language": "TypeScript 5.6",
  "build": "Vite 5.4",
  "styling": "Tailwind CSS 3.4",
  "ui": "shadcn/ui (Radix UI)",
  "routing": "Wouter",
  "state": "@tanstack/react-query",
  "forms": "react-hook-form + zod",
  "terminal": "xterm.js (Phase 2)",
  "websocket": "socket.io-client (Phase 2)"
}
```

**Backend:**
```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Express 4",
  "language": "TypeScript 5.6",
  "websocket": "socket.io (Phase 2)",
  "pty": "node-pty (Phase 2)",
  "git": "simple-git (Phase 3)",
  "watching": "chokidar (Phase 3)"
}
```

**Development:**
```json
{
  "package_manager": "npm",
  "dev_server": "tsx + Vite",
  "build": "esbuild (server) + Vite (client)",
  "deployment": "Replit (primary), Docker (optional)"
}
```

### 3.4 API Design

**Phase 1 Endpoints:**
```typescript
// Tasks (read-only)
GET  /api/tasks              // List all tasks
GET  /api/tasks/:id          // Get specific task
GET  /api/tasks/current      // Get next available task

// Issues (CRUD)
GET    /api/issues           // List issues (?status=open&severity=high)
GET    /api/issues/:id       // Get issue details
POST   /api/issues           // Create new issue
PUT    /api/issues/:id       // Update issue
DELETE /api/issues/:id       // Delete issue
POST   /api/issues/:id/attachments  // Upload attachment
```

**Phase 2 Endpoints:**
```typescript
// Terminal (REST for metadata, WebSocket for I/O)
GET  /api/terminal/sessions  // List active terminals
POST /api/terminal/create    // Create new PTY session

// WebSocket events
socket.emit('attach-terminal', { sessionId })
socket.emit('terminal-input', { sessionId, data })
socket.on('terminal-output', ({ sessionId, data }))
socket.on('terminal-exit', ({ sessionId, exitCode }))
```

**Phase 3 Endpoints:**
```typescript
// Files
GET /api/files?path=/src              // Directory contents
GET /api/files/content?path=/src/app.ts  // File content
GET /api/files/recent                 // Recent files

// Git
GET  /api/git/status                  // Current git status
GET  /api/git/commits?limit=5         // Recent commits
GET  /api/git/diff?file=/src/app.ts   // File diff
POST /api/git/stage                   // Stage files
POST /api/git/unstage                 // Unstage files

// MCP
GET    /api/mcp/servers               // List servers
GET    /api/mcp/servers/:name/status  // Server status
GET    /api/mcp/servers/:name/tools   // Server tools
GET    /api/mcp/servers/:name/logs    // Server logs
POST   /api/mcp/servers/:name/start   // Start server
POST   /api/mcp/servers/:name/stop    // Stop server
POST   /api/mcp/servers               // Add server
DELETE /api/mcp/servers/:name         // Remove server
```

---

## 4. Implementation Roadmap

### 4.1 Phase 1: Task Viewer + Issues (Weeks 1-3)

**Goal**: Ship working TaskMaster web viewer with issue tracking.

**Timeline**: 21 days (3 weeks)

#### Week 1: Foundation
**Days 1-2: Backend Services**
```typescript
// server/src/services/TaskMasterService.ts
class TaskMasterService {
  private tasksFilePath: string;
  private watcher: FSWatcher;

  async getTasks(): Promise<Task[]>
  async getTask(id: string): Promise<Task>
  async getCurrentTask(): Promise<Task | null>
  watchTasks(callback: (tasks: Task[]) => void): void
}

// server/src/services/IssueService.ts
class IssueService {
  private issuesDir: string;

  async listIssues(filters?: IssueFilters): Promise<Issue[]>
  async getIssue(id: string): Promise<Issue>
  async createIssue(data: CreateIssueDTO): Promise<Issue>
  async updateIssue(id: string, data: UpdateIssueDTO): Promise<Issue>
  async deleteIssue(id: string): Promise<void>
  async addAttachment(issueId: string, file: File): Promise<string>
}
```

**Days 3-4: API Routes**
```typescript
// server/src/routes/tasks.ts
router.get('/api/tasks', async (req, res) => { /* ... */ })
router.get('/api/tasks/:id', async (req, res) => { /* ... */ })
router.get('/api/tasks/current', async (req, res) => { /* ... */ })

// server/src/routes/issues.ts
router.get('/api/issues', async (req, res) => { /* ... */ })
router.post('/api/issues', async (req, res) => { /* ... */ })
// ... CRUD operations
```

**Days 5-7: Testing & Polish**
- Unit tests for services
- Integration tests for APIs
- Test with real .taskmaster/ directory
- Handle edge cases (missing files, corrupted JSON)

#### Week 2: Frontend Components
**Days 8-10: Layout & Task Components**
```tsx
// client/src/components/layout/
Header.tsx          // Top nav with search, filters
Sidebar.tsx         // Right panel for issues
MainLayout.tsx      // Two-column layout (70/30)

// client/src/components/tasks/
TaskList.tsx        // Main task list
TaskCard.tsx        // Individual task card with subtasks
TaskDetail.tsx      // Modal with full task details
StatusBadge.tsx     // Status indicator
PriorityBadge.tsx   // Priority indicator
ProgressBar.tsx     // Subtask completion
```

**Days 11-12: Issue Components**
```tsx
// client/src/components/issues/
IssueTracker.tsx    // Issues list panel
IssueCard.tsx       // Individual issue card
IssueForm.tsx       // Create/edit issue form
IssueDetail.tsx     // Full issue modal
SeverityBadge.tsx   // Severity indicator
```

**Days 13-14: Search & Filter**
```tsx
// client/src/components/shared/
SearchBar.tsx       // Fuzzy search
FilterBar.tsx       // Status/priority filters
EmptyState.tsx      // No results state
```

#### Week 3: Integration & Polish
**Days 15-17: Feature Integration**
- Connect all components to API
- Implement React Query for state management
- Add optimistic updates
- Real-time task updates (file watching)
- Issue-task linking

**Days 18-19: Responsive Design**
- Mobile layout (single column)
- Tablet layout (collapsible sidebar)
- Touch interactions
- Performance optimization

**Days 20-21: Testing & Documentation**
- E2E tests for critical flows
- User guide with screenshots
- API documentation
- Deploy to Replit
- **Ship Phase 1**

**Phase 1 Deliverables:**
- ✅ View all TaskMaster tasks with hierarchy
- ✅ Expandable subtasks
- ✅ Status/priority indicators
- ✅ Search and filter tasks
- ✅ Create/edit/delete issues
- ✅ Link issues to tasks
- ✅ Responsive design
- ✅ Deployed to Replit

**Success Criteria:**
- [ ] Can view tasks from tasks.json
- [ ] Subtasks expand/collapse smoothly
- [ ] Issues persist across sessions
- [ ] Search returns results in <300ms
- [ ] Mobile-friendly UI
- [ ] Zero crashes in 8-hour session

---

### 4.2 Phase 2: Terminal Viewer (Week 4)

**Goal**: Add real-time terminal streaming to solve VSCode crash problem.

**Timeline**: 7 days (1 week)

**Prerequisites**: Phase 1 shipped and validated

#### Days 22-24: Terminal Backend
```bash
# Install dependencies
npm install xterm @xterm/addon-fit @xterm/addon-web-links
npm install node-pty socket.io socket.io-client
npm install --save-dev @types/node-pty
```

```typescript
// server/src/services/TerminalService.ts
import * as pty from 'node-pty';

class TerminalService {
  private sessions: Map<string, IPty>;

  createSession(options: {
    cwd?: string;
    shell?: string;
  }): string  // Returns sessionId

  attachSession(sessionId: string): IPty
  writeToSession(sessionId: string, data: string): void
  resizeSession(sessionId: string, rows: number, cols: number): void
  closeSession(sessionId: string): void
}

// server/src/websocket/terminal.ts
import { Server } from 'socket.io';

export function setupTerminalSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('attach-terminal', async ({ sessionId }) => { /* ... */ })
    socket.on('terminal-input', ({ sessionId, data }) => { /* ... */ })
    socket.on('terminal-resize', ({ sessionId, rows, cols }) => { /* ... */ })
  })
}
```

#### Days 25-26: Terminal Frontend
```tsx
// client/src/components/terminal/
TerminalViewer.tsx      // xterm.js integration
TerminalTabs.tsx        // Multiple terminal tabs
TerminalControls.tsx    // Clear, copy, download buttons

// client/src/hooks/
useTerminal.ts          // Terminal lifecycle management
useWebSocket.ts         // WebSocket connection

// Example implementation
function TerminalViewer({ sessionId }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { terminal, fitAddon } = useTerminal({
    theme: tokyoNightTheme,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
  });

  useEffect(() => {
    if (terminalRef.current) {
      terminal.open(terminalRef.current);
      fitAddon.fit();
    }
  }, []);

  return <div ref={terminalRef} className="h-full w-full" />;
}
```

#### Days 27-28: Integration & Polish
- Integrate terminal into main layout (center panel, 60% width)
- Session persistence (reconnect after refresh)
- Multiple terminal tabs
- Terminal controls (clear, copy, search)
- Tokyo Night theme
- Performance testing (1000+ lines)
- **Ship Phase 2**

**Phase 2 Deliverables:**
- ✅ Real-time terminal streaming
- ✅ Multiple terminal tabs
- ✅ Session persistence
- ✅ Watch mode (read-only default)
- ✅ Interactive mode (optional)
- ✅ Tokyo Night theme
- ✅ <100ms latency

**Success Criteria:**
- [ ] Terminal streams in real-time
- [ ] Can handle 1000+ lines without lag
- [ ] Survives page refresh
- [ ] Latency <100ms
- [ ] ANSI colors render correctly

---

### 4.3 Phase 3: Full Dashboard (Weeks 5-8+)

**Goal**: Complete transformation into full Claude Code dashboard.

**Timeline**: 20+ days (4+ weeks)

**Prerequisites**: Phase 2 shipped and validated

#### Week 5: File Tree
**Days 29-32: File Navigation**
```typescript
// server/src/services/FileService.ts
class FileService {
  async getDirectoryContents(path: string, depth?: number): Promise<FileNode[]>
  async getFileContent(path: string): Promise<string>
  async getRecentFiles(): Promise<string[]>
  watchFiles(callback: (event: FileEvent) => void): void
}

// client/src/components/files/
FileTree.tsx        // Recursive tree component
FileNode.tsx        // Individual file/folder node
FileSearch.tsx      // Fuzzy file search (Ctrl+P)
```

**Days 33-35: Git Integration**
```bash
npm install simple-git
```

```typescript
// server/src/services/GitService.ts
import simpleGit from 'simple-git';

class GitService {
  async getStatus(): Promise<GitStatus>
  async getCommits(limit: number): Promise<Commit[]>
  async getDiff(file: string): Promise<string>
  async stageFiles(files: string[]): Promise<void>
  async unstageFiles(files: string[]): Promise<void>
}

// client/src/components/git/
GitDashboard.tsx    // Git status panel
GitStatus.tsx       // Branch, changes, staged files
CommitHistory.tsx   // Recent commits
```

#### Week 6: MCP Manager
**Days 36-40: MCP Integration**
```typescript
// server/src/services/MCPService.ts
class MCPService {
  async loadMCPConfig(): Promise<MCPServer[]>
  async getServerStatus(name: string): Promise<ServerStatus>
  async startServer(name: string): Promise<void>
  async stopServer(name: string): Promise<void>
  async getServerTools(name: string): Promise<MCPTool[]>
  async getServerLogs(name: string, limit: number): Promise<LogEntry[]>
}

// client/src/components/mcp/
MCPManager.tsx      // MCP servers list
ServerCard.tsx      // Individual server card
ToolsList.tsx       // Server tools modal
ServerLogs.tsx      // Log viewer
```

**Days 41-42: Integration**
- Add file tree to left panel (20% width)
- Add git dashboard to right sidebar
- Add MCP manager to right sidebar (tabs)
- Three-panel layout (file tree | terminal | sidebar)

#### Weeks 7-8: Polish & Deploy
**Days 43-48: Feature Polish**
- Dark mode (Tokyo Night throughout)
- Responsive design updates
- Performance optimization (virtual scrolling)
- Error handling and recovery
- Loading states and skeletons

**Days 49-56: Testing & Documentation**
- Comprehensive E2E tests
- Performance testing
- Security audit
- User documentation
- API documentation
- Deployment guides (Replit, Docker, VPS)
- **Ship Phase 3**

**Phase 3 Deliverables:**
- ✅ File tree with git status
- ✅ Git dashboard
- ✅ MCP server manager
- ✅ Three-panel layout
- ✅ Dark mode (Tokyo Night)
- ✅ Full documentation

**Success Criteria:**
- [ ] File tree handles 10,000+ files
- [ ] Git status updates in <1s
- [ ] MCP servers manageable from UI
- [ ] All features work together
- [ ] No memory leaks after 8 hours
- [ ] Production-ready deployment

---

## 5. TaskMaster Integration

### 5.1 File Structure

**TaskMaster Directory Layout:**
```
project-root/
└── .taskmaster/
    ├── tasks/
    │   └── tasks.json           # Main tasks file (READ-ONLY)
    ├── issues/                  # Issues directory (READ-WRITE)
    │   ├── issue-001.json
    │   ├── issue-002.json
    │   └── index.json           # Issue index
    ├── reports/
    │   └── task-complexity-report.json
    └── docs/
        └── prd.txt
```

### 5.2 Tasks.json Schema

**Understanding the Structure:**
```json
{
  "id": 1,
  "title": "Setup Project Structure",
  "description": "Initialize the project with necessary directories and configurations",
  "status": "done",           // pending, in-progress, done, blocked, deferred, cancelled
  "priority": "high",         // high, medium, low
  "dependencies": [],         // Array of task IDs
  "subtasks": [
    {
      "id": 1,
      "title": "Create directory structure",
      "description": "...",
      "status": "done",
      "dependencies": []
    },
    {
      "id": 2,
      "title": "Initialize git repository",
      "description": "...",
      "status": "done",
      "dependencies": [1]
    }
  ],
  "testStrategy": "...",
  "details": "..."
}
```

**Key Rules:**
1. **Never modify tasks.json directly** - TaskMaster CLI owns this file
2. **Watch for changes** - Use chokidar to detect updates
3. **Read-only access** - Dashboard displays tasks, doesn't edit them
4. **Subtask hierarchy** - Tasks can have nested subtasks (id 1.1, 1.1.1, etc.)
5. **Dependencies** - Task IDs that must complete first

### 5.3 Issues Schema

**Issue File Structure:**
```json
{
  "id": "issue-001",
  "title": "Terminal lag with large outputs",
  "description": "Terminal output lags behind by 2-3 seconds when Claude generates large code blocks (>500 lines)...",
  "severity": "high",         // critical, high, medium, low
  "status": "open",           // open, in-progress, resolved
  "relatedTaskId": "8.7",     // Optional link to task
  "relatedFile": "src/TerminalViewer.tsx",
  "relatedLine": 145,
  "tags": ["performance", "terminal"],
  "attachments": [
    {
      "name": "terminal-lag-screenshot.png",
      "path": ".taskmaster/issues/attachments/issue-001-1.png"
    }
  ],
  "createdAt": "2025-11-12T10:30:00Z",
  "updatedAt": "2025-11-12T10:30:00Z"
}
```

**Issue Management:**
1. **File naming**: `issue-{id}.json` (sequential numbering)
2. **Index file**: `.taskmaster/issues/index.json` tracks all issues
3. **Attachments**: Store in `.taskmaster/issues/attachments/`
4. **Task linking**: Use `relatedTaskId` to link to tasks
5. **File linking**: Use `relatedFile` and `relatedLine` for code references

### 5.4 TaskMaster MCP Integration (Future)

**Current Approach (Phase 1):**
- Read tasks.json directly with fs/promises
- Simple, fast, no external dependencies

**Future Approach (Phase 3+):**
- Use TaskMaster MCP server
- Access via `mcp__task-master-ai__get_tasks` tool
- Richer integration (create tasks, update status, etc.)

**Migration Path:**
```typescript
// Phase 1: Direct file reading
async function getTasks(): Promise<Task[]> {
  const tasksFile = path.join(projectRoot, '.taskmaster/tasks/tasks.json');
  const content = await fs.readFile(tasksFile, 'utf-8');
  return JSON.parse(content);
}

// Phase 3: MCP integration (optional enhancement)
async function getTasksViaMCP(): Promise<Task[]> {
  // Use TaskMaster MCP server for richer integration
  // Can create tasks, update status, etc.
}
```

### 5.5 Environment Configuration

**Required Environment Variables:**
```bash
# .env file
PORT=5000
NODE_ENV=development

# TaskMaster Integration
PROJECT_ROOT=/path/to/your/project          # Required
TASKMASTER_PATH=.taskmaster                 # Optional (default)
ISSUES_PATH=.taskmaster/issues              # Optional (default)

# Feature Flags
ENABLE_EDITING=false                        # File editing (Phase 3+)
ENABLE_GIT_ACTIONS=false                    # Git push/pull (Phase 3+)
ENABLE_MCP_MANAGEMENT=true                  # MCP server control (Phase 3+)
```

**Setup Script:**
```bash
#!/bin/bash
# setup-env.sh

cat > .env << EOF
PORT=5000
NODE_ENV=development
PROJECT_ROOT=$(pwd)
TASKMASTER_PATH=.taskmaster
ISSUES_PATH=.taskmaster/issues
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=false
EOF

echo "✅ Environment configured"
echo "   PROJECT_ROOT=$(pwd)"
```

---

## 6. Design System

### 6.1 Design Language

**Foundation**: Linear + Material Design Hybrid
**Rationale**: Utility-focused productivity tool requiring clarity, efficiency, and information density.

**Core Principles:**
1. Information clarity over visual flourish
2. Efficient scanning and quick task identification
3. Consistent, predictable interaction patterns
4. Professional, distraction-free workspace

### 6.2 Typography

**Font Stack:**
```css
--font-primary: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Hierarchy:**
```css
.page-title    { font-size: 24px; font-weight: 600; }  /* 2xl */
.section-header { font-size: 20px; font-weight: 600; } /* xl */
.task-title    { font-size: 16px; font-weight: 500; }  /* base */
.subtask-title { font-size: 14px; font-weight: 500; }  /* sm */
.metadata      { font-size: 12px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.05em; } /* xs */
.body-text     { font-size: 14px; font-weight: 400; }  /* sm */
.task-id       { font-size: 12px; font-family: var(--font-mono); font-weight: 500; } /* xs */
```

### 6.3 Color System

**Tokyo Night Theme** (Terminal + Code):
```css
:root {
  /* Background */
  --bg-primary: #1a1b26;
  --bg-secondary: #16161e;
  --bg-tertiary: #24283b;

  /* Text */
  --text-primary: #c0caf5;
  --text-secondary: #a9b1d6;
  --text-tertiary: #565f89;

  /* Accents */
  --accent-blue: #7aa2f7;
  --accent-green: #9ece6a;
  --accent-red: #f7768e;
  --accent-yellow: #e0af68;
  --accent-purple: #bb9af7;
  --accent-cyan: #7dcfff;
  --accent-orange: #ff9e64;

  /* UI Elements */
  --border: #3b4261;
  --border-hover: #545c7e;
}
```

**Light Mode** (Optional, Phase 4):
```css
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e5e5e5;
  --text-primary: #1a1a1a;
  --text-secondary: #525252;
  --text-tertiary: #a3a3a3;
}
```

**Status Colors:**
```css
.status-pending   { background: #3b4261; color: #7aa2f7; }
.status-progress  { background: #332a1f; color: #ff9e64; }
.status-done      { background: #1e2d1d; color: #9ece6a; }
.status-blocked   { background: #2d1f1f; color: #f7768e; }
.status-deferred  { background: #2d2136; color: #bb9af7; }
.status-cancelled { background: #24283b; color: #565f89; }
```

**Priority Colors:**
```css
.priority-high    { color: #f7768e; border-color: #f7768e; }
.priority-medium  { color: #ff9e64; border-color: #ff9e64; }
.priority-low     { color: #7aa2f7; border-color: #7aa2f7; }
```

**Severity Colors (Issues):**
```css
.severity-critical { background: #f7768e; color: white; }
.severity-high     { background: #ff9e64; color: white; }
.severity-medium   { background: #e0af68; color: white; }
.severity-low      { background: #7aa2f7; color: white; }
```

### 6.4 Spacing System

**Primitives** (Tailwind units):
```
micro-spacing:    2  (0.5rem / 8px)   # Within components
standard-spacing: 4  (1rem / 16px)    # Component padding
section-spacing:  6  (1.5rem / 24px)  # Between sections
major-spacing:    8  (2rem / 32px)    # Major sections
```

**Task Hierarchy Indentation:**
```css
.task-level-1 { padding-left: 0; }        /* Main tasks */
.task-level-2 { padding-left: 2rem; }     /* Subtasks */
.task-level-3 { padding-left: 4rem; }     /* Nested subtasks */
.task-level-4 { padding-left: 6rem; }     /* Deep nesting */
```

### 6.5 Layout System

**Phase 1 Layout** (Tasks + Issues):
```
┌────────────────────────────────────────────────────┐
│ Header (h-16)                                      │
├──────────────────────────┬─────────────────────────┤
│                          │                         │
│  Tasks Panel (70%)       │  Issues Panel (30%)     │
│  - Search/Filter         │  - Issue List           │
│  - Task List             │  - Issue Form           │
│  - Task Cards            │  - Issue Detail         │
│                          │                         │
│                          │                         │
└──────────────────────────┴─────────────────────────┘
```

**Phase 2 Layout** (Tasks + Terminal + Issues):
```
┌────────────────────────────────────────────────────┐
│ Header (h-16)                                      │
├──────────┬─────────────────────┬───────────────────┤
│          │                     │                   │
│  Tasks   │  Terminal Viewer    │   Issues          │
│  (20%)   │  (xterm.js)         │   (20%)           │
│          │  (60%)              │                   │
│          │                     │                   │
└──────────┴─────────────────────┴───────────────────┘
```

**Phase 3 Layout** (Full Dashboard):
```
┌────────────────────────────────────────────────────┐
│ Header (h-16)                                      │
├──────────┬─────────────────────┬───────────────────┤
│          │                     │                   │
│  File    │  Terminal Viewer    │   Sidebar         │
│  Tree    │  (xterm.js)         │   - Git           │
│  (20%)   │  (60%)              │   - MCP           │
│          │                     │   - Issues        │
│          │                     │   - Tasks         │
│          │                     │   (20%)           │
└──────────┴─────────────────────┴───────────────────┘
```

**Responsive Breakpoints:**
```css
/* Desktop: 3-panel layout */
@media (min-width: 1024px) {
  .layout { display: grid; grid-template-columns: 1fr 3fr 1fr; }
}

/* Tablet: Terminal full-width, collapsible sidebars */
@media (min-width: 768px) and (max-width: 1023px) {
  .layout { display: flex; flex-direction: column; }
  .sidebar { /* collapsible accordion */ }
}

/* Mobile: Single column, tab-based navigation */
@media (max-width: 767px) {
  .layout { display: flex; flex-direction: column; }
  .panel { /* swipe between tabs */ }
}
```

### 6.6 Component Patterns

**Task Card:**
```tsx
<div className="task-card border border-border rounded-lg p-4 hover:bg-bg-secondary">
  {/* Status Indicator */}
  <div className="w-1 h-full rounded-full bg-accent-blue" />

  {/* Task Content */}
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-2">
      <span className="task-id font-mono text-xs px-2 py-1 rounded bg-bg-tertiary">
        {task.id}
      </span>
      <h3 className="task-title font-medium">{task.title}</h3>
    </div>

    <p className="body-text text-text-secondary line-clamp-2">
      {task.description}
    </p>

    {/* Metadata Row */}
    <div className="flex gap-4 mt-4 text-xs text-text-tertiary">
      <StatusBadge status={task.status} />
      <PriorityBadge priority={task.priority} />
      {task.subtasks && (
        <span className="flex items-center gap-1">
          <Icon name="list" />
          {completedSubtasks}/{totalSubtasks}
        </span>
      )}
    </div>
  </div>

  {/* Expandable Chevron */}
  {task.subtasks && <Icon name="chevron-down" />}
</div>
```

**Status Badge:**
```tsx
<span className={cn(
  "px-3 py-1 rounded-full text-xs uppercase font-semibold tracking-wide",
  statusColors[task.status]
)}>
  {task.status}
</span>
```

**Progress Bar:**
```tsx
<div className="flex items-center gap-2">
  <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
    <div
      className="h-full bg-accent-green rounded-full transition-all"
      style={{ width: `${(completed / total) * 100}%` }}
    />
  </div>
  <span className="text-xs font-mono tabular-nums">
    {Math.round((completed / total) * 100)}%
  </span>
</div>
```

### 6.7 Animation Guidelines

**Use Sparingly** - All animations serve functional feedback:

```css
/* Task expand/collapse */
.task-subtasks {
  transition: height 200ms ease-in-out;
}

/* Modal open/close */
.modal {
  animation: fade-in 150ms ease-out,
             scale-in 150ms ease-out;
}

/* Hover states */
.card:hover {
  transition: background-color 100ms ease-out,
              box-shadow 100ms ease-out;
}

/* Progress bar fills */
.progress-fill {
  transition: width 300ms ease-out;
}

/* No decorative animations */
```

---

## 7. Development Workflow

### 7.1 Getting Started

**Prerequisites:**
```bash
# Node.js 20 LTS
node --version  # v20.x.x

# npm
npm --version   # 10.x.x

# Git
git --version   # 2.x.x
```

**Initial Setup:**
```bash
# 1. Clone repository
git clone <repo-url>
cd TaskMasterWebIntegration

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set PROJECT_ROOT

# 4. Start development server
npm run dev

# 5. Open browser
open http://localhost:5000
```

### 7.2 Project Scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

**Usage:**
```bash
npm run dev        # Development mode (hot reload)
npm run build      # Production build
npm start          # Run production server
npm run check      # Type check without emit
npm test           # Run unit tests
npm run test:e2e   # Run E2E tests
```

### 7.3 Git Workflow

**Branch Strategy:**
```bash
main              # Production-ready code
├── phase-1       # Phase 1 development
├── phase-2       # Phase 2 development
├── phase-3       # Phase 3 development
└── feature/*     # Individual features
```

**Development Flow:**
```bash
# Start new feature
git checkout -b feature/task-visualization

# Make changes, commit regularly
git add .
git commit -m "feat: add task card component"

# Push feature branch
git push origin feature/task-visualization

# When complete, merge to phase branch
git checkout phase-1
git merge feature/task-visualization

# Deploy phase branch to test
# If validated, merge to main
```

**Commit Convention:**
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Test updates
chore: Build/tooling changes
```

### 7.4 Code Quality

**TypeScript Strict Mode:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Linting** (Future):
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier
```

**Testing Strategy:**
```
Unit Tests (Vitest):
├── Services (TaskMasterService, IssueService)
├── Utilities (file reading, JSON parsing)
└── React hooks (useTerminal, useWebSocket)

Integration Tests:
├── API endpoints
├── WebSocket connections
└── File watching

E2E Tests (Playwright):
├── View tasks flow
├── Create issue flow
├── Filter tasks flow
└── Terminal streaming flow
```

### 7.5 Development Checklist

**Before Starting Feature:**
- [ ] Create feature branch
- [ ] Read relevant documentation
- [ ] Understand data flow
- [ ] Check for existing components

**During Development:**
- [ ] Follow TypeScript strict mode
- [ ] Match design system (spacing, colors, typography)
- [ ] Write unit tests for services
- [ ] Handle error cases
- [ ] Add loading states
- [ ] Test responsive design

**Before Committing:**
- [ ] Run `npm run check` (type check)
- [ ] Run `npm test` (unit tests)
- [ ] Test in browser manually
- [ ] Check responsive breakpoints
- [ ] Review git diff
- [ ] Write clear commit message

**Before Merging:**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Feature works end-to-end
- [ ] Documentation updated
- [ ] Screenshots taken (if UI change)

---

## 8. Deployment

### 8.1 Replit Deployment (Primary)

**Configuration** (Already set up in `.replit`):
```toml
modules = ["nodejs-20", "web", "postgresql-16"]
run = "npm run dev"

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80

[env]
PORT = "5000"
```

**Deployment Steps:**
1. Push code to GitHub
2. Import repository in Replit
3. Click "Deploy" button
4. Configure environment variables in Replit Secrets:
   - `PROJECT_ROOT=/home/runner/<repl-name>`
5. Access at: `https://<repl-name>.<username>.repl.co`

**Replit Secrets (Environment Variables):**
```
PROJECT_ROOT=/home/runner/<repl-name>
NODE_ENV=production
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=true
```

### 8.2 Docker Deployment (Optional)

**Dockerfile:**
```dockerfile
FROM node:20-alpine

# Install build tools for node-pty (Phase 2+)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install && cd client && npm install && cd ../server && npm install

# Copy source
COPY . .

# Build
RUN cd client && npm run build
RUN cd server && npm run build

EXPOSE 5000

ENV NODE_ENV=production
ENV PROJECT_ROOT=/app

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
      - ./your-project:/project:ro
    environment:
      - PROJECT_ROOT=/project
      - NODE_ENV=production
    restart: unless-stopped
```

**Build & Run:**
```bash
# Build image
docker build -t taskmaster-dashboard .

# Run container
docker run -d \
  -p 5000:5000 \
  -v $(pwd)/your-project:/project:ro \
  -e PROJECT_ROOT=/project \
  --name taskmaster-dashboard \
  taskmaster-dashboard

# Or use docker-compose
docker-compose up -d
```

### 8.3 VPS Deployment (Optional)

**Using PM2:**
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm git

# Install PM2
npm install -g pm2

# Clone and build
git clone <repo>
cd TaskMasterWebIntegration
npm install
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable on boot
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'taskmaster-dashboard',
    script: './dist/index.js',
    cwd: '/path/to/TaskMasterWebIntegration',
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

**Nginx Reverse Proxy:**
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

**SSL with Certbot:**
```bash
sudo certbot --nginx -d dashboard.yourdomain.com
```

### 8.4 Environment-Specific Configuration

**Development (.env.development):**
```bash
NODE_ENV=development
PORT=5000
PROJECT_ROOT=/path/to/test/project
LOG_LEVEL=debug
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
```

**Production (.env.production):**
```bash
NODE_ENV=production
PORT=5000
PROJECT_ROOT=/path/to/production/project
LOG_LEVEL=info
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
```

---

## Appendix A: Quick Reference

### A.1 Directory Structure

```
TaskMasterWebIntegration/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Header, Sidebar, Layout
│   │   │   ├── tasks/         # Task components
│   │   │   ├── issues/        # Issue components
│   │   │   ├── terminal/      # Terminal (Phase 2)
│   │   │   ├── files/         # File tree (Phase 3)
│   │   │   ├── git/           # Git dashboard (Phase 3)
│   │   │   └── mcp/           # MCP manager (Phase 3)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities (api, theme)
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   ├── index.html             # HTML template
│   └── package.json           # Client dependencies
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── tasks.ts       # Task endpoints
│   │   │   ├── issues.ts      # Issue endpoints
│   │   │   ├── terminal.ts    # Terminal endpoints (Phase 2)
│   │   │   ├── files.ts       # File endpoints (Phase 3)
│   │   │   ├── git.ts         # Git endpoints (Phase 3)
│   │   │   └── mcp.ts         # MCP endpoints (Phase 3)
│   │   ├── services/
│   │   │   ├── TaskMasterService.ts
│   │   │   ├── IssueService.ts
│   │   │   ├── TerminalService.ts (Phase 2)
│   │   │   ├── FileService.ts (Phase 3)
│   │   │   ├── GitService.ts (Phase 3)
│   │   │   └── MCPService.ts (Phase 3)
│   │   ├── websocket/
│   │   │   └── terminal.ts    # WebSocket handlers (Phase 2)
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── config.ts
│   │   └── index.ts           # Server entry point
│   └── package.json           # Server dependencies
├── shared/                    # Shared types
│   └── types.ts
├── docs/                      # Documentation
│   └── research/
│       ├── 2025-11-12-prd-gap-analysis.md
│       └── index.md
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Example environment
├── .replit                    # Replit configuration
├── package.json               # Root package.json
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── tailwind.config.ts         # Tailwind config
├── MASTER_IMPLEMENTATION_PLAN.md  # This document
└── README.md                  # Project README
```

### A.2 Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run check            # Type check
npm test                 # Run tests

# Build
npm run build            # Build for production
npm start                # Run production server

# Environment
cp .env.example .env     # Create environment file
nano .env                # Edit environment

# Git
git checkout -b feature/name  # New feature branch
git commit -m "feat: ..."     # Commit changes
git push origin feature/name  # Push branch

# Docker
docker build -t taskmaster-dashboard .
docker run -d -p 5000:5000 taskmaster-dashboard

# PM2
pm2 start ecosystem.config.js
pm2 logs taskmaster-dashboard
pm2 restart taskmaster-dashboard
```

### A.3 Key Files

| File | Purpose | Phase |
|------|---------|-------|
| `MASTER_IMPLEMENTATION_PLAN.md` | Single source of truth (this file) | All |
| `.env` | Environment configuration | All |
| `server/src/services/TaskMasterService.ts` | Tasks integration | Phase 1 |
| `server/src/services/IssueService.ts` | Issues management | Phase 1 |
| `client/src/components/tasks/TaskCard.tsx` | Task display | Phase 1 |
| `server/src/services/TerminalService.ts` | PTY management | Phase 2 |
| `client/src/components/terminal/TerminalViewer.tsx` | Terminal UI | Phase 2 |
| `server/src/services/FileService.ts` | File operations | Phase 3 |
| `server/src/services/GitService.ts` | Git integration | Phase 3 |

---

## Appendix B: Decision Log

### B.1 Major Decisions

**Decision 1: Hybrid Phased Approach**
- **Date**: 2025-11-12
- **Context**: Two conflicting PRDs with 0% implementation
- **Decision**: Build incrementally (Original PRD → Terminal → Full Dashboard)
- **Rationale**: De-risks ambitious scope, validates value early, allows pivoting
- **Status**: ✅ Approved

**Decision 2: Direct tasks.json Reading (Phase 1)**
- **Date**: 2025-11-12
- **Context**: Original PRD read tasks.json directly, new PRD suggested MCP
- **Decision**: Start with direct file reading, migrate to MCP later
- **Rationale**: Simpler, faster to implement, no external dependencies
- **Status**: ✅ Approved

**Decision 3: Read-only Task Management**
- **Date**: 2025-11-12
- **Context**: Should dashboard edit tasks or just display?
- **Decision**: Read-only for Phase 1, keep TaskMaster CLI as source of truth
- **Rationale**: Reduces complexity, avoids conflicts, maintains single source
- **Status**: ✅ Approved

**Decision 4: Tokyo Night Theme**
- **Date**: 2025-11-12
- **Context**: What color scheme for dark mode?
- **Decision**: Tokyo Night (matches terminal theme)
- **Rationale**: Consistent with development tools, proven aesthetics
- **Status**: ✅ Approved

**Decision 5: Replit as Primary Deployment**
- **Date**: 2025-11-12
- **Context**: Where to deploy initially?
- **Decision**: Replit (primary), Docker (optional)
- **Rationale**: Already configured, fast deployment, easy sharing
- **Status**: ✅ Approved

### B.2 Open Questions

**Question 1: Phase 2 Validation Criteria**
- What metrics determine if terminal viewer is successful?
- **Proposed**: User feedback + usage analytics after 1 week
- **Status**: To be decided after Phase 1

**Question 2: Phase 3 Scope**
- Build full dashboard or focus on terminal + tasks?
- **Proposed**: Decide after Phase 2 validation
- **Status**: Pending

**Question 3: Authentication**
- Multi-user support or single-user tool?
- **Proposed**: Single-user for MVP, multi-user in Phase 4+
- **Status**: Deferred to Phase 4

---

## Appendix C: Success Metrics

### C.1 Phase 1 Success Criteria

**Functional:**
- [ ] View all tasks from tasks.json
- [ ] Expand/collapse subtask hierarchy
- [ ] Create/edit/delete issues
- [ ] Link issues to tasks
- [ ] Search tasks by title/description
- [ ] Filter by status/priority
- [ ] Task detail modal works
- [ ] Responsive on mobile/tablet

**Performance:**
- [ ] Page loads in <2 seconds
- [ ] Task list handles 100+ tasks
- [ ] Search returns results in <300ms
- [ ] Smooth expand/collapse animations
- [ ] No lag when filtering

**Quality:**
- [ ] Zero crashes in 8-hour session
- [ ] All TypeScript strict mode checks pass
- [ ] Unit tests for services (>80% coverage)
- [ ] Works in Chrome, Firefox, Safari

### C.2 Phase 2 Success Criteria

**Functional:**
- [ ] Terminal streams in real-time
- [ ] Multiple terminal tabs work
- [ ] Session persists across refresh
- [ ] ANSI colors render correctly
- [ ] Can toggle watch/interactive mode

**Performance:**
- [ ] Terminal latency <100ms
- [ ] Handles 1000+ lines without lag
- [ ] No memory leaks after 4 hours
- [ ] WebSocket reconnects automatically

**Quality:**
- [ ] Terminal state consistent with actual PTY
- [ ] No data loss on disconnect
- [ ] Terminal controls work (clear, copy, search)

### C.3 Phase 3 Success Criteria

**Functional:**
- [ ] File tree shows project structure
- [ ] Git status indicators accurate
- [ ] Git dashboard updates in <1s
- [ ] MCP servers manageable from UI
- [ ] Three-panel layout works on desktop

**Performance:**
- [ ] File tree handles 10,000+ files
- [ ] Virtual scrolling smooth
- [ ] Git operations non-blocking
- [ ] MCP server status updates in <5s

**Quality:**
- [ ] All features integrate seamlessly
- [ ] No conflicts between features
- [ ] Production-ready deployment
- [ ] Complete user documentation

---

## Conclusion

This document is the **single source of truth** for TaskMaster Dashboard implementation.

**Key Takeaways:**

1. **Current State**: 5% complete (infrastructure only), ready to build
2. **Approach**: Hybrid phased (Original PRD → Terminal → Full Dashboard)
3. **Timeline**: 3 weeks (MVP) → 4 weeks (terminal) → 8 weeks (full)
4. **Design**: Linear + Material hybrid, Tokyo Night theme
5. **Deployment**: Replit (primary), Docker (optional)

**Next Steps:**

1. **Review this document** with team/stakeholders
2. **Set up environment** (.env file, PROJECT_ROOT)
3. **Install Phase 1 dependencies** (chokidar for file watching)
4. **Start Phase 1 implementation** (TaskMasterService first)
5. **Ship Phase 1 in 3 weeks**

**Philosophy:**

> "Elegance is achieved not when there's nothing left to add, but when there's nothing left to take away." - Antoine de Saint-Exupéry

Build something great in 3 weeks, not everything in 6 months.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-12
**Status**: Authoritative Source
**Generated with**: Ultrathink Deep Analysis

---

## Document Control

**Supersedes:**
- `attached_assets/Pasted--TaskMaster-Web-Viewer-Product-Requirements-Document-*`
- `2025-11-12-claude-code-development-dashboard-prd.md`
- `REFACTOR_PLAN.md`

**References:**
- `design_guidelines.md` (design system - keep as reference)
- `docs/research/2025-11-12-prd-gap-analysis.md` (analysis that led to this plan)
- `.replit` (deployment configuration)
- `package.json` (dependencies)

**Updates:**
- All implementation decisions should reference this document
- Changes to roadmap or architecture require updating this document
- Version history tracked in git commits
