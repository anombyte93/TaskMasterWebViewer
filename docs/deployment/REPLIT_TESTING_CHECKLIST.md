# Replit Deployment Testing Checklist (Task 8.2)

**Task:** Test deployment on Replit and verify all Phase 1 features work in production

**Status:** Requires user action to deploy to Replit

---

## Pre-Deployment Preparation ✅ COMPLETE

All configuration files are ready:
- ✅ `.replit` configured with correct entrypoint and commands
- ✅ `replit.nix` with Node.js 20 environment
- ✅ `.replitignore` to exclude unnecessary files
- ✅ Documentation in `docs/deployment/replit-setup.md`
- ✅ Automated verification script available

---

## Deployment Steps (User Action Required)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "feat: complete Phase 1 MVP with Replit deployment config

- All Task 7 subtasks complete (integration, testing, documentation)
- Task 8.1: Replit configuration ready
- Task 8.3: Comprehensive deployment documentation
- Production-ready for Replit deployment

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

### Step 2: Import to Replit
1. Go to https://replit.com/
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter repository URL
5. Wait for import to complete

### Step 3: Configure Environment Variables
1. Open Replit project settings (🔧 icon)
2. Navigate to "Secrets" tab (environment variables)
3. Add required variable:
   - Key: `PROJECT_ROOT`
   - Value: `/home/runner/TaskMasterWebIntegration` (replace with your Repl name)
4. Click "Add secret"

### Step 4: Development Testing
1. Click "Run" button in Replit
2. Wait for build to complete (~30 seconds)
3. Check console output for:
   - "TaskMasterService initialized"
   - "IssueService initialized"
   - "Express serving on port 5000"
4. Open the preview window (should show dashboard)

### Step 5: Production Deployment
1. Click "Deploy" button in Replit
2. Select deployment type:
   - **Recommended:** Autoscale (free tier, idle shutdown)
   - **Alternative:** Reserved VM (paid, always on)
3. Wait for deployment to complete (~2 minutes)
4. Replit will provide a production URL (e.g., `https://yourrepl.youruser.repl.co`)

---

## Testing Checklist

### 🔍 Phase 1 Feature Verification

Run through each feature to ensure production readiness:

#### 1. Task Viewer (Critical)
- [ ] Dashboard loads without errors
- [ ] Task cards display with all information (ID, title, description, status, priority)
- [ ] Status badges show correct colors (pending, in-progress, done, etc.)
- [ ] Priority badges display (high, medium, low)
- [ ] Subtasks can be expanded/collapsed
- [ ] Progress bars show correct percentages
- [ ] Task detail modal opens when clicking "View Details"
- [ ] Task detail modal shows complete information
- [ ] Recursive subtask tree renders correctly
- [ ] No console errors in browser DevTools

#### 2. Issue Tracker (Critical)
- [ ] Issue panel displays in sidebar
- [ ] Issues load successfully
- [ ] Issue creation modal opens
- [ ] Issue creation form works (all fields)
- [ ] Form validation works (required fields)
- [ ] Issue creation succeeds with success toast
- [ ] Issue detail modal displays correctly
- [ ] Issue editing works
- [ ] Issue status can be updated
- [ ] Severity badges display correctly
- [ ] No console errors

#### 3. Search & Filter (Critical)
- [ ] Search bar accepts input
- [ ] Search debounces correctly (300ms delay)
- [ ] Search results update in real-time
- [ ] Clear search button works
- [ ] Filter dropdown opens (Status, Priority, Severity)
- [ ] Multi-select checkboxes work
- [ ] Filter badges display with counts
- [ ] Filter badge removal works
- [ ] "Clear all" button works
- [ ] Combined search + filter works correctly

#### 4. Responsive Design (Important)
- [ ] Desktop layout (≥1024px): Two-column layout works
- [ ] Tablet layout (768-1023px): Sidebar becomes overlay
- [ ] Mobile layout (<768px): Single-column stack
- [ ] Touch targets are ≥44px on mobile
- [ ] Pull-to-refresh works on mobile
- [ ] All interactive elements accessible on touch devices

#### 5. Real-Time Updates (Important)
- [ ] Auto-refresh works (5-second polling)
- [ ] Data updates without page refresh
- [ ] Loading states show during refresh
- [ ] No UI flickering during updates

#### 6. Performance (Important)
- [ ] Initial page load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] Smooth scrolling and interactions
- [ ] No lag with 100+ tasks
- [ ] No memory leaks (check after 5 minutes of usage)

#### 7. Error Handling (Important)
- [ ] Error boundary catches errors gracefully
- [ ] Error messages are user-friendly
- [ ] Retry buttons work when errors occur
- [ ] Network failures are handled (offline state)

#### 8. Accessibility (Nice-to-Have)
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] ARIA labels present for screen readers
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG standards

---

## API Endpoint Testing

Test all API endpoints manually:

```bash
# Replace with your production URL
REPLIT_URL="https://yourrepl.youruser.repl.co"

# Test health endpoint
curl $REPLIT_URL/api/health

# Test tasks endpoint
curl $REPLIT_URL/api/tasks

# Test current task
curl $REPLIT_URL/api/tasks/current

# Test specific task
curl $REPLIT_URL/api/tasks/1

# Test issues endpoint
curl $REPLIT_URL/api/issues

# Create test issue
curl -X POST $REPLIT_URL/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue from Production",
    "description": "Verifying API works in production",
    "severity": "low",
    "category": "testing",
    "status": "open"
  }'
```

**Expected Results:**
- Health: `{"status":"ok","timestamp":"..."}`
- Tasks: Array of tasks from `.taskmaster/tasks/tasks.json`
- Current task: Single task object
- Issue creation: `201 Created` with new issue object

---

## Browser Testing

Test in multiple browsers to ensure compatibility:

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)
- [ ] Edge (latest, Windows)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile (Android)

---

## Performance Monitoring

### Initial Load Metrics
Record these metrics from Chrome DevTools > Performance tab:

- **First Contentful Paint (FCP):** Target < 2.0s, Actual: _____
- **Largest Contentful Paint (LCP):** Target < 2.5s, Actual: _____
- **Time to Interactive (TTI):** Target < 5.0s, Actual: _____
- **Total Blocking Time (TBT):** Target < 300ms, Actual: _____
- **Cumulative Layout Shift (CLS):** Target < 0.1, Actual: _____

### Bundle Size
Check Network tab for bundle sizes:

- **Total transferred:** Expected ~350-400 KB, Actual: _____
- **JavaScript:** Expected ~250-300 KB, Actual: _____
- **CSS:** Expected ~40-50 KB, Actual: _____
- **Initial load time:** Target < 3s, Actual: _____

---

## Common Issues & Solutions

### Issue: Dashboard shows white screen
**Cause:** Build artifacts not generated or served incorrectly
**Solution:**
1. Check Replit console for build errors
2. Verify `dist/public/` folder exists with files
3. Run `npm run build` manually if needed
4. Restart the Repl

### Issue: Tasks/Issues show as empty
**Cause:** `.taskmaster/` data not found or incorrect PROJECT_ROOT
**Solution:**
1. Verify PROJECT_ROOT environment variable is set correctly
2. Check `.taskmaster/tasks/tasks.json` exists in Repl file tree
3. Verify file permissions allow reading
4. Check server logs for file system errors

### Issue: API endpoints return 404
**Cause:** Server not routing correctly or build issue
**Solution:**
1. Check server logs for errors
2. Verify Express routes are registered
3. Test `/api/health` endpoint first
4. Restart the Repl

### Issue: WebSocket connection fails
**Cause:** Replit firewall or WebSocket not supported
**Solution:**
1. Verify WebSocket server is initialized (check logs)
2. Check browser console for WebSocket errors
3. Ensure Replit deployment allows WebSocket connections
4. Fall back to polling if WebSocket unavailable

### Issue: Autoscale deployment goes to sleep
**Behavior:** This is expected on free tier
**Solution:**
1. Accept 3-5 second wake-up time on first request
2. Upgrade to "Always On" boost ($7/month) if needed
3. Or upgrade to Reserved VM deployment

---

## Production Readiness Sign-Off

Before marking Task 8.2 as complete, verify:

### Critical Requirements (Must Pass)
- [ ] All Phase 1 features functional
- [ ] No critical bugs or errors
- [ ] API endpoints working
- [ ] Dashboard loads successfully
- [ ] Data displays correctly
- [ ] User interactions work smoothly

### Important Requirements (Should Pass)
- [ ] Performance metrics within targets
- [ ] Responsive design working on all devices
- [ ] Error handling functional
- [ ] Real-time updates working

### Nice-to-Have (Optional)
- [ ] Accessibility features tested
- [ ] Multiple browser testing complete
- [ ] Performance optimizations applied

---

## Task 8.2 Completion

**When all critical requirements pass:**

1. Mark Task 8.2 as done:
   ```bash
   task-master set-status --id=8.2 --status=done
   ```

2. Document any issues found:
   - Create GitHub issues for bugs
   - Document workarounds in deployment docs
   - Note performance bottlenecks

3. Capture production URL for Task 8.4 (Announce Phase 1 release)

4. Take screenshots for announcement:
   - Dashboard view with tasks
   - Issue tracker panel
   - Search and filter in action
   - Mobile responsive view

---

## Next Steps After Task 8.2

**Task 8.4: Announce Phase 1 Release**
- Share production URL with users
- Create announcement post
- Gather initial feedback
- Monitor for issues

---

**Generated by:** Claude Code (Autonomous Parallel Execution)
**Date:** 2025-11-13
**Task:** 8.2 - Test deployment on Replit
**Status:** Ready for user testing
