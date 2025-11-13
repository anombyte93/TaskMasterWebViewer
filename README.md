# TaskMaster Dashboard

> **A progressive web dashboard for TaskMaster users, evolving from focused task viewer to comprehensive Claude Code development platform.**

**🎉 Phase 1 MVP Released!** | **Status**: Production-ready, awaiting Replit deployment

📋 **[View Release Notes](RELEASE_NOTES_PHASE_1.md)** | 🚀 **[Deploy to Replit](docs/deployment/replit-setup.md)**

---

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd TaskMasterWebIntegration
npm install

# Configure environment
cp .env.example .env
# Edit .env: Set PROJECT_ROOT=/path/to/your/project

# Start development
npm run dev

# Open browser
open http://localhost:5000
```

---

## What Is This?

**Phase 1** (Weeks 1-3): TaskMaster Web Viewer
- Visual task management for `.taskmaster/tasks.json`
- Issue tracking with `.taskmaster/issues/`
- Search, filter, and navigate tasks easily

**Phase 2** (Week 4): Real-time Terminal
- Live terminal streaming with xterm.js
- Solves VSCode crash problem
- Watch Claude Code sessions in browser

**Phase 3** (Weeks 5-8+): Full Development Dashboard
- File tree with git status
- Git dashboard with commits/diffs
- MCP server management
- Complete IDE replacement

---

## Documentation

| Document | Purpose |
|----------|---------|
| **[MASTER_IMPLEMENTATION_PLAN.md](MASTER_IMPLEMENTATION_PLAN.md)** | **Single source of truth** - Read this first |
| [design_guidelines.md](design_guidelines.md) | Design system reference |
| [docs/research/2025-11-12-prd-gap-analysis.md](docs/research/2025-11-12-prd-gap-analysis.md) | Gap analysis |

> **All implementation should reference MASTER_IMPLEMENTATION_PLAN.md as the authoritative source.**

---

## Project Structure

```
TaskMasterWebIntegration/
├── client/           # React frontend (empty - Phase 1 starts here)
├── server/           # Express backend (skeleton - Phase 1 starts here)
├── shared/           # Shared TypeScript types
├── docs/             # Documentation and research
├── .replit           # Replit deployment config
└── MASTER_IMPLEMENTATION_PLAN.md  # 📖 START HERE
```

---

## Technology Stack

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
**Backend**: Express + Node.js 20 + TypeScript
**Terminal** (Phase 2): xterm.js + node-pty + Socket.io
**Git** (Phase 3): simple-git
**Deployment**: Replit (primary), Docker (optional)

---

## Development

```bash
# Development mode
npm run dev              # http://localhost:5000

# Type checking
npm run check

# Testing
npm test                 # Unit tests
npm run test:e2e         # E2E tests (future)

# Build
npm run build            # Production build
npm start                # Run production server
```

---

## Environment Variables

```bash
# Required
PROJECT_ROOT=/path/to/your/project    # Where your .taskmaster/ directory is

# Optional
PORT=5000                              # Server port (default: 5000)
NODE_ENV=development                   # development | production
TASKMASTER_PATH=.taskmaster            # TaskMaster directory (default)
ENABLE_EDITING=false                   # File editing (Phase 3+)
ENABLE_GIT_ACTIONS=false               # Git push/pull (Phase 3+)
ENABLE_MCP_MANAGEMENT=false            # MCP server control (Phase 3+)
```

---

## TaskMaster Integration

This dashboard integrates with TaskMaster:

```
your-project/
└── .taskmaster/
    ├── tasks/
    │   └── tasks.json       # Read-only (TaskMaster CLI owns this)
    ├── issues/              # Read-write (dashboard manages issues)
    │   ├── issue-001.json
    │   └── index.json
    └── reports/
        └── task-complexity-report.json
```

**Key Principles**:
- **Tasks**: Read-only, TaskMaster CLI is source of truth
- **Issues**: Full CRUD, managed by dashboard
- **File watching**: Auto-updates when tasks.json changes

---

## Roadmap

### ✅ Phase 0: Infrastructure (Complete)
- React + TypeScript + Vite setup
- Express backend skeleton
- Tailwind + shadcn/ui components
- Replit deployment config

### ✅ Phase 1: Task Viewer + Issues (Complete) - **SHIPPED 11/13/2025**
- [x] TaskMasterService (read tasks.json)
- [x] IssueService (CRUD for issues)
- [x] Task list with hierarchy
- [x] Issue tracker
- [x] Search and filters
- [x] **Shipped working MVP**
- 📋 [Release Notes](RELEASE_NOTES_PHASE_1.md) | 🚀 [Deploy Now](docs/deployment/replit-setup.md)

### 🚀 Phase 2: Terminal Viewer (Week 4)
- [ ] TerminalService (node-pty)
- [ ] Real-time streaming (Socket.io)
- [ ] xterm.js integration
- [ ] Multiple terminal tabs
- [ ] **Solve VSCode crash problem**

### 🎨 Phase 3: Full Dashboard (Weeks 5-8+)
- [ ] File tree with git status
- [ ] Git dashboard
- [ ] MCP server manager
- [ ] Three-panel layout
- [ ] **Complete IDE replacement**

---

## Design System

**Design Language**: Linear + Material Design hybrid
**Theme**: Tokyo Night (dark mode default)
**Typography**: Inter (UI), JetBrains Mono (code)
**Spacing**: Tailwind primitives (2, 4, 6, 8)

See [design_guidelines.md](design_guidelines.md) for complete design system.

---

## Deployment

### Replit (Primary)
```bash
# Already configured in .replit
# Just push to GitHub and import in Replit
# Click "Deploy" button
# Access at: https://<repl-name>.<username>.repl.co
```

### Docker (Optional)
```bash
docker build -t taskmaster-dashboard .
docker run -d -p 5000:5000 \
  -v $(pwd)/your-project:/project:ro \
  -e PROJECT_ROOT=/project \
  taskmaster-dashboard
```

### VPS with PM2 (Optional)
```bash
npm install -g pm2
npm run build
pm2 start ecosystem.config.js
```

---

## Contributing

1. Read [MASTER_IMPLEMENTATION_PLAN.md](MASTER_IMPLEMENTATION_PLAN.md)
2. Create feature branch: `git checkout -b feature/your-feature`
3. Follow TypeScript strict mode
4. Match design system (spacing, colors, typography)
5. Write tests for services
6. Commit: `git commit -m "feat: your feature"`
7. Push and create PR

---

## Success Metrics

**Phase 1** (Shipping Criteria):
- ✅ View all tasks from tasks.json
- ✅ Expandable subtask hierarchy
- ✅ Create/edit/delete issues
- ✅ Search/filter works
- ✅ Mobile-friendly
- ✅ Zero crashes in 8-hour session

**Phase 2** (Killer Feature):
- ✅ Terminal streaming <100ms latency
- ✅ Handles 1000+ lines without lag
- ✅ Session persistence

**Phase 3** (Full Platform):
- ✅ File tree with 10,000+ files
- ✅ Git status updates <1s
- ✅ MCP servers manageable
- ✅ Production-ready

---

## Philosophy

> "Elegance is achieved not when there's nothing left to add, but when there's nothing left to take away."

**Design Principles**:
1. **Elegant by default** - Ship something great, not everything mediocre
2. **Simplify ruthlessly** - Each phase should feel complete
3. **Terminal-first** - The terminal never lies, UI shows terminal truth
4. **Information density** - Developer tools need clarity, not decoration
5. **Stability over features** - If it crashes, it fails

---

## License

MIT

---

## Support

- **Documentation**: [MASTER_IMPLEMENTATION_PLAN.md](MASTER_IMPLEMENTATION_PLAN.md)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Version**: 1.0.0 (Phase 1 MVP)
**Status**: 🎉 Production-ready, awaiting Replit deployment
**Last Updated**: 2025-11-13
**Release Notes**: [RELEASE_NOTES_PHASE_1.md](RELEASE_NOTES_PHASE_1.md)
