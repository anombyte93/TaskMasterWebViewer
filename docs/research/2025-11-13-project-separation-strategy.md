# Research: Project Separation Strategy for Solo AI Developer

**Date**: 2025-11-13
**Mode**: Ultrathink + Perplexity Pro Research
**Query**: How to keep dashboard and autonomous execution projects separate as solo AI developer

---

## Executive Summary

**The Core Insight**: The autonomous execution system is NOT a separate project—it's the natural evolution of the TaskMaster Web Dashboard. Trying to separate them creates artificial complexity. The elegant solution is **progressive enhancement**: complete current dashboard work (Phase 2.1), then build autonomous features incrementally in the same codebase using git branches for psychological separation.

**Recommended Approach**: Hybrid git workflow with clear feature boundaries
- Main branch: Stable dashboard features
- Feature branches: Autonomous execution phases
- Shared infrastructure: One codebase, one deployment, unified vision

---

## The Real Problem (Questioning Assumptions)

### What You Said
> "I want to keep these projects kind of separate and i dont know what we should do as a solo ai developer"

### What You're Really Asking
1. **Mental clarity**: "I'm overwhelmed by 40,000 words of architecture"
2. **Prioritization**: "Should I finish tooltips or start the big vision?"
3. **Organization**: "How do I work on both without confusion?"
4. **Solo developer anxiety**: "Can I actually do this alone?"

### The WWSJD Question
"Why are we treating these as separate projects when they share everything?"

**Shared:**
- ✅ Technology stack (React, Express, TypeScript)
- ✅ Infrastructure (TaskMaster MCP, Perplexity MCP)
- ✅ Data source (.taskmaster files)
- ✅ Goal (Make AI development more productive)
- ✅ User (You, the solo developer)

**Different:**
- ❌ Scope? No—autonomous execution needs the dashboard (Phase 3 integration)
- ❌ Timeline? No—autonomous execution builds on top of current dashboard
- ❌ Team? No—it's still you

**Conclusion**: These are NOT separate projects. One is the natural evolution of the other.

---

## Research Findings

### Monorepo vs Polyrepo (From Perplexity Pro)

**Polyrepo Benefits**:
- Clear project boundaries
- Simpler per-project workflows
- Independent lifecycles
- Easier context switching

**Monorepo Benefits**:
- Unified tooling
- Atomic cross-project changes
- Shared dependencies
- Single source of truth

**Hybrid Approach** (Best for Solo Developer):
- Core shared libraries in one place
- Truly independent projects separate
- Clear module boundaries within monorepo

### Solo Developer Best Practices

**Separation of Concerns**:
- Well-defined layers with explicit responsibilities
- Strict boundaries between code, data, tooling
- Isolate AI context from business logic

**Reusable Components**:
- Build domain-agnostic primitives
- Publish internal packages with stable versioning
- Parameterizable templates for common workflows

**Shared Tooling**:
- Centralize code quality, CI/CD, testing
- Single source of truth for configurations
- Modular agent framework reused across projects

**AI Context Management**:
- Centralized context layer preserving project state
- Modular context pipelines (retrieve, load, inject)
- Version AI context alongside code

---

## The Elegant Solution

### Option A: Progressive Enhancement (Recommended)

**Philosophy**: Build features incrementally in natural evolution order

**Implementation**:

```bash
# Current State
TaskMasterWebIntegration/
└── System Dashboard (working, needs tooltips)

# Phase 1: Complete Current Work (4-6 hours)
git checkout -b feature/dashboard-phase-2.1
# Implement tooltips, help panel, about page
git commit -m "feat: Phase 2.1 dashboard improvements complete"
git checkout main
git merge feature/dashboard-phase-2.1

# Phase 2: Start Autonomous Execution (Week 1-2)
git checkout -b feature/autonomous-execution-foundation
# Parse PRD, generate tasks, build orchestrator
git commit -m "feat: Autonomous execution foundation (Phase 1)"

# Phase 3: Incremental Development
# Keep working on feature/autonomous-execution-foundation
# Merge to main when each phase is stable

# Result: One project, clear progression, no confusion
```

**Directory Structure**:
```
TaskMasterWebIntegration/
├── client/
│   ├── src/pages/
│   │   ├── Dashboard.tsx (current)
│   │   ├── SystemDashboard.tsx (current)
│   │   └── AutonomousExecutionDashboard.tsx (future - Phase 3)
│   └── src/components/
│       ├── ui/ (shared across all features)
│       ├── system/ (system dashboard specific)
│       └── autonomous/ (autonomous execution specific)
├── server/
│   ├── src/routes/
│   │   ├── tasks.ts (current)
│   │   ├── issues.ts (current)
│   │   ├── system.ts (current)
│   │   └── autonomous.ts (future - Phase 1)
│   └── src/services/
│       ├── TaskMasterService.ts (current)
│       ├── IssueService.ts (current)
│       └── OrchestratorService.ts (future - Phase 1)
├── docs/
│   └── research/
│       ├── 2025-11-13-dashboard-evolution... (dashboard)
│       └── 2025-11-13-ULTRATHINK-AUTONOMOUS... (autonomous)
└── .taskmaster/
    └── docs/
        ├── prd.txt (original dashboard PRD)
        └── autonomous-execution-prd.txt (autonomous PRD)
```

**Benefits**:
- ✅ One codebase, one deployment, one context
- ✅ Shared components and services
- ✅ Natural progression (dashboard → autonomous view)
- ✅ Git branches provide psychological separation
- ✅ Can work incrementally without context switching

**Workflow**:
1. Main branch: Always stable, deployable
2. Feature branches: Work in progress
3. Merge when phase complete and tested
4. Deploy continuously

---

### Option B: Separate Repositories (NOT Recommended)

**If you absolutely want separate projects:**

```bash
# Repository 1: TaskMaster Dashboard
~/Projects/TaskMasterWebIntegration/
└── Pure dashboard functionality

# Repository 2: Autonomous Execution System
~/Projects/TaskMasterAutonomousExecution/
└── Orchestrator, waves, effectiveness analyzer

# Shared: TaskMaster MCP
~/.local/share/task-master-ai/
└── Common task storage
```

**Why This is Wrong**:
- ❌ Duplicated infrastructure (two servers, two builds)
- ❌ Redundant MCP integration code
- ❌ No shared UI components
- ❌ Two separate deployments to manage
- ❌ Autonomous execution NEEDS the dashboard (Phase 3)
- ❌ More cognitive overhead for solo developer

**When This Makes Sense**:
- Projects have completely different tech stacks
- Projects serve different users
- Projects have different lifecycles
- Projects need independent deployment schedules

**Your Case**: None of these apply.

---

## The Inevitable Path Forward

### Week 0: Finish Current Commitment (Today - This Week)

**Goal**: Complete Phase 2.1 dashboard improvements

**Why**:
- You committed to users in previous session
- Quick win (4-6 hours) builds momentum
- Establishes foundation for Phase 2.2
- Demonstrates progress before tackling big vision

**Tasks**:
1. Create `MetricTooltip` component
2. Add tooltips to SystemDashboard
3. Create `HelpPanel` component
4. Create `/about` page
5. Update README
6. Test with users
7. Git commit: "feat: Phase 2.1 complete"

**Time**: 4-6 hours
**Deliverable**: Dashboard users understand what they're looking at

---

### Week 1-2: Foundation (Phase 1 Autonomous Execution)

**Goal**: Build orchestrator, achieve 2x speedup

**Approach**: New git branch

```bash
git checkout -b feature/autonomous-execution-foundation

# Parse autonomous execution PRD
# (Generates ~30-50 tasks via TaskMaster MCP)

# Build:
# - Orchestrator agent
# - Wave dependency analyzer
# - Research integration
# - Verification enforcement

# Test on small project (5-10 tasks)
# Measure: 2x speedup, 90% autonomy

git commit -m "feat: Autonomous execution foundation (Phase 1)"
```

**Why Branch Strategy**:
- Psychological separation (different git context)
- Can switch back to main for urgent fixes
- Merge when stable and tested
- Main branch stays deployable

**Time**: 1-2 weeks
**Deliverable**: Orchestrator working, 2x speedup proven

---

### Week 3-4: Quality & Learning (Phase 2 Autonomous)

**Goal**: Effectiveness analyzer, 3x speedup

**Approach**: Continue on same branch or new branch

```bash
# Option A: Continue on feature/autonomous-execution-foundation
git checkout feature/autonomous-execution-foundation

# Option B: New branch from main
git checkout main
git merge feature/autonomous-execution-foundation
git checkout -b feature/autonomous-effectiveness-analyzer

# Build effectiveness analyzer
# Test on medium project (15 tasks)
# Generate first effectiveness report

git commit -m "feat: Effectiveness analyzer complete (Phase 2)"
```

**Time**: 1-2 weeks
**Deliverable**: Self-learning system operational

---

### Week 5-6: Dashboard Integration (Phase 3 Autonomous)

**Goal**: Real-time autonomous execution view in dashboard

**THIS IS WHERE THEY MERGE**:

```bash
# Now the autonomous system integrates with existing dashboard
client/src/pages/AutonomousExecutionDashboard.tsx

# Reuses existing components:
# - UI components from client/src/components/ui/
# - WebSocket infrastructure from client/src/hooks/
# - API patterns from server/src/routes/

# New route:
http://localhost:5173/autonomous

# Navigation:
Dashboard → System → Autonomous Execution
```

**Why This Proves They're One Project**:
- Uses same React app
- Same Express server
- Same TaskMaster MCP integration
- Shares 80%+ of infrastructure

**Time**: 1-2 weeks
**Deliverable**: Full visibility into autonomous execution

---

## Context Management Strategy

### Problem: Solo Developer Context Switching

**Challenge**: Jumping between dashboard work and autonomous execution loses context

**Solution**: Git branch = Context boundary

### Workflow:

```bash
# Working on dashboard features
git checkout main
# Full context: dashboard, tooltips, help panel, etc.
# CLAUDE.md loaded, focuses on dashboard work

# Switching to autonomous execution
git checkout feature/autonomous-execution-foundation
# Full context: orchestrator, waves, verification, etc.
# CLAUDE.md still loaded (same project)
# But different code, different tasks

# Key: Same CLAUDE.md, same tools, different focus
```

### Context Files Strategy:

```bash
.taskmaster/
├── tasks/tasks.json (ALL tasks for project)
├── docs/
│   ├── prd.txt (dashboard PRD)
│   └── autonomous-execution-prd.txt (autonomous PRD)
└── state.json (current focus)

# Use TaskMaster tags for separation:
task-master add-tag dashboard-phase-2
task-master add-tag autonomous-phase-1

# Switch focus:
task-master use-tag dashboard-phase-2  # Work on dashboard
task-master use-tag autonomous-phase-1  # Work on autonomous
```

**Benefits**:
- Same project, different tags
- TaskMaster tracks both independently
- No context switching between repos
- Git branch + TaskMaster tag = Clear focus

---

## Decision Framework

### When to Keep Projects Truly Separate

Use separate repositories when:
1. **Different tech stacks**: Dashboard is React, other project is Python
2. **Different teams**: Dashboard for users, autonomous for developers
3. **Different lifecycles**: Dashboard stable, other project experimental
4. **Different deployments**: Dashboard cloud, other project local
5. **No shared code**: Literally nothing in common

### Your Case Analysis

| Criterion | Dashboard | Autonomous | Separate? |
|-----------|-----------|------------|-----------|
| Tech Stack | React + Express + TS | React + Express + TS | ❌ No |
| Team | You | You | ❌ No |
| Lifecycle | Production | Development → Production | ❌ No |
| Deployment | Localhost:5173 | Localhost:5173 | ❌ No |
| Shared Code | TaskMaster MCP, UI components | TaskMaster MCP, UI components | ❌ No |
| Goal | Visualize tasks | Automate task execution | ❌ No |

**Conclusion**: 0/6 reasons to separate. **They should be one project.**

---

## The Elegant Implementation

### Step 1: Acknowledge the Reality

These are not separate projects. The autonomous execution system is **Phase 2-5 of the dashboard project**.

**Current State**: Dashboard Phase 2.1 (tooltips)
**Future State**: Dashboard Phase 3 (autonomous execution view)

### Step 2: Adjust Mental Model

**Old thinking**: "Two projects competing for attention"
**New thinking**: "One project, natural progression"

### Step 3: Use Git for Psychological Separation

```bash
# Finish current work
git checkout -b feature/dashboard-phase-2.1
# 4-6 hours of focused work
git merge to main when done

# Start new work
git checkout -b feature/autonomous-execution
# Weeks of focused work
# Merge incrementally as phases complete
```

**Result**: Same codebase, clear mental boundaries

### Step 4: Execute

**Today**: Finish Phase 2.1 dashboard work (4-6 hours)
**This Week**: Parse autonomous PRD, start Phase 1
**Week 1-2**: Build orchestrator
**Week 3-4**: Build effectiveness analyzer
**Week 5-6**: Integrate with dashboard

---

## Metrics for Success

### Solo Developer Efficiency

**Time to Context Switch**: <5 minutes
- Git checkout + TaskMaster use-tag = Instant context

**Code Reuse**: >80%
- Shared components, services, infrastructure

**Cognitive Load**: Low
- One CLAUDE.md, one README, one deployment

**Deployment Complexity**: Minimal
- One npm run dev, one server, one port

### Project Health

**Autonomy Rate**: ≥90%
- Solo developer with AI assistance

**Time to Production**: 12 weeks
- Phase 1: 2 weeks
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Phase 4: 4 weeks
- Phase 5: 2 weeks

**Code Quality**: ≥90%
- Verification enforced, tests required

---

## Recommended Action (Right Now)

### The Steve Jobs Question
"What creates the most value right now?"

**Answer**: Finish what you started (Phase 2.1), then build on that foundation.

### The Implementation

```bash
# 1. Finish Phase 2.1 (4-6 hours)
git checkout -b feature/dashboard-phase-2.1

# Implement:
# - MetricTooltip component
# - Add tooltips to SystemDashboard
# - HelpPanel component
# - About page
# - Update README

# Test, commit, merge
git checkout main
git merge feature/dashboard-phase-2.1

# 2. Parse Autonomous Execution PRD
git checkout -b feature/autonomous-execution

# Use TaskMaster MCP to generate tasks
# This creates ~30-50 tasks in .taskmaster/tasks/tasks.json

# 3. Tag the tasks for organization
task-master add-tag autonomous-phase-1

# 4. Start working incrementally
task-master use-tag autonomous-phase-1
task-master next
# Begin implementation
```

**Timeline**:
- Today: 0-4 hours (Phase 2.1)
- This Week: 4-10 hours (Phase 2.1 complete, PRD parsed)
- Week 1: Start Phase 1 (orchestrator foundation)

---

## Alternative Approaches Considered

### Approach 1: Monorepo with Workspaces

```bash
TaskMasterMonorepo/
├── packages/
│   ├── dashboard/ (Web UI)
│   ├── orchestrator/ (Autonomous execution)
│   └── shared/ (Common components)
└── pnpm-workspace.yaml
```

**Pros**: Clear package boundaries
**Cons**: Overkill for solo developer, adds complexity

**Verdict**: ❌ Too much overhead

### Approach 2: Separate Repos with Submodules

```bash
# Main repo
TaskMasterDashboard/
└── .git/modules/autonomous-execution/

# Submodule
git submodule add ../TaskMasterAutonomous autonomous-execution/
```

**Pros**: True separation
**Cons**: Git submodule hell, duplicated infrastructure

**Verdict**: ❌ Maintenance nightmare

### Approach 3: Feature Flags

```typescript
// One codebase, toggle features
const features = {
  dashboardTooltips: true,
  autonomousExecution: process.env.ENABLE_AUTONOMOUS === 'true'
}
```

**Pros**: One codebase, progressive rollout
**Cons**: Feature flag complexity, testing matrix grows

**Verdict**: ⚠️ Possible, but git branches simpler

### Approach 4: Progressive Enhancement (Chosen)

```bash
# One codebase
# Git branches for work-in-progress
# Merge when stable
# Features build on each other naturally
```

**Pros**: Simple, natural, no overhead
**Cons**: None

**Verdict**: ✅ **This is the way**

---

## Conclusion: The Inevitable Path

### The Truth
The autonomous execution system is not a separate project. It's the natural evolution of the TaskMaster Web Dashboard.

### The Strategy
- Complete current dashboard work (Phase 2.1)
- Use git branches for psychological separation
- Build autonomous features incrementally
- Integrate in Phase 3 (same dashboard, new route)

### The Outcome
- One codebase, unified vision
- Clear progression: Dashboard → Autonomous → Unified
- Solo developer workflow optimized
- No artificial complexity

### The Next Step
**Finish Phase 2.1 dashboard tooltips** (4-6 hours), then parse the autonomous execution PRD and start building the orchestrator.

---

## Related Research

- Dashboard Evolution Plan: `docs/research/2025-11-13-dashboard-evolution-multi-project-architecture.md`
- Autonomous Execution Architecture: `docs/research/2025-11-13-ULTRATHINK-AUTONOMOUS-EXECUTION-ARCHITECTURE.md`
- Autonomous Execution PRD: `.taskmaster/docs/autonomous-execution-prd.txt`

---

**The elegant solution is not to separate—it's to unify.**

From dashboard to autonomy, it's one continuous journey.

🚀 **Let's build it.**
