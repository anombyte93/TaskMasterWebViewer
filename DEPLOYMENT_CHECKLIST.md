# Replit Deployment Checklist

Quick reference for deploying TaskMaster Web Integration to Replit.

## Pre-Deployment Verification

Run the verification script:

```bash
bash scripts/verify-replit-deployment.sh
```

Expected result: All checks pass (31+ passed, 0 failed)

## Required Files (Verified ✓)

- [x] `.replit` - Main Replit configuration
- [x] `replit.nix` - Node.js 20 environment
- [x] `.replitignore` - Files excluded from deployment
- [x] `package.json` - Build scripts configured
- [x] `.env.example` - Environment variable template
- [x] `docs/deployment/replit-setup.md` - Detailed setup guide

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Configure Replit deployment for Phase 1"
git push origin main
```

### 2. Import to Replit

1. Go to https://replit.com
2. Click "Create Repl" → "Import from GitHub"
3. Enter repository URL
4. Replit auto-detects `.replit` configuration

### 3. Configure Environment Variables

**Required in Replit Secrets:**

```
PROJECT_ROOT=/home/runner/YourReplName
```

**How to set:**
1. Open your Repl
2. Click Lock icon (🔒) → "Secrets"
3. Add `PROJECT_ROOT` with the path to your Repl directory

### 4. Development Testing

Click the **Run** button or:

```bash
npm run dev
```

Verify at: `https://yourrepl.yourusername.repl.co`

### 5. Production Deployment

1. Click **Deploy** button in Replit
2. Select **Autoscale** deployment
3. Replit automatically:
   - Runs `npm run build`
   - Executes `npm run start`
   - Maps port 5000 → 80/443

## Configuration Details

### Build Process

```bash
# Development
npm run dev              # Vite dev server + HMR

# Production
npm run build            # Frontend (Vite) + Backend (esbuild)
npm run start            # Node.js production server
```

### Port Configuration

- **Internal Port**: 5000 (required by Replit)
- **External Port**: 80 (HTTP) / 443 (HTTPS)
- **Environment**: `PORT=5000` (set in `.replit`)

### TaskMaster Integration

Dashboard reads from:
- `.taskmaster/tasks/tasks.json` - Task database (read-only Phase 1)
- `.taskmaster/issues/*.json` - Issue tracking

No write operations in Phase 1 (view-only mode).

## Verification Tests

After deployment, verify:

1. **Health Check**: `curl https://your-repl-url/api/health`
2. **Tasks API**: `curl https://your-repl-url/api/tasks`
3. **Issues API**: `curl https://your-repl-url/api/issues`
4. **Frontend**: Open in browser and check:
   - Tasks table loads
   - Issues tracker works
   - Search/filter functional
   - Responsive on mobile

## Troubleshooting

### Issue: "Project root not found"
- Check `PROJECT_ROOT` in Replit Secrets
- Path should be `/home/runner/YourReplName`

### Issue: "Tasks not loading"
- Verify `.taskmaster/tasks/tasks.json` exists
- Check file permissions
- View logs in Replit Console

### Issue: "Build fails"
- Run `npm install` to reinstall dependencies
- Check `npm run check` for TypeScript errors
- Review build logs in Console

### Issue: "Port conflict"
- Stop all processes (Stop button)
- Restart with Run button
- Port 5000 is required (do not change)

## Next Steps

After successful deployment:

1. **Test Phase 1 Features** (Task 8.2):
   - Task viewer functionality
   - Issue tracker functionality
   - Search and filtering
   - Responsive design on mobile

2. **Share Dashboard**:
   - Copy your Repl URL
   - Share with team/stakeholders
   - Dashboard is live and public

3. **Monitor Logs**:
   - Open Replit Console
   - Watch for errors or warnings
   - Check API request logs

## Phase 1 Features

Deployed features (read-only):
- ✅ Task list viewer with status colors
- ✅ Task detail modal with subtasks
- ✅ Issue tracker with creation/editing
- ✅ Search and filter capabilities
- ✅ Responsive mobile design
- ✅ Real-time data loading

Not included in Phase 1:
- ❌ File editing
- ❌ Git operations
- ❌ MCP server management
- ❌ Terminal emulator

See PRD for Phase 2+ roadmap.

## Support

- **Deployment Guide**: `docs/deployment/replit-setup.md`
- **Verification Script**: `scripts/verify-replit-deployment.sh`
- **Replit Docs**: https://docs.replit.com/
- **TaskMaster Docs**: https://github.com/cyanheads/task-master-ai

---

**Last Updated**: 2025-11-13
**Phase**: 1 (MVP - Read-Only Dashboard)
**Status**: Ready for Deployment ✅
