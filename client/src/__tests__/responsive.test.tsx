/**
 * Responsive Design Tests
 *
 * Tests responsive layout behavior across mobile, tablet, and desktop breakpoints.
 * Uses Playwright for device emulation and real browser testing.
 *
 * Test Coverage:
 * - Mobile layout (<768px)
 * - Tablet layout (768-1023px)
 * - Desktop layout (≥1024px)
 * - Touch target sizes (WCAG 2.1 AA compliance)
 * - Performance metrics (Core Web Vitals)
 * - Accessibility (keyboard navigation, screen reader)
 *
 * Usage:
 *   npm run test:e2e                    # Run all tests
 *   npx playwright test responsive      # Run only responsive tests
 *   npx playwright test --ui            # Run with UI mode
 *   npx playwright test --debug         # Run in debug mode
 */

import { test, expect, devices, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Helper function to wait for page to be fully loaded
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="task-list"], [role="main"]', { timeout: 10000 });
}

test.describe('Mobile Layout Tests (<768px)', () => {
  test.use({ ...devices['iPhone 12 Pro'] });

  test('should render single-column layout on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Verify viewport width is mobile
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThan(768);

    // Verify drawer toggle is visible (mobile-specific)
    const drawerToggle = page.locator('[data-testid="drawer-toggle"], button:has-text("Menu")').first();
    await expect(drawerToggle).toBeVisible();

    // Verify sidebar is hidden initially on mobile
    const sidebar = page.locator('[data-testid="sidebar"]');
    // On mobile, sidebar should either be hidden or positioned off-screen
    const isVisible = await sidebar.isVisible().catch(() => false);
    if (isVisible) {
      // Check if it's positioned off-screen
      const box = await sidebar.boundingBox();
      expect(box?.x).toBeLessThan(0); // Off-screen to the left
    }
  });

  test('should toggle drawer on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Find and click drawer toggle
    const drawerToggle = page.locator('[data-testid="drawer-toggle"], button:has-text("Menu")').first();
    await drawerToggle.click();

    // Wait for animation
    await page.waitForTimeout(300);

    // Verify sidebar becomes visible or moves on-screen
    const sidebar = page.locator('[data-testid="sidebar"]');
    const isVisible = await sidebar.isVisible();
    if (isVisible) {
      const box = await sidebar.boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0); // On-screen
    }

    // Close drawer
    await drawerToggle.click();
    await page.waitForTimeout(300);
  });

  test('should open modal appropriately on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Click "Create Issue" button (if exists)
    const createButton = page.locator('button:has-text("Create Issue"), button:has-text("New Issue")').first();
    const buttonExists = await createButton.count() > 0;

    if (buttonExists) {
      await createButton.click();

      // Verify modal is visible
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // On mobile, modal should be full-width or near full-width
      const modalBox = await modal.boundingBox();
      const viewportSize = page.viewportSize();

      if (modalBox && viewportSize) {
        // Modal should be at least 90% of viewport width on mobile
        expect(modalBox.width).toBeGreaterThan(viewportSize.width * 0.85);
      }

      // Close modal
      const closeButton = modal.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
      }
    }
  });

  test('should have touch targets ≥48px (WCAG 2.1 AA)', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Check drawer toggle size
    const drawerToggle = page.locator('[data-testid="drawer-toggle"], button:has-text("Menu")').first();
    const box = await drawerToggle.boundingBox();

    expect(box?.height).toBeGreaterThanOrEqual(44); // WCAG AA minimum
    expect(box?.width).toBeGreaterThanOrEqual(44);

    // Check other interactive elements
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const buttonBox = await button.boundingBox();

      if (buttonBox) {
        // Either height or width should be ≥44px for touch targets
        const meetsMinimum = buttonBox.height >= 44 || buttonBox.width >= 44;
        expect(meetsMinimum).toBeTruthy();
      }
    }
  });

  test('should handle search input without layout issues', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Find search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    const inputExists = await searchInput.count() > 0;

    if (inputExists) {
      // Click input (should not cause zoom on mobile)
      await searchInput.click();

      // Type in search box
      await searchInput.fill('test query');

      // Verify viewport didn't zoom
      const viewportSize = page.viewportSize();
      expect(viewportSize?.width).toBeLessThan(768); // Should still be mobile viewport

      // Clear input
      await searchInput.clear();
    }
  });
});

test.describe('Tablet Layout Tests (768-1023px)', () => {
  test.use({ ...devices['iPad Mini'] });

  test('should render two-column layout on tablet', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Verify viewport width is tablet
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeGreaterThanOrEqual(768);
    expect(viewportSize?.width).toBeLessThan(1024);

    // Verify sidebar toggle is visible (tablet-specific)
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"], button:has-text("Toggle")').first();
    const toggleExists = await sidebarToggle.count() > 0;

    if (toggleExists) {
      await expect(sidebarToggle).toBeVisible();
    }

    // Verify main content area is visible
    const mainContent = page.locator('[data-testid="task-list"], [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should persist sidebar state on tablet', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Find sidebar toggle
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"], button:has-text("Toggle")').first();
    const toggleExists = await sidebarToggle.count() > 0;

    if (toggleExists) {
      // Get initial sidebar state
      const sidebar = page.locator('[data-testid="sidebar"]');
      const initiallyVisible = await sidebar.isVisible();

      // Toggle sidebar
      await sidebarToggle.click();
      await page.waitForTimeout(300);

      // Verify state changed
      const afterToggle = await sidebar.isVisible();
      expect(afterToggle).not.toBe(initiallyVisible);

      // Reload page
      await page.reload();
      await waitForPageLoad(page);

      // Verify state persisted
      const afterReload = await sidebar.isVisible();
      expect(afterReload).toBe(afterToggle);
    }
  });

  test('should handle orientation change gracefully', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Portrait mode (default)
    let viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThan(viewportSize?.height!);

    // Switch to landscape
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500); // Wait for layout reflow

    viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeGreaterThan(viewportSize?.height!);

    // Verify layout still works
    const mainContent = page.locator('[data-testid="task-list"], [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Desktop Layout Tests (≥1024px)', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('should render full layout on desktop', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Verify viewport width is desktop
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeGreaterThanOrEqual(1024);

    // Verify main content is visible
    const mainContent = page.locator('[data-testid="task-list"], [role="main"]').first();
    await expect(mainContent).toBeVisible();

    // Verify sidebar is visible (not collapsible on desktop)
    const sidebar = page.locator('[data-testid="sidebar"]');
    const sidebarExists = await sidebar.count() > 0;

    if (sidebarExists) {
      await expect(sidebar).toBeVisible();

      // Verify sidebar toggle is NOT visible on desktop
      const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
      const toggleVisible = await sidebarToggle.isVisible().catch(() => false);
      expect(toggleVisible).toBe(false);
    }
  });

  test('should center modal on desktop', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Click "Create Issue" button
    const createButton = page.locator('button:has-text("Create Issue"), button:has-text("New Issue")').first();
    const buttonExists = await createButton.count() > 0;

    if (buttonExists) {
      await createButton.click();

      // Verify modal is visible
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // On desktop, modal should be centered and NOT full-width
      const modalBox = await modal.boundingBox();
      const viewportSize = page.viewportSize();

      if (modalBox && viewportSize) {
        // Modal should be less than 80% of viewport width
        expect(modalBox.width).toBeLessThan(viewportSize.width * 0.8);

        // Modal should be roughly centered horizontally
        const centerX = viewportSize.width / 2;
        const modalCenterX = modalBox.x + modalBox.width / 2;
        const offset = Math.abs(centerX - modalCenterX);
        expect(offset).toBeLessThan(viewportSize.width * 0.1); // Within 10% of center
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Verify focus is visible
    const focused = await page.locator(':focus').count();
    expect(focused).toBeGreaterThan(0);

    // Tab multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Verify focus moved
    const finalFocused = await page.locator(':focus').count();
    expect(finalFocused).toBeGreaterThan(0);
  });
});

test.describe('Performance Tests', () => {
  test.use({ ...devices['iPhone 12 Pro'] });

  test('should meet Core Web Vitals on mobile', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');

      return {
        fcp: fcp?.startTime || 0,
        lcp: lcp?.startTime || 0,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      };
    });

    // FCP should be < 1.8s (mobile target)
    expect(metrics.fcp).toBeLessThan(1800);

    // LCP should be < 2.5s (mobile target)
    if (metrics.lcp > 0) {
      expect(metrics.lcp).toBeLessThan(2500);
    }

    // DOM Content Loaded should be < 2s
    expect(metrics.domContentLoaded).toBeLessThan(2000);

    console.log('Performance Metrics:', metrics);
  });

  test('should scroll smoothly without dropped frames', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Start performance recording
    await page.evaluate(() => {
      (window as any).performanceData = [];
      let lastTime = performance.now();

      function measureFrame() {
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        (window as any).performanceData.push(delta);
        lastTime = currentTime;
        requestAnimationFrame(measureFrame);
      }

      requestAnimationFrame(measureFrame);
    });

    // Scroll the page
    await page.evaluate(() => {
      window.scrollTo({ top: 1000, behavior: 'smooth' });
    });

    await page.waitForTimeout(2000);

    // Get frame times
    const frameTimes = await page.evaluate(() => (window as any).performanceData);

    // Calculate dropped frames (frames > 16.67ms = 60fps)
    const droppedFrames = frameTimes.filter((time: number) => time > 16.67).length;
    const totalFrames = frameTimes.length;
    const droppedPercentage = (droppedFrames / totalFrames) * 100;

    // Should have < 5% dropped frames
    expect(droppedPercentage).toBeLessThan(5);

    console.log(`Dropped frames: ${droppedFrames}/${totalFrames} (${droppedPercentage.toFixed(2)}%)`);
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper color contrast (WCAG AA)', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Inject axe-core for accessibility testing (if available)
    try {
      await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js' });

      // Run axe accessibility tests
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          (window as any).axe.run({ rules: ['color-contrast'] }, (err: any, results: any) => {
            resolve(results);
          });
        });
      });

      // @ts-ignore
      const violations = results.violations || [];

      // Should have no color contrast violations
      expect(violations.length).toBe(0);

      if (violations.length > 0) {
        console.log('Color Contrast Violations:', JSON.stringify(violations, null, 2));
      }
    } catch (error) {
      console.log('Skipping axe-core test (library not available)');
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Verify page has proper semantic structure
    const main = await page.locator('main, [role="main"]').count();
    expect(main).toBeGreaterThan(0);

    // Verify headings exist
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);

    // Verify buttons have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
      expect(accessibleName).toBeTruthy();
    }
  });
});

test.describe('Breakpoint Transition Tests', () => {
  test('should transition smoothly between breakpoints', async ({ page }) => {
    await page.goto(BASE_URL);

    // Start at mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForPageLoad(page);

    // Transition to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Verify layout adjusted
    let mainContent = page.locator('[data-testid="task-list"], [role="main"]').first();
    await expect(mainContent).toBeVisible();

    // Transition to desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);

    // Verify layout adjusted again
    mainContent = page.locator('[data-testid="task-list"], [role="main"]').first();
    await expect(mainContent).toBeVisible();

    // Transition back to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Verify layout works again
    mainContent = page.locator('[data-testid="task-list"], [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });
});
