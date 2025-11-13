# Research: Dashboard Evolution - Multi-Project Architecture & UX Clarity

**Date**: 2025-11-13
**Mode**: Ultrathink (Deep Analysis)
**Query**: Comprehensive plan for dashboard UX improvements, multi-project management, MCP observability, and system scope clarity

---

## Executive Summary

The current dashboard successfully displays TaskMaster data, but user feedback reveals a fundamental mismatch: **we built a single-project view for a multi-project workflow**. The research and analysis identify five critical layers needed to transform this from a data display into a unified development environment controller.

**Key Insight**: This isn't about adding tooltips - it's about establishing **project context**, **system observability**, and **mental model alignment**.

---

## Current State Analysis

### What Works ✅
- Real-time data from TaskMaster and Issues
- Clean, mobile-responsive UI
- WebSocket auto-refresh
- API performance metrics

### What's Missing ❌
1. **No contextual help** - Users don't know what metrics mean or where data comes from
2. **Single-project view** - All 17 tasks shown together, no project breakdown
3. **MCP server opacity** - "MCP Server: running" counter goes up, but which servers? Status?
4. **Issue workflow unclear** - How to create issues? How do AI systems use them?
5. **API scope ambiguity** - What does this API do? What's in scope?

---

## User Feedback (Raw Insights)

> "No information on what cards do, user help needed."

> "Database tasks we don't know where they come from... we want to be able to breakdown the projects somehow so we know what tasks relate to what project"

> "MCP server number im not sure what it means... which mcp server? All? How do i know which server, which are being used, which are working etc?"

> "Im unsure where issues are generated, how they are, what i should do to make issues, how my claude-code and ai cli systems can use issues"

> "Im unsure what fits into the scope of this project. What api? this servers? I need to understand what it does."

---

## Research Findings: Industry Best Practices (2024-2025)

### Dashboard UX Patterns

**Contextual Help & Onboarding (Perplexity Research)**
- **Progressive disclosure**: Show essential steps first, advanced options later
- **Persistent contextual help**: Help pods near complex widgets, searchable help center
- **Tooltips**: Concise (1-2 sentences), action-oriented, keyboard-accessible
- **Data source awareness**: Tooltips show "Source: tasks.json - Last updated 2m ago"
- **Onboarding tours**: Role-aware, lightweight, activates on first use

**Key Principle**: "Make the invisible visible without overwhelming the user"

### Multi-Project Dashboard Design

**Project Switching Patterns (Perplexity Research)**
- **Global vs local views**: Portfolio dashboard + per-project deep dives
- **Context preservation**: Breadcrumbs, persisted preferences per project
- **Workspace isolation**: Separate filters, caches, session data per project
- **Dependency visualization**: Show cross-project impacts when switching contexts

**Key Principle**: "Fast project switching with strong boundaries"

### System Monitoring & Observability

**Service Status Indicators (Perplexity Research)**
- **Four Golden Signals**: Latency, traffic, errors, saturation per service
- **Health probes**: Readiness/liveness checks with clear status colors
- **Dependency dashboards**: Call graphs, upstream/downstream services
- **Distributed tracing**: Span timelines for diagnosing bottlenecks

**Key Principle**: "Actionable metrics with clear thresholds and incident links"

---

## Architectural Solution (5 Layers)

### **Layer 1: Project Context Foundation**

**The Problem**: TaskMaster manages `.taskmaster/` directories, but user has multiple projects. Current dashboard shows all tasks mixed together.

**The Solution**: Multi-project workspace architecture

```typescript
// New data model
interface Project {
  id: string;                    // "TaskMasterWebIntegration"
  name: string;                  // "Dashboard Project"
  path: string;                  // "/home/user/Projects/..."
  taskmasterPath: string;        // ".taskmaster/"
  lastActive: Date;
  taskCount: number;
  issueCount: number;
  status: 'active' | 'archived';
}

// Header component changes
<ProjectSwitcher
  projects={projects}
  current={currentProject}
  onChange={handleProjectSwitch}
  showPortfolioView={true}      // "All Projects" option
/>
```

**Implementation Steps**:
1. **Project Discovery Service**
   - Scan user's directories for `.taskmaster/` folders
   - Build project registry with metadata
   - Store in `.env` or config file: `PROJECTS="proj1:/path1,proj2:/path2"`

2. **Project Context Provider**
   ```typescript
   <ProjectProvider initialProject={env.PROJECT_ROOT}>
     <Dashboard />
   </ProjectProvider>
   ```

3. **URL-based Project Routing**
   - `/` - Portfolio view (all projects)
   - `/project/dashboard-project` - Specific project
   - `/project/dashboard-project/system` - Project system stats

4. **Data Filtering by Project**
   - TaskMasterService accepts `projectPath` parameter
   - IssueService filters by project
   - API endpoints support `?project=xyz` query param

**User Experience**:
```
┌──────────────────────────────────────────┐
│  TaskMaster Control Center               │
│  [All Projects ▼]  [Dashboard] [System] │
│                                          │
│  Currently viewing: All Projects         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Dashboard│ │ FleetLeas│ │ PerplexAP││
│  │ 17 tasks │ │ 42 tasks │ │ 8 tasks  ││
│  │ 9 issues │ │ 3 issues │ │ 0 issues ││
│  └──────────┘ └──────────┘ └──────────┘│
└──────────────────────────────────────────┘
```

---

### **Layer 2: Contextual Help System**

**The Problem**: Users see numbers but don't know what they mean or where data comes from.

**The Solution**: Multi-layered help system

**2.1 Tooltips on Every Metric**
```typescript
<MetricCard
  title="Total Tasks"
  value={17}
  tooltip={{
    text: "Number of tasks in .taskmaster/tasks/tasks.json",
    dataSource: "TaskMasterService → tasks.json",
    lastUpdated: "2 seconds ago",
    learnMore: "/docs/taskmaster-integration"
  }}
/>
```

**2.2 Onboarding Tour (First Visit)**
```typescript
<OnboardingTour steps={[
  {
    target: '#status-cards',
    title: 'System Health',
    content: 'These cards show the health of your API, database, and MCP servers',
    placement: 'bottom'
  },
  {
    target: '#taskmaster-stats',
    title: 'TaskMaster Statistics',
    content: 'Track your progress: 17 total tasks across all projects',
    action: 'Click to see task breakdown',
    placement: 'right'
  },
  {
    target: '#project-switcher',
    title: 'Switch Projects',
    content: 'View tasks and issues per project or see portfolio view',
    placement: 'bottom'
  }
]} />
```

**2.3 Help Panel (Persistent)**
```typescript
<HelpPanel>
  <HelpSection title="What am I looking at?">
    <p>This dashboard monitors your TaskMaster projects and development environment.</p>

    <DataFlowDiagram>
      .taskmaster/tasks/tasks.json → TaskMasterService → API → Dashboard
      .taskmaster/issues/*.json → IssueService → API → Dashboard
    </DataFlowDiagram>
  </HelpSection>

  <HelpSection title="Where does data come from?">
    <DataSourceList>
      <DataSource name="Tasks" path=".taskmaster/tasks/tasks.json" />
      <DataSource name="Issues" path=".taskmaster/issues/*.json" />
      <DataSource name="MCP Servers" path="MCP health endpoint" />
    </DataSourceList>
  </HelpSection>
</HelpPanel>
```

**2.4 "What is this?" Mode**
- Click any card/metric to see detailed explanation
- Shows: data source, update frequency, related actions
- Links to relevant documentation

**Implementation Priority**:
1. Basic tooltips (1 day)
2. Help panel (2 days)
3. Onboarding tour (3 days)
4. "What is this?" mode (2 days)

---

### **Layer 3: MCP Server Observability**

**The Problem**: "MCP Server: running" is a placeholder. User needs to know:
- Which MCP servers are configured?
- Which are currently connected?
- What tools do they provide?
- Are they healthy?

**The Solution**: Real MCP health monitoring

**3.1 MCP Registry Service**
```typescript
// server/src/services/MCPService.ts
interface MCPServer {
  name: string;              // "task-master-ai"
  command: string;           // "npx -y task-master-ai"
  status: 'connected' | 'disconnected' | 'error';
  tools: string[];           // ["get_tasks", "set_task_status", ...]
  lastPing: Date;
  errorMessage?: string;
}

class MCPService {
  async getConfiguredServers(): Promise<MCPServer[]> {
    // Read .mcp.json from project root
    const config = await readMCPConfig();
    return Object.keys(config.mcpServers).map(name => ({
      name,
      command: config.mcpServers[name].command,
      status: 'unknown',
      tools: [],
      lastPing: null
    }));
  }

  async healthCheck(server: MCPServer): Promise<MCPServerStatus> {
    // Attempt to connect and list tools
    // Return status with diagnostic info
  }

  async getAllServersStatus(): Promise<MCPServer[]> {
    const servers = await this.getConfiguredServers();
    return await Promise.all(
      servers.map(s => this.healthCheck(s))
    );
  }
}
```

**3.2 MCP Dashboard UI**
```typescript
<MCPServerDashboard>
  <ServerCard name="task-master-ai" status="connected">
    <ServerMeta>
      <Stat label="Tools" value={47} />
      <Stat label="Last Ping" value="2s ago" />
      <Stat label="Uptime" value="99.9%" />
    </ServerMeta>

    <ToolsList>
      <Tool name="get_tasks" calls={142} />
      <Tool name="set_task_status" calls={23} />
      <Tool name="expand_task" calls={8} />
    </ToolsList>

    <Actions>
      <Button onClick={testConnection}>Test Connection</Button>
      <Button onClick={viewLogs}>View Logs</Button>
    </Actions>
  </ServerCard>

  <ServerCard name="perplexity-api-free" status="error">
    <ErrorMessage>
      401 Unauthorized - API key may be invalid
      <Action onClick={updateConfig}>Update .mcp.json</Action>
    </ErrorMessage>
  </ServerCard>
</MCPServerDashboard>
```

**3.3 API Endpoints**
```typescript
// GET /api/mcp/servers - List all configured MCP servers
// GET /api/mcp/servers/:name/health - Health check specific server
// GET /api/mcp/servers/:name/tools - List tools for server
// POST /api/mcp/servers/:name/test - Test connection
```

**Real-World Data**:
```json
{
  "servers": [
    {
      "name": "task-master-ai",
      "status": "connected",
      "tools": 47,
      "lastPing": "2025-11-13T08:15:32Z",
      "toolsUsed": {
        "get_tasks": 142,
        "set_task_status": 23,
        "expand_task": 8
      }
    },
    {
      "name": "perplexity-api-free",
      "status": "error",
      "errorMessage": "401 Unauthorized"
    },
    {
      "name": "railway",
      "status": "connected",
      "tools": 38,
      "lastPing": "2025-11-13T08:15:30Z"
    }
  ]
}
```

**Why This Matters**:
- User can debug MCP connection issues
- See which servers are actually being used
- Monitor for API quota/rate limits
- Understand tool availability

---

### **Layer 4: Issue Workflow Integration**

**The Problem**: User doesn't know:
- How issues are created
- How Claude Code/AI CLI should use them
- If there's MCP integration

**The Solution**: Clear issue creation flow + MCP integration

**4.1 Issue Creation UI**
```typescript
<CreateIssueDialog>
  <Form onSubmit={handleCreateIssue}>
    <ProjectSelect
      label="Project"
      value={currentProject}
      options={projects}
      tooltip="Issues are stored in project's .taskmaster/issues/"
    />

    <TaskLinkField
      label="Related Task (optional)"
      placeholder="Link to task ID (e.g., 5, 7.2)"
      tooltip="Associate this issue with a specific task"
    />

    <Input
      label="Title"
      placeholder="Brief description of the issue"
      required
    />

    <Textarea
      label="Description"
      placeholder="Detailed information about the problem"
    />

    <Select label="Severity" options={['low', 'medium', 'high', 'critical']} />
    <Select label="Status" options={['open', 'in-progress', 'resolved']} />

    <TemplateSelector>
      <Template name="Bug Report" />
      <Template name="Feature Request" />
      <Template name="Documentation" />
    </TemplateSelector>
  </Form>
</CreateIssueDialog>
```

**4.2 Issue System Documentation**

```markdown
# Issue System Guide

## What are Issues?

Issues are structured problem reports stored in `.taskmaster/issues/` as JSON files. They track bugs, feature requests, and blockers across your projects.

## How to Create Issues

### Via Dashboard
1. Click "Create Issue" button
2. Select project
3. Fill in details
4. Optionally link to a task

### Via Claude Code MCP
```bash
# Using TaskMaster MCP (if issue tools added)
create_issue(title="API timeout", severity="high", project="dashboard")
```

### Via AI CLI
```bash
ai "create issue: API timeout on /api/tasks endpoint"
```

## Issue Structure

```json
{
  "id": "issue-1762963541422-rxxiy",
  "title": "API timeout on /api/tasks",
  "description": "Tasks endpoint takes >30s with 100+ tasks",
  "severity": "high",
  "status": "open",
  "relatedTaskId": "7",
  "createdAt": "2025-11-13T08:00:00Z",
  "updatedAt": "2025-11-13T08:00:00Z"
}
```

## MCP Integration

**Current State**: Issues are file-based, no MCP tools yet

**Roadmap**:
- Add `create_issue` MCP tool to TaskMaster server
- Add `get_issues` MCP tool
- Add `update_issue_status` MCP tool
- Enable Claude Code to create issues during development

## Usage Patterns

### Bug During Development
```
1. Encounter bug in code
2. Claude Code: "Create issue for this bug"
3. Issue created automatically with:
   - Title: From conversation context
   - Description: Code snippet + error
   - Related Task: Current task ID
   - Severity: Inferred from context
```

### Issue Tracking
- View all issues in Dashboard
- Filter by project, status, severity
- Click issue to see details
- Link to related tasks
- Update status as resolved
```

**4.3 MCP Issue Tools (Future Enhancement)**

Add to TaskMaster MCP server:
```typescript
{
  name: "create_issue",
  description: "Create a new issue for tracking bugs or feature requests",
  inputSchema: {
    type: "object",
    properties: {
      projectRoot: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      severity: { enum: ["low", "medium", "high", "critical"] },
      relatedTaskId: { type: "string" }
    }
  }
}
```

---

### **Layer 5: Scope & Purpose Clarity**

**The Problem**: "Im unsure what fits into the scope of this project. What api? this servers?"

**The Solution**: Landing page + documentation explaining the system

**5.1 System Overview Landing Page**

```typescript
// New route: /about or /overview
<SystemOverviewPage>
  <Hero>
    <h1>TaskMaster Control Center</h1>
    <p>Your unified development environment dashboard</p>
  </Hero>

  <WhatItDoes>
    <Section>
      <h2>What is this?</h2>
      <p>
        A web dashboard that provides visibility into your TaskMaster projects,
        issues, and development environment. Monitor task progress, track issues,
        and see system health - all in one place.
      </p>
    </Section>

    <Section>
      <h2>What does the API do?</h2>
      <p>
        This Express server provides REST endpoints that read your TaskMaster
        files and expose them for the web UI. It doesn't modify your tasks -
        that's done through TaskMaster CLI or MCP tools.
      </p>

      <APIEndpointList>
        <Endpoint method="GET" path="/api/tasks" description="List all tasks from tasks.json" />
        <Endpoint method="GET" path="/api/issues" description="List all issues from .taskmaster/issues/" />
        <Endpoint method="GET" path="/api/system/health" description="Check server and database health" />
        <Endpoint method="GET" path="/api/system/stats" description="Get TaskMaster statistics" />
      </APIEndpointList>
    </Section>

    <Section>
      <h2>Architecture Diagram</h2>
      <SystemDiagram>
        ┌─────────────────────────────────────┐
        │  TaskMaster Files (.taskmaster/)    │
        │  - tasks.json                       │
        │  - issues/*.json                    │
        └────────────┬────────────────────────┘
                     │
                     ↓
        ┌─────────────────────────────────────┐
        │  Express API Server                 │
        │  - TaskMasterService                │
        │  - IssueService                     │
        │  - REST endpoints                   │
        └────────────┬────────────────────────┘
                     │
                     ↓
        ┌─────────────────────────────────────┐
        │  React Dashboard (Vite)             │
        │  - Task views                       │
        │  - Issue tracker                    │
        │  - System monitoring                │
        └─────────────────────────────────────┘
      </SystemDiagram>
    </Section>
  </WhatItDoes>

  <Scope>
    <h2>What's in Scope?</h2>
    <InScopeList>
      <Item>✅ Read-only task/issue viewing</Item>
      <Item>✅ System health monitoring</Item>
      <Item>✅ Multi-project dashboard</Item>
      <Item>✅ Real-time updates via WebSocket</Item>
      <Item>✅ Issue creation via UI</Item>
    </InScopeList>

    <h2>What's Out of Scope (for now)?</h2>
    <OutOfScopeList>
      <Item>❌ Task editing (use TaskMaster CLI/MCP)</Item>
      <Item>❌ Git operations (future Phase 3)</Item>
      <Item>❌ Terminal access (future Phase 3)</Item>
      <Item>❌ MCP server management (future Phase 3)</Item>
    </OutOfScopeList>
  </Scope>

  <Roadmap>
    <h2>Future Vision</h2>
    <Phase number={1} status="complete">
      Basic dashboard with task/issue viewing
    </Phase>
    <Phase number={2} status="in-progress">
      Multi-project support, MCP observability, help system
    </Phase>
    <Phase number={3} status="planned">
      Terminal integration, Git dashboard, MCP manager
    </Phase>
  </Roadmap>

  <QuickStart>
    <h2>Quick Start</h2>
    <Steps>
      <Step>1. Ensure TaskMaster is initialized: <code>task-master init</code></Step>
      <Step>2. Start the server: <code>npm run dev</code></Step>
      <Step>3. Open dashboard: <code>http://localhost:5173</code></Step>
      <Step>4. Switch projects from header dropdown</Step>
    </Steps>
  </QuickStart>
</SystemOverviewPage>
```

**5.2 Inline Documentation**

Add "Learn More" links throughout the dashboard:
```typescript
<Card title="API Performance">
  <LearnMoreLink href="/docs/api-performance">
    What do these metrics mean?
  </LearnMoreLink>
</Card>
```

**5.3 README Update**

```markdown
# TaskMaster Control Center

A unified web dashboard for monitoring TaskMaster projects, tracking issues, and observing development environment health.

## Purpose

This project provides a **read-only web interface** to your TaskMaster data. It doesn't replace TaskMaster CLI or MCP tools - it complements them by giving you visibility into your projects from a browser.

## What It Does

- **Multi-project dashboard**: View tasks and issues across all your projects
- **Real-time monitoring**: Auto-refresh every 5 seconds
- **System health**: Monitor API, database, and MCP server status
- **Issue tracking**: Create and track issues via web UI
- **Performance metrics**: See API latency, request counts, errors

## What It Doesn't Do

- Edit tasks (use TaskMaster CLI or MCP)
- Git operations (planned for Phase 3)
- Terminal access (planned for Phase 3)
- Modify .taskmaster files directly

## Architecture

```
.taskmaster/          → TaskMaster files (source of truth)
server/               → Express API (reads .taskmaster/)
client/               → React dashboard (displays data)
```

## Quick Start

1. Initialize TaskMaster in your project:
   ```bash
   task-master init
   ```

2. Set PROJECT_ROOT in .env:
   ```
   PROJECT_ROOT=/path/to/your/project
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## Multi-Project Setup

To monitor multiple projects, add them to .env:
```
PROJECTS=dashboard:/home/user/dashboard,fleet:/home/user/fleet
```

The dashboard will discover all projects and let you switch between them.

## Documentation

- [System Overview](docs/SYSTEM_OVERVIEW.md)
- [API Reference](docs/API_REFERENCE.md)
- [Multi-Project Setup](docs/MULTI_PROJECT.md)
- [MCP Integration](docs/MCP_INTEGRATION.md)
```

---

## Implementation Plan (Prioritized Phases)

### **Phase 2.1: Contextual Help & Clarity (Week 1)**
*Goal: Users understand what they're looking at*

**Tasks**:
1. Add tooltips to all metrics and cards (1 day)
   - Data source indicator
   - Last update timestamp
   - "Learn more" links

2. Create Help Panel component (2 days)
   - System overview
   - Data flow diagram
   - FAQ section

3. Add "About" landing page (1 day)
   - System purpose
   - API scope
   - Architecture diagram

4. Update README with scope clarity (0.5 day)

**Deliverables**:
- ✅ Every metric has a tooltip
- ✅ Help panel accessible from header
- ✅ Landing page at `/about`
- ✅ Clear scope documentation

---

### **Phase 2.2: Multi-Project Architecture (Week 2-3)**
*Goal: Users can manage multiple projects*

**Tasks**:
1. Project Discovery Service (2 days)
   - Scan for `.taskmaster/` directories
   - Build project registry
   - Store in config file

2. Project Context Provider (2 days)
   - React context for current project
   - URL-based routing: `/project/:id`
   - Local storage for last active project

3. Project Switcher UI (2 days)
   - Header dropdown
   - "All Projects" portfolio view
   - Project cards with stats

4. API Project Filtering (2 days)
   - Add `?project=xyz` query param support
   - Update TaskMasterService for multi-project
   - Update IssueService for project filtering

5. Database Schema Updates (1 day)
   - Add `projectId` to cached data
   - Migration for existing data

**Deliverables**:
- ✅ Portfolio view showing all projects
- ✅ Per-project task/issue views
- ✅ Fast project switching
- ✅ Project context persisted

---

### **Phase 2.3: MCP Server Observability (Week 4)**
*Goal: Users can monitor MCP server health*

**Tasks**:
1. MCP Service Implementation (3 days)
   - Read `.mcp.json` configuration
   - Health check endpoints
   - Tool listing per server

2. MCP Dashboard UI (3 days)
   - Server status cards
   - Tool usage statistics
   - Connection diagnostics

3. API Endpoints (1 day)
   - `/api/mcp/servers`
   - `/api/mcp/servers/:name/health`
   - `/api/mcp/servers/:name/tools`

**Deliverables**:
- ✅ Real MCP server health checks
- ✅ Per-server status visibility
- ✅ Tool usage tracking
- ✅ Connection diagnostics

---

### **Phase 2.4: Issue Workflow Enhancement (Week 5)**
*Goal: Clear issue creation and management*

**Tasks**:
1. Create Issue Dialog (2 days)
   - Form with validation
   - Project selection
   - Task linking
   - Templates

2. Issue System Documentation (1 day)
   - Guide on creating issues
   - MCP integration roadmap
   - Usage patterns

3. Issue MCP Tools (Future) (2 days)
   - Add `create_issue` to TaskMaster MCP
   - Add `get_issues` tool
   - Add `update_issue_status` tool

**Deliverables**:
- ✅ "Create Issue" button in dashboard
- ✅ Issue templates
- ✅ Documentation on issue system
- ✅ MCP integration plan

---

### **Phase 2.5: Onboarding & Polish (Week 6)**
*Goal: Delightful first-time user experience*

**Tasks**:
1. Onboarding Tour (3 days)
   - Interactive walkthrough
   - Highlights key features
   - Dismissible and resumable

2. "What is this?" Mode (2 days)
   - Click any metric for details
   - Shows data source and lineage
   - Links to documentation

3. Visual Polish (2 days)
   - Consistent iconography
   - Improved data visualizations
   - Loading states and empty states

**Deliverables**:
- ✅ First-visit onboarding tour
- ✅ Interactive help mode
- ✅ Polished visual design

---

## Success Metrics

**User Understanding**:
- ✅ User can explain what each metric means
- ✅ User knows where data comes from
- ✅ User understands system scope

**Multi-Project Functionality**:
- ✅ User can switch between 3+ projects
- ✅ Tasks/issues filtered by project
- ✅ Project context persisted across sessions

**MCP Observability**:
- ✅ User can see which MCP servers are running
- ✅ User can diagnose connection issues
- ✅ User knows which tools are available

**Issue Management**:
- ✅ User can create issues via dashboard
- ✅ User understands issue workflow
- ✅ Issues linked to tasks and projects

---

## Trade-offs & Alternatives Considered

### **Multi-Project Approach**

**Chosen**: Project registry + URL routing
- ✅ Fast switching
- ✅ Supports any number of projects
- ✅ Clear project isolation
- ❌ Requires initial setup

**Alternative 1**: Monorepo detection
- ✅ Auto-discovers projects in monorepo
- ❌ Doesn't work for separate repos
- ❌ Assumes specific directory structure

**Alternative 2**: Manual project adding
- ✅ Most flexible
- ❌ Too much friction for initial setup
- ❌ Users forget to add projects

### **MCP Health Checks**

**Chosen**: Periodic health pings
- ✅ Real-time status
- ✅ Catches disconnections
- ❌ Adds latency to dashboard

**Alternative 1**: Static config reading
- ✅ Zero overhead
- ❌ Shows configured servers, not actual status
- ❌ Can't detect disconnections

**Alternative 2**: On-demand checks
- ✅ No background polling
- ❌ Stale data between checks
- ❌ Slow initial load

---

## Code Examples

### Project Context Implementation

```typescript
// contexts/ProjectContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  path: string;
  taskCount: number;
  issueCount: number;
}

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  isPortfolioView: boolean;
  setPortfolioView: (enabled: boolean) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [isPortfolioView, setPortfolioView] = useState(false);

  // Load projects from API
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects);

        // Restore last active project from localStorage
        const lastProjectId = localStorage.getItem('lastProjectId');
        const lastProject = data.projects.find((p: Project) => p.id === lastProjectId);

        if (lastProject) {
          setCurrentProjectState(lastProject);
        } else if (data.projects.length > 0) {
          setCurrentProjectState(data.projects[0]);
        }
      });
  }, []);

  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project);
    localStorage.setItem('lastProjectId', project.id);
    setPortfolioView(false);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        isPortfolioView,
        setPortfolioView,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
```

### Project Switcher Component

```typescript
// components/ProjectSwitcher.tsx
import { useProject } from '@/contexts/ProjectContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProjectSwitcher() {
  const { projects, currentProject, setCurrentProject, setPortfolioView } = useProject();

  return (
    <Select
      value={currentProject?.id || 'portfolio'}
      onValueChange={(value) => {
        if (value === 'portfolio') {
          setPortfolioView(true);
        } else {
          const project = projects.find(p => p.id === value);
          if (project) {
            setCurrentProject(project);
          }
        }
      }}
    >
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="portfolio">
          📊 All Projects (Portfolio)
        </SelectItem>
        {projects.map(project => (
          <SelectItem key={project.id} value={project.id}>
            📁 {project.name}
            <span className="text-muted-foreground text-xs ml-2">
              ({project.taskCount} tasks)
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Tooltip Component with Data Source

```typescript
// components/MetricTooltip.tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
  description: string;
  dataSource: string;
  lastUpdated?: string;
  learnMoreUrl?: string;
}

export function MetricTooltip({
  description,
  dataSource,
  lastUpdated,
  learnMoreUrl,
}: MetricTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-2 text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm">{description}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                <strong>Source:</strong> {dataSource}
              </div>
              {lastUpdated && (
                <div>
                  <strong>Updated:</strong> {lastUpdated}
                </div>
              )}
            </div>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                className="text-xs text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### MCP Health Check Service

```typescript
// server/src/services/MCPService.ts
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface MCPServer {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  command: string;
  tools?: string[];
  lastPing?: Date;
  errorMessage?: string;
}

class MCPService {
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd();
  }

  /**
   * Read .mcp.json configuration
   */
  async getConfiguredServers(): Promise<Record<string, MCPServerConfig>> {
    const mcpConfigPath = path.join(this.projectRoot, '.mcp.json');

    try {
      const content = await fs.readFile(mcpConfigPath, 'utf-8');
      const config = JSON.parse(content);
      return config.mcpServers || {};
    } catch (error) {
      console.error('[MCPService] Failed to read .mcp.json:', error);
      return {};
    }
  }

  /**
   * Check if an MCP server is reachable
   */
  async healthCheck(name: string, config: MCPServerConfig): Promise<MCPServer> {
    try {
      // Attempt to run a simple test command
      // This is a placeholder - actual implementation would use MCP protocol
      const testCommand = `${config.command} ${config.args.join(' ')} --version`;

      const { stdout, stderr } = await execAsync(testCommand, {
        timeout: 5000,
        env: { ...process.env, ...config.env }
      });

      return {
        name,
        status: 'connected',
        command: `${config.command} ${config.args.join(' ')}`,
        lastPing: new Date(),
        tools: [], // Would be populated by MCP protocol query
      };
    } catch (error) {
      return {
        name,
        status: 'error',
        command: `${config.command} ${config.args.join(' ')}`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get status of all configured MCP servers
   */
  async getAllServersStatus(): Promise<MCPServer[]> {
    const servers = await this.getConfiguredServers();

    const statusPromises = Object.entries(servers).map(([name, config]) =>
      this.healthCheck(name, config)
    );

    return await Promise.all(statusPromises);
  }
}

export const mcpService = new MCPService(process.env.PROJECT_ROOT);
export { MCPService };
```

---

## Research Sources

### Perplexity Research Citations

1. **Dashboard UX Best Practices 2024-2025**
   - Contextual help patterns for technical dashboards
   - Progressive disclosure and onboarding tours
   - Tooltip design for multi-source data
   - Data lineage visualization
   - Accessibility and keyboard navigation

2. **Multi-Project Management Dashboard Design**
   - Project switching patterns
   - Workspace isolation strategies
   - Context-preserving navigation
   - Portfolio vs local dashboard views
   - Dependency visualization

3. **System Monitoring Dashboard Design**
   - Four Golden Signals (latency, traffic, errors, saturation)
   - Service health indicators
   - Distributed observability patterns
   - Status pages and health widgets
   - Alerting and incident integration

---

## Related Research

- [System Dashboard Implementation Complete](2025-11-13-system-dashboard-implementation-complete.md)
- [Optimistic UI Implementation](2025-11-13-optimistic-ui-implementation.md)
- [Filter Implementation](2025-11-13-filter-implementation.md)

---

## Next Steps

### Immediate Actions (This Week)
- [ ] Create TodoWrite plan for Phase 2.1 (Contextual Help)
- [ ] Add basic tooltips to all metrics
- [ ] Create Help Panel component
- [ ] Write "About" landing page
- [ ] Update README with scope clarity

### Short-term (Next 2 Weeks)
- [ ] Design project discovery mechanism
- [ ] Implement Project Context Provider
- [ ] Build Project Switcher UI
- [ ] Add API project filtering

### Medium-term (Month 2)
- [ ] Implement MCP health checking
- [ ] Create MCP Server Dashboard
- [ ] Enhance issue creation workflow
- [ ] Build onboarding tour

### Long-term (Phase 3+)
- [ ] Terminal integration
- [ ] Git dashboard
- [ ] MCP server management
- [ ] Workflow automation

---

## Conclusion

The feedback reveals that we've built a **data display** when users need a **control center**. The solution isn't just adding tooltips - it's establishing:

1. **Project Context** - Multi-project architecture with clear boundaries
2. **System Observability** - Real MCP server monitoring
3. **Mental Model Alignment** - Clear scope, purpose, and data flow documentation
4. **Workflow Integration** - Issues tied to projects and tasks
5. **Contextual Help** - Progressive disclosure without overwhelming

**The North Star**: A dashboard so clear, so contextual, so well-explained that a new user immediately understands:
- What they're looking at
- Where the data comes from
- How to use it effectively
- What's possible and what's not

This aligns with the Steve Jobs principle: **"Make it simple, but not simpler."** We're adding layers of context and capability while maintaining the elegant, focused design.

---

**Research Complete** ✅

**Mode**: Ultrathink (Deep Architectural Analysis)
**Saved**: `docs/research/2025-11-13-dashboard-evolution-multi-project-architecture.md`
