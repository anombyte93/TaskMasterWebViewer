# Device Testing Plan - TaskMaster Web Integration

**Created:** 2025-11-13
**Agent:** Agent E
**Task:** 6.5 - Test on Real Devices

---

## Testing Objectives

1. Verify responsive layout across all breakpoints
2. Validate touch interactions on mobile/tablet devices
3. Ensure performance meets targets on mobile networks
4. Identify browser-specific quirks (iOS Safari, Android Chrome)
5. Test accessibility features on real devices

---

## Priority Devices & Browsers

### Critical (Must Test)
- **iPhone 12/13 Pro** (390x844px) - iOS Safari 15+
- **Pixel 5/6** (393x851px) - Android Chrome 90+
- **iPad Mini** (768x1024px) - Tablet breakpoint boundary
- **iPad Air** (820x1180px) - Tablet layout validation

### Secondary (Chrome DevTools Emulation)
- iPhone SE (375x667px) - Small mobile test
- Samsung Galaxy S20 (360x800px) - Android reference
- iPad Pro (1024x1366px) - Desktop breakpoint boundary

---

## Test Scenarios

### 1. Mobile Layout (<768px)

#### Layout Tests
- [ ] Single-column layout renders correctly
- [ ] Sidebar becomes bottom drawer
- [ ] Task cards are full-width
- [ ] Issue tracker hidden (accessible via drawer)
- [ ] Header is responsive and functional

#### Touch Interaction Tests
- [ ] Drawer opens/closes smoothly
- [ ] Touch targets ≥48px (buttons, links, checkboxes)
- [ ] Swipe gestures work on task cards
- [ ] Modal opens full-screen
- [ ] No accidental clicks on adjacent elements

#### Performance Tests
- [ ] FCP < 1.8s on 3G connection
- [ ] LCP < 2.5s on 3G connection
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth 60fps scrolling
- [ ] Modal animations don't lag

#### iOS Safari Specific
- [ ] Viewport units (vh) render correctly
- [ ] No rubber-band scrolling issues
- [ ] Address bar show/hide doesn't break layout
- [ ] Touch events work without 300ms delay
- [ ] Form inputs zoom correctly

#### Android Chrome Specific
- [ ] Address bar auto-hide works smoothly
- [ ] Pull-to-refresh doesn't conflict with scroll
- [ ] Font rendering is crisp
- [ ] Hardware acceleration works for animations

### 2. Tablet Layout (768-1023px)

#### Layout Tests
- [ ] Two-column layout (70/30 split)
- [ ] Sidebar is collapsible with toggle button
- [ ] Task list maintains proper width
- [ ] Issue tracker sidebar width is correct
- [ ] Breakpoint transition is smooth at 768px

#### Interaction Tests
- [ ] Sidebar toggle persists state in localStorage
- [ ] Touch targets remain ≥48px
- [ ] Modal opens centered (not full-screen)
- [ ] Search bar width adjusts properly
- [ ] Filter dropdowns are accessible

#### iPad Specific
- [ ] Split-screen mode works correctly
- [ ] Orientation change (portrait/landscape) works
- [ ] Hover states work with Apple Pencil
- [ ] Keyboard shortcuts work with external keyboard

### 3. Desktop Layout (≥1024px)

#### Layout Tests
- [ ] Full three-column layout
- [ ] Sidebar always visible (not collapsible)
- [ ] Task list optimal reading width
- [ ] Issue tracker right-aligned
- [ ] Header spans full width

#### Interaction Tests
- [ ] Mouse hover states work correctly
- [ ] Keyboard navigation works
- [ ] Modals center on screen
- [ ] Focus states visible for accessibility

### 4. Cross-Device Feature Tests

#### Search Functionality
- [ ] Search bar renders on all screen sizes
- [ ] Search input focuses correctly
- [ ] Results filter instantly
- [ ] Virtual keyboard doesn't break layout (mobile)
- [ ] Clear button works on all devices

#### Filter Functionality
- [ ] Filter dropdowns open correctly
- [ ] Multi-select works via touch
- [ ] Filters apply instantly
- [ ] Filter state persists on refresh
- [ ] Mobile-friendly dropdown sizing

#### Modal Interactions
- [ ] Create Issue modal opens correctly
- [ ] Issue Detail modal opens correctly
- [ ] Modals close via backdrop click
- [ ] Modals close via X button
- [ ] Modals are scrollable when content overflows
- [ ] Form validation works on all devices

#### Task List
- [ ] Tasks load and render smoothly
- [ ] Infinite scroll works (if implemented)
- [ ] Task cards are touch-friendly
- [ ] Status badges readable on small screens
- [ ] Subtasks expand/collapse correctly

#### Issue Tracker
- [ ] Issues render in sidebar (tablet+)
- [ ] Issues render in drawer (mobile)
- [ ] Create button accessible on all devices
- [ ] Severity badges color-coded correctly
- [ ] Click targets are appropriately sized

### 5. Performance Benchmarks

#### Mobile (3G Network Simulation)
- [ ] Initial page load < 3s
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] TTI < 3.8s
- [ ] Total bundle size < 500KB gzipped

#### Tablet/Desktop (Fast 3G/4G)
- [ ] Initial page load < 2s
- [ ] FCP < 1.0s
- [ ] LCP < 1.5s
- [ ] TTI < 2.5s

#### Runtime Performance
- [ ] 60fps scrolling on all devices
- [ ] Smooth animations (no jank)
- [ ] No memory leaks over 5min usage
- [ ] Battery usage reasonable

### 6. Accessibility Tests

- [ ] Screen reader announces layout changes
- [ ] Touch targets meet WCAG 2.1 AA (44px minimum)
- [ ] Focus indicators visible on all devices
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works (tablet with keyboard)
- [ ] Pinch-to-zoom works (mobile)

---

## Testing Methodology

### Phase 1: Chrome DevTools Emulation (Quick Iteration)

**Tools:**
- Chrome DevTools Device Mode
- Lighthouse CI for performance
- Network throttling (Slow 3G, Fast 3G, 4G)

**Process:**
1. Open DevTools (F12)
2. Toggle device mode (Ctrl+Shift+M)
3. Select device from preset list
4. Test all scenarios above
5. Use Lighthouse for performance audit
6. Screenshot any issues

**Devices to emulate:**
- iPhone SE (375px)
- iPhone 12 Pro (390px)
- Pixel 5 (393px)
- iPad Mini (768px)
- iPad Air (820px)

### Phase 2: Real Device Testing

**Setup:**
1. Ensure dev server is running: `npm run dev`
2. Get local IP: `ip addr show | grep inet`
3. Access via: `http://[local-ip]:5000` (or via Tailscale)
4. Test on actual devices

**Testing checklist per device:**
1. Open app in browser
2. Test all touch interactions
3. Test orientation change (portrait/landscape)
4. Test performance (FCP, LCP via Chrome Remote Debugging)
5. Screenshot any layout issues
6. Document browser version

### Phase 3: Automated Testing (Optional)

**Create Playwright tests:**
```typescript
// client/src/__tests__/responsive.test.tsx
test('mobile layout renders correctly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5000');

  // Verify single-column layout
  const sidebar = page.locator('[data-testid="sidebar"]');
  await expect(sidebar).toBeHidden();

  // Verify drawer toggle exists
  const drawerToggle = page.locator('[data-testid="drawer-toggle"]');
  await expect(drawerToggle).toBeVisible();
});
```

---

## Bug Reporting Template

When issues are found, document using this format:

```markdown
### Bug: [Brief Description]

**Device:** iPhone 13 Pro (iOS 16.2 Safari)
**Screen Size:** 390x844px
**Breakpoint:** Mobile (<768px)

**Steps to Reproduce:**
1. Open app on iPhone
2. Tap "Create Issue" button
3. Observe modal behavior

**Expected Behavior:**
Modal should open full-screen on mobile

**Actual Behavior:**
Modal opens centered with backdrop, not full-screen

**Screenshot:** [Attach screenshot]

**Priority:** High / Medium / Low

**Related Code:**
- File: `client/src/pages/Dashboard.tsx`
- Line: 192
```

---

## Success Criteria

Testing is complete when:
1. All critical devices tested (iPhone, Pixel, iPad Mini, iPad Air)
2. All test scenarios executed (95%+ pass rate)
3. Performance benchmarks met on mobile
4. No critical bugs found (P0/P1)
5. Test report created with screenshots
6. Any minor bugs documented for follow-up

---

## Timeline

- **Phase 1 (DevTools):** 30 minutes
- **Phase 2 (Real Devices):** 45 minutes
- **Phase 3 (Automated):** 30 minutes (optional)
- **Total:** 1-2 hours

---

## Next Steps After Testing

1. Create GitHub issues for any bugs found
2. Update `DEVICE_TESTING_REPORT.md` with results
3. Share findings with team
4. Prioritize bug fixes for next sprint
5. Consider adding automated responsive tests to CI/CD
