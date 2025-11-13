# Device Testing Quick Start Guide

**Agent E - Task 6.5: Test on Real Devices**

This guide provides a rapid workflow for testing the TaskMaster Web Integration on real devices.

---

## Prerequisites

1. **Server Running:**
   ```bash
   cd /home/anombyte/Projects/in-progress/TaskMasterWebIntegration
   npm run dev
   # Server should start on http://localhost:5000
   ```

2. **Device Access URLs:**
   - Local Network: `http://192.168.0.30:5000`
   - Tailscale: `http://100.118.13.31:5000`

---

## Quick Test (5 Minutes)

### Mobile Test (iPhone/Android)

1. **Open browser on phone**
   - URL: `http://192.168.0.30:5000`

2. **Visual check (30 seconds):**
   - ✅ Single-column layout
   - ✅ Drawer toggle button visible
   - ✅ Task list renders
   - ✅ No horizontal scrolling

3. **Interaction check (2 minutes):**
   - Tap drawer toggle → Issue tracker appears
   - Tap "Create Issue" → Modal opens full-screen
   - Type in search box → No zoom issues
   - Scroll task list → Smooth 60fps

4. **Screenshot:**
   - Take screenshot of home screen
   - Save to `attached_assets/mobile-quick-test.png`

**Pass/Fail:** ___________

---

### Tablet Test (iPad)

1. **Open browser on iPad**
   - URL: `http://192.168.0.30:5000`

2. **Visual check (30 seconds):**
   - ✅ Two-column layout (70/30 split)
   - ✅ Sidebar toggle button visible
   - ✅ Both task list and issue tracker visible

3. **Interaction check (2 minutes):**
   - Tap sidebar toggle → Sidebar collapses
   - Refresh page → State persists
   - Tap "Create Issue" → Modal centered (not full-screen)
   - Rotate device → Layout adapts smoothly

4. **Screenshot:**
   - Take screenshot of portrait view
   - Take screenshot of landscape view
   - Save to `attached_assets/tablet-quick-test-*.png`

**Pass/Fail:** ___________

---

## Medium Test (15 Minutes)

### All Devices - Feature Tests

#### Search Functionality
- [ ] Search bar visible on all screen sizes
- [ ] Typing works without layout issues
- [ ] Results filter instantly
- [ ] Virtual keyboard doesn't break layout
- [ ] Clear button works

#### Filter Functionality
- [ ] Filter dropdowns open correctly
- [ ] Touch targets are ≥48px
- [ ] Multi-select works
- [ ] Filters apply instantly

#### Modal Interactions
- [ ] Create Issue modal opens
- [ ] Issue Detail modal opens
- [ ] Modals close via backdrop
- [ ] Modals close via X button
- [ ] Forms are scrollable if content overflows

#### Performance Check
- [ ] Page loads in < 3 seconds (mobile)
- [ ] Scrolling is smooth (60fps)
- [ ] No janky animations
- [ ] No memory leaks (test for 5 minutes)

---

## Full Test (1 Hour)

Follow the comprehensive test plan in `DEVICE_TESTING_PLAN.md`.

---

## Chrome DevTools Testing (No Physical Device Needed)

### Setup

1. **Install Chrome/Chromium:**
   ```bash
   sudo pacman -S chromium
   ```

2. **Open DevTools:**
   ```bash
   chromium --new-window http://localhost:5000
   # Press F12 to open DevTools
   # Press Ctrl+Shift+M to toggle device mode
   ```

### Quick Device Emulation

**Preset Devices:**
- iPhone SE (375x667px) - Small mobile
- iPhone 12 Pro (390x844px) - Standard mobile
- Pixel 5 (393x851px) - Android mobile
- iPad Mini (768x1024px) - Tablet boundary
- iPad Air (820x1180px) - Standard tablet

**For each device:**
1. Select device from dropdown
2. Verify layout looks correct
3. Click through all interactions
4. Check console for errors (F12 → Console tab)
5. Screenshot any issues

### Performance Audit

1. **Open Lighthouse:**
   - F12 → Lighthouse tab
   - Select "Mobile" device
   - Select "Performance" category
   - Click "Analyze page load"

2. **Target Metrics:**
   - FCP < 1.8s
   - LCP < 2.5s
   - CLS < 0.1
   - TBT < 300ms
   - Score > 90

3. **Screenshot:**
   - Save Lighthouse report as HTML
   - Save to `attached_assets/lighthouse-mobile.html`

---

## Automated Testing

### Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Run Tests

```bash
# Run all responsive tests
npx playwright test client/src/__tests__/responsive.test.tsx

# Run with UI (visual debugging)
npx playwright test --ui

# Run specific test
npx playwright test -g "should render single-column layout"

# Run with headed browser (watch tests execute)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### Expected Results

- All tests pass ✅
- Performance tests pass ✅
- Accessibility tests pass ✅
- Screenshot comparisons match ✅

---

## Bug Reporting

### Found a Bug?

1. **Take screenshot/video**
2. **Note device details:**
   - Device: iPhone 13 Pro
   - OS: iOS 16.2
   - Browser: Safari 16.2
   - Screen: 390x844px

3. **Create GitHub issue:**
   ```bash
   gh issue create --template device-bug-report.md --title "[DEVICE-BUG] Brief description"
   ```

4. **Or manually:**
   - Go to: `.github/ISSUE_TEMPLATE/device-bug-report.md`
   - Copy template
   - Fill in details
   - Create issue on GitHub

---

## Remote Device Testing (BrowserStack)

### Setup BrowserStack Account

1. Sign up at https://www.browserstack.com/
2. Get API key from dashboard
3. Export credentials:
   ```bash
   export BROWSERSTACK_USERNAME="your_username"
   export BROWSERSTACK_ACCESS_KEY="your_access_key"
   ```

### Test on Real Devices

1. **Start BrowserStack Local:**
   ```bash
   npx browserstack-local --key $BROWSERSTACK_ACCESS_KEY
   ```

2. **Access app via BrowserStack:**
   - Open BrowserStack dashboard
   - Select device (iPhone 13 Pro, Pixel 6, etc.)
   - Enter URL: `http://localhost:5000`
   - Test interactively

3. **Automated Tests:**
   ```bash
   # Configure playwright.config.ts for BrowserStack
   npx playwright test --project=browserstack
   ```

---

## Visual Regression Testing (Percy)

### Setup Percy

1. Sign up at https://percy.io/
2. Get Percy token from dashboard
3. Export token:
   ```bash
   export PERCY_TOKEN="your_percy_token"
   ```

### Create Visual Snapshots

```bash
# Install Percy CLI
npm install -D @percy/cli @percy/playwright

# Run tests with Percy
npx percy exec -- playwright test
```

### Review Visual Changes

- Go to Percy dashboard
- Compare screenshots across devices
- Approve or reject changes

---

## Success Criteria

### Phase 1: Code Review ✅
- Responsive design code reviewed
- Performance optimizations present
- Accessibility considerations addressed

### Phase 2: DevTools Testing ⏳
- All breakpoints tested in Chrome DevTools
- Performance meets targets (Lighthouse > 90)
- No console errors

### Phase 3: Real Device Testing ⏳
- Tested on iPhone, Pixel, iPad
- All interactions work smoothly
- Performance feels snappy
- No critical bugs found

### Phase 4: Automated Testing ⏳
- Playwright tests pass
- Visual regression tests pass
- CI/CD integration complete

---

## Next Steps After Testing

1. **Document findings** in `DEVICE_TESTING_REPORT.md`
2. **Create GitHub issues** for any bugs found
3. **Prioritize fixes** (P0/P1 first)
4. **Add automated tests** to CI/CD pipeline
5. **Set up monitoring** (Sentry, LogRocket) for production

---

## Resources

- **Full Test Plan:** `docs/DEVICE_TESTING_PLAN.md`
- **Test Report:** `docs/DEVICE_TESTING_REPORT.md`
- **Bug Template:** `.github/ISSUE_TEMPLATE/device-bug-report.md`
- **Automated Tests:** `client/src/__tests__/responsive.test.tsx`

---

**Created:** 2025-11-13
**Agent:** Agent E
**Task:** 6.5 - Test on Real Devices
