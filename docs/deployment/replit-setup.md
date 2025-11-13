# Replit Deployment Guide - TaskMaster Web Integration

## Overview

This guide covers deploying the TaskMaster Web Integration dashboard to Replit using autoscale deployment.

## Prerequisites

1. A Replit account
2. A project with TaskMaster initialized (`.taskmaster/` directory)
3. Git repository connected to Replit

## Quick Start

### 1. Import Project to Replit

1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Paste your repository URL
5. Replit will auto-detect configuration from `.replit`

### 2. Configure Environment Variables

The dashboard requires minimal configuration. Set these in Replit Secrets:

#### Required Variables

**`PROJECT_ROOT`** (Required)
- **Value**: `/home/runner/YourReplName` (absolute path to your Repl)
- **Purpose**: Points to the directory containing `.taskmaster/`
- **Example**: `/home/runner/TaskMasterWebIntegration`

#### Optional Variables (Recommended Defaults)

These are pre-configured in `.replit` but can be overridden in Secrets:

- **`PORT`**: `5000` (default, required by Replit)
- **`NODE_ENV`**: `production` (set automatically on deployment)
- **`TASKMASTER_PATH`**: `.taskmaster` (relative to PROJECT_ROOT)
- **`ISSUES_PATH`**: `.taskmaster/issues` (relative to PROJECT_ROOT)

#### Phase 1 Feature Flags (All Disabled)

These are **not** needed for Phase 1 but documented for future phases:

```bash
# Phase 2+ (not needed yet)
ENABLE_EDITING=false
ENABLE_GIT_ACTIONS=false
ENABLE_MCP_MANAGEMENT=false

# WebSocket config (Phase 2+)
WS_HEARTBEAT_INTERVAL=30000
WS_TIMEOUT=60000

# Terminal config (Phase 2+)
TERMINAL_ROWS=30
TERMINAL_COLS=120
TERMINAL_SCROLLBACK=10000
```

### 3. Set Up Replit Secrets

1. Open your Repl
2. Click the **Lock icon** (🔒) in the left sidebar → "Secrets"
3. Add the required variable:

   ```
   Key: PROJECT_ROOT
   Value: /home/runner/YourReplName
   ```

4. Click "Add new secret"

### 4. Run Development Server

Click the **Run** button or execute:

```bash
npm run dev
```

The app will be available at your Repl's URL (e.g., `https://yourrepl.yourusername.repl.co`)

### 5. Deploy to Production

1. Click the **Deploy** button in Replit
2. Select **Autoscale** deployment
3. Replit will:
   - Run `npm run build` (build frontend and backend)
   - Execute `npm run start` (production server)
   - Serve on port 5000 (mapped to external port 80/443)

## Project Structure on Replit

```
/home/runner/YourReplName/
├── .replit                  # Replit configuration (auto-detected)
├── replit.nix              # Nix environment (Node.js 20)
├── .replitignore           # Files excluded from deployment
├── .taskmaster/            # TaskMaster data
│   ├── tasks/
│   │   └── tasks.json      # Task database (read by dashboard)
│   ├── issues/             # Issue tracking JSON files
│   └── config.json         # TaskMaster configuration
├── client/                 # React frontend
├── server/                 # Express backend
└── dist/                   # Built files (created on deployment)
```

## Port Configuration

- **Development**: `localhost:5000`
- **Production**: External port 80 (HTTPS: 443) → Internal port 5000
- **Important**: Do NOT change `PORT=5000` in Replit. It's required by the platform.

## TaskMaster Integration

### How It Works

1. Dashboard reads from `.taskmaster/tasks/tasks.json` (read-only in Phase 1)
2. Issues are read from `.taskmaster/issues/*.json`
3. No write operations in Phase 1 (view-only mode)
4. TaskMaster CLI updates are detected automatically (via file polling)

### Syncing TaskMaster Data

**Option A: Manual Sync (Recommended for Phase 1)**

1. Update tasks locally using `task-master` CLI
2. Commit changes to `.taskmaster/tasks/tasks.json`
3. Push to GitHub
4. Replit will auto-sync via Git

**Option B: Direct Editing in Replit**

1. Open Shell in Replit
2. Run TaskMaster commands directly:
   ```bash
   npm install -g task-master-ai
   task-master list
   task-master next
   ```

## Build Process

### Development Build

```bash
npm run dev
```

- Uses Vite dev server for HMR (Hot Module Replacement)
- Watches for file changes
- Serves on port 5000

### Production Build

```bash
npm run build
```

**Frontend Build** (`vite build`):
- Bundles React app with optimized chunks
- Outputs to `dist/public/`
- Includes code splitting for vendor libraries

**Backend Build** (`esbuild server/index.ts`):
- Bundles Express server
- Outputs to `dist/index.js`
- Includes all dependencies

### Production Start

```bash
npm run start
```

- Runs `dist/index.js`
- Serves static files from `dist/public/`
- Listens on port 5000

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│  Replit Autoscale Deployment            │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  Express Server (dist/index.js) │   │
│  │  Port 5000 (internal)           │   │
│  │                                  │   │
│  │  ├─ API Routes (/api/*)         │   │
│  │  │  ├─ /api/tasks               │   │
│  │  │  ├─ /api/issues              │   │
│  │  │  └─ /api/health              │   │
│  │  │                               │   │
│  │  └─ Static Files (dist/public/) │   │
│  │     └─ React SPA                │   │
│  └─────────────────────────────────┘   │
│             ▲                            │
│             │                            │
│  ┌──────────┴────────────┐              │
│  │  .taskmaster/         │              │
│  │  ├─ tasks/tasks.json  │              │
│  │  └─ issues/*.json     │              │
│  └───────────────────────┘              │
└─────────────────────────────────────────┘
         ▲
         │ HTTPS (Port 443)
         │
    External Users
```

## Monitoring and Logs

### View Logs in Replit

1. Open your Repl
2. Navigate to **Console** tab
3. Logs show:
   - Server startup (`serving on port 5000`)
   - API requests (`GET /api/tasks 200 in 45ms`)
   - Errors and warnings

### Health Check

Test the API health endpoint:

```bash
curl https://yourrepl.yourusername.repl.co/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "version": "1.0.0"
}
```

## Troubleshooting

### Issue: "Project root not found"

**Cause**: `PROJECT_ROOT` environment variable not set or incorrect

**Solution**:
1. Check Replit Secrets for `PROJECT_ROOT`
2. Verify path matches your Repl's directory structure
3. Should be: `/home/runner/YourReplName`

### Issue: "Tasks not loading"

**Cause**: `.taskmaster/tasks/tasks.json` missing or empty

**Solution**:
1. Ensure TaskMaster is initialized: `task-master init`
2. Generate tasks: `task-master parse-prd .taskmaster/docs/prd.txt`
3. Verify file exists: `ls -la .taskmaster/tasks/`

### Issue: "Build fails"

**Cause**: Missing dependencies or TypeScript errors

**Solution**:
```bash
# Install dependencies
npm install

# Check TypeScript compilation
npm run check

# Build manually to see errors
npm run build
```

### Issue: "Port already in use"

**Cause**: Multiple processes trying to bind to port 5000

**Solution**:
1. Stop all running processes in Replit
2. Click the **Stop** button
3. Click **Run** again

## Performance Considerations

### Bundle Size Optimization

The Vite build is configured with code splitting:

- **vendor-react**: React core (~130 KB)
- **vendor-routing**: Wouter + React Query (~40 KB)
- **vendor-radix**: Radix UI components (~80 KB)
- **vendor-forms**: React Hook Form + Zod (~30 KB)

Total initial load: ~350-400 KB (gzipped)

### Caching Strategy

- Static assets: 1 year cache (`Cache-Control: max-age=31536000`)
- HTML: No cache (always fresh)
- API responses: No cache (dynamic data)

### Autoscale Behavior

Replit autoscale:
- **Idle**: Spins down after 30 minutes of inactivity
- **Wake up**: First request takes ~3-5 seconds
- **Scaling**: Automatically scales based on traffic

## Security Notes

### Phase 1 (Current)

- **Read-only mode**: No write operations to TaskMaster files
- **No authentication**: Public access (suitable for personal use)
- **HTTPS**: Automatic via Replit

### Future Phases

- **Phase 2**: WebSocket security (authentication tokens)
- **Phase 3**: Git operations (SSH key management)
- **Phase 3**: File editing (RBAC and authorization)

## Next Steps

After successful deployment:

1. **Verify deployment**: Open your Repl URL
2. **Test Task 8.2**: Verify all Phase 1 features work
3. **Monitor logs**: Check for any runtime errors
4. **Share URL**: Dashboard is now live and shareable

## Additional Resources

- [Replit Documentation](https://docs.replit.com/)
- [TaskMaster AI Docs](https://github.com/cyanheads/task-master-ai)
- [Project PRD](./../2025-11-12-claude-code-development-dashboard-prd.md)

## Support

For deployment issues:
1. Check Replit Console logs
2. Verify environment variables in Secrets
3. Test API endpoints with curl
4. Review this guide's troubleshooting section
