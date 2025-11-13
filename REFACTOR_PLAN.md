# TaskMasterWebIntegration → Claude Code Dashboard Refactor Plan

**Status:** Ready to refactor
**New PRD:** `2025-11-12-claude-code-development-dashboard-prd.md`
**Original PRD:** `attached_assets/Pasted--TaskMaster-Web-Viewer-Product-Requirements-Document-1-Project-Overview-1-1-Project-1761403188834_1761403188835.txt`

---

## Current State Analysis

### ✅ What Already Exists

**Build Infrastructure:**
- React 18 + TypeScript + Vite (perfect!)
- Tailwind CSS configured
- shadcn/ui components (Radix UI primitives)
- Express backend setup
- WebSocket support (ws package)
- Replit configuration
- Design guidelines (Linear + Material Design)

**Project Structure:**
- Monorepo with client/ and server/
- TypeScript strict mode
- Basic routing with Wouter

### ❌ What's Missing (Empty Directories)

**Client Side:**
- All components/ are empty (no implementations)
- All hooks/ are empty
- All pages/ are empty
- No actual UI built yet

**Server Side:**
- Basic Express setup exists
- Routes skeleton exists
- No terminal service
- No file service
- No git integration
- No MCP integration

---

## New Architecture (From Updated PRD)

### Key Changes from Original PRD

**Original Focus:** Task Master Web Viewer with issues
**New Focus:** Claude Code Development Dashboard (full IDE replacement)

**New Features Added:**
1. **Terminal Viewer** - Real-time xterm.js terminal streaming
2. **MCP Server Manager** - Visual MCP dashboard
3. **Git Dashboard** - Real-time git status
4. **File Tree** - Enhanced with git status indicators
5. **Task Master Integration** - Read-only task viewing
6. **Issue Tracker** - (already in original PRD)

---

## Refactor Strategy

### Option 1: Clean Slate (Recommended)

**Why:** Empty directories make this easy
**Steps:**
1. Keep existing infrastructure (package.json, configs)
2. Add new dependencies (xterm.js, node-pty, simple-git)
3. Build components from scratch using new PRD
4. Follow Phase 1-4 implementation plan

**Pros:**
- Clean architecture
- No legacy code to refactor
- Follow modern patterns
- Full control

**Cons:**
- More initial work
- Start from zero on UI

### Option 2: Hybrid Approach

**Why:** Leverage existing design guidelines
**Steps:**
1. Keep design guidelines (already great)
2. Keep shadcn/ui setup
3. Add new features alongside Task Master viewer
4. Merge both PRDs

**Pros:**
- Use existing design work
- Incremental refactor
- Can keep what works

**Cons:**
- More complex merge
- Need to align architectures

---

## Recommended: Option 1 (Clean Slate)

Since directories are empty, go **full clean slate** with the new PRD architecture.

---

## Step-by-Step Refactor Plan

### Phase 0: Preparation (30 minutes)

**1. Add Missing Dependencies**

```bash
# Terminal emulation
npm install xterm @xterm/addon-fit @xterm/addon-web-links

# PTY processes
npm install node-pty
npm install --save-dev @types/node-pty

# Git integration
npm install simple-git

# File watching
npm install chokidar
```

**2. Update Environment Variables**

Create `.env`:
```bash
PORT=5000
NODE_ENV=development
PROJECT_ROOT=/path/to/your/main/project
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=true
```

**3. Git Commit Current State**

```bash
git add -A
git commit -m "chore: prepare for refactor with new PRD"
git checkout -b feature/dashboard-refactor
```

---

### Phase 1: Terminal + File Tree (Week 1)

Follow PRD Section 6.1 exactly.

**Day 1: Terminal Backend**

1. Create `server/src/services/TerminalService.ts`
   - Use node-pty for PTY creation
   - Session management
   - Multiple terminal support

2. Create `server/src/websocket/terminal.ts`
   - Socket.io setup
   - Terminal streaming
   - Attach/detach logic

3. Update `server/src/server.ts`
   - Add Socket.io middleware
   - Mount terminal WebSocket handlers

**Day 2-3: Terminal Frontend**

1. Create `client/src/components/terminal/TerminalViewer.tsx`
   - xterm.js integration
   - Tokyo Night theme
   - WebSocket connection

2. Create `client/src/hooks/useTerminal.ts`
   - Terminal lifecycle management
   - Session persistence

3. Create `client/src/components/terminal/TerminalTabs.tsx`
   - Multiple terminal tabs
   - Tab switching

**Day 4-5: File Tree**

1. Create `server/src/services/FileService.ts`
   - Recursive directory listing
   - Git status integration
   - File content reading

2. Create `server/src/routes/files.ts`
   - REST API endpoints

3. Create `client/src/components/files/FileTree.tsx`
   - Recursive tree component
   - Git status indicators
   - Lazy loading

**Day 6-7: Testing & Polish**

- Unit tests for services
- Integration tests
- Performance testing with large repos

---

### Phase 2: Git + MCP (Week 2)

Follow PRD Section 6.2.

**Implementation details in PRD pages 82-89.**

---

### Phase 3: Issues + Tasks (Week 3)

Follow PRD Section 6.3.

**Use original PRD's issue tracker design** + new Task Master integration.

---

### Phase 4: Polish + Deploy (Week 4)

Follow PRD Section 6.4.

**Deployment to Replit ready!**

---

## Quick Start Commands

**When you're ready to start:**

```bash
# Navigate to project
cd /home/anombyte/Projects/projects/Backlog/TaskMasterWebIntegration

# Install new dependencies
npm install xterm @xterm/addon-fit @xterm/addon-web-links node-pty simple-git chokidar

# Start development
npm run dev

# Open browser
# http://localhost:5000
```

---

## File Changes Needed

### New Files to Create

**Server:**
```
server/src/
├── services/
│   ├── TerminalService.ts       # NEW
│   ├── FileService.ts           # NEW
│   ├── GitService.ts            # NEW
│   ├── MCPService.ts            # NEW
│   ├── IssueService.ts          # NEW
│   └── TaskMasterService.ts     # NEW
├── websocket/
│   └── terminal.ts              # NEW
├── routes/
│   ├── files.ts                 # NEW
│   ├── git.ts                   # NEW
│   ├── mcp.ts                   # NEW
│   ├── issues.ts                # NEW
│   └── tasks.ts                 # NEW
└── server.ts                    # UPDATE
```

**Client:**
```
client/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # NEW
│   │   ├── ThreePanel.tsx       # NEW
│   │   └── Sidebar.tsx          # NEW
│   ├── terminal/
│   │   ├── TerminalViewer.tsx   # NEW
│   │   ├── TerminalTabs.tsx     # NEW
│   │   └── TerminalControls.tsx # NEW
│   ├── files/
│   │   ├── FileTree.tsx         # NEW
│   │   ├── FileNode.tsx         # NEW
│   │   └── FileSearch.tsx       # NEW
│   ├── git/
│   │   ├── GitDashboard.tsx     # NEW
│   │   └── GitStatus.tsx        # NEW
│   ├── mcp/
│   │   ├── MCPManager.tsx       # NEW
│   │   └── ServerCard.tsx       # NEW
│   ├── issues/
│   │   ├── IssueTracker.tsx     # NEW (from original PRD)
│   │   └── IssueForm.tsx        # NEW
│   └── tasks/
│       └── TaskMasterPanel.tsx  # NEW
├── hooks/
│   ├── useTerminal.ts           # NEW
│   ├── useFileTree.ts           # NEW
│   ├── useGitStatus.ts          # NEW
│   └── useWebSocket.ts          # NEW
└── App.tsx                      # UPDATE
```

---

## Design Consistency

**Keep from existing project:**
- `design_guidelines.md` - Linear + Material Design hybrid
- Tokyo Night color scheme
- Typography system (Inter + JetBrains Mono)
- Spacing primitives
- shadcn/ui components

**Add from new PRD:**
- Three-panel layout specification
- Terminal viewer theming
- Component hierarchy
- Responsive breakpoints

---

## Testing Strategy

**From PRD:**
1. **Unit Tests** - All services
2. **Integration Tests** - API endpoints
3. **E2E Tests** - Critical user flows
4. **Performance Tests** - Large repos, long sessions

**Test with:**
- This system-knowledge-vectordb project (real Claude Code use)
- Large repos (>10k files)
- Long terminal sessions (8+ hours)

---

## Success Criteria (From PRD)

**Before marking complete:**

1. **Functional**
   - [ ] Terminal streams in real-time
   - [ ] File tree shows git status
   - [ ] MCP servers manageable
   - [ ] Issues and tasks work

2. **Performance**
   - [ ] UI loads < 1 second
   - [ ] Terminal latency < 100ms
   - [ ] No crashes after 8 hours

3. **Deployable**
   - [ ] Works on Replit
   - [ ] Docker container ready
   - [ ] Complete documentation

---

## Next Steps

1. **Review the PRD** (2025-11-12-claude-code-development-dashboard-prd.md)
2. **Decide: Clean slate or hybrid?** (Recommend clean slate)
3. **Start Phase 1** when ready
4. **Follow PRD implementation plan exactly**

---

## Questions to Answer Before Starting

1. **Scope:** Full dashboard or just terminal viewer first?
   - **Recommend:** Start with Phase 1 (Terminal + File Tree)

2. **Project Root:** Which project will this watch?
   - Set `PROJECT_ROOT` env var
   - Test with system-knowledge-vectordb first

3. **Deployment Target:** Replit, Docker, or VPS?
   - **Recommend:** Replit for easy sharing

4. **Timeline:** How much time to invest?
   - **Phase 1:** 1 week minimum
   - **Full MVP:** 4 weeks recommended

---

**Ready to refactor!** The PRD is comprehensive and ready for implementation. 🚀
