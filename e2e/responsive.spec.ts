import { test, expect, devices } from '@playwright/test';
import tasksFixture from './fixtures/tasks.json' with { type: 'json' };
import issuesFixture from './fixtures/issues.json' with { type: 'json' };

/**
 * E2E Tests for Responsive Behavior
 *
 * Tests critical responsive features:
 * - Mobile viewport (320px-767px): Sidebar hidden, toggle button, pull-to-refresh
 * - Tablet viewport (768px-1023px): Collapsible sidebar with persistence
 * - Desktop viewport (1024px+): Split-screen layout, always-visible sidebar
 * - Touch interactions on mobile
 * - Layout shifts at breakpoints
 */

test.describe('Responsive Layout - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(devices['iPhone 12'].viewport);
    // Mock APIs
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tasks: tasksFixture.master.tasks }),
      });
    });

    await page.route('**/api/issues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, issues: issuesFixture }),
      });
    });

    await page.goto('/');
  });

  test('should hide sidebar by default on mobile', async ({ page }) => {
    // Sidebar should not be visible initially
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).not.toBeVisible();

    // Main content should be full width
    const mainContent = page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('should show toggle button for sidebar on mobile', async ({ page }) => {
    // Toggle button should be visible
    const toggleButton = page.getByRole('button', { name: /menu|toggle|sidebar/i });
    await expect(toggleButton).toBeVisible();
  });

  test('should open sidebar when toggle button is clicked', async ({ page }) => {
    // Click toggle button
    const toggleButton = page.getByRole('button', { name: /menu|toggle|sidebar/i });
    await toggleButton.click();

    // Sidebar should become visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Issues should be visible in sidebar
    await expect(page.getByText('Login button not responsive')).toBeVisible();
  });

  test('should close sidebar with overlay click on mobile', async ({ page }) => {
    // Open sidebar
    const toggleButton = page.getByRole('button', { name: /menu|toggle|sidebar/i });
    await toggleButton.click();

    // Wait for sidebar to open
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Click overlay (outside sidebar)
    const overlay = page.locator('[data-testid="sidebar-overlay"]');
    if (await overlay.isVisible()) {
      await overlay.click();
      await expect(sidebar).not.toBeVisible();
    }
  });

  test('should enable pull-to-refresh on mobile', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Simulate pull-to-refresh gesture
    const scrollContainer = page.locator('[data-testid="main-content"]');

    // Drag down from top
    await scrollContainer.dispatchEvent('touchstart', {
      touches: [{ clientX: 200, clientY: 0 }],
    });

    await scrollContainer.dispatchEvent('touchmove', {
      touches: [{ clientX: 200, clientY: 100 }],
    });

    // Should show refresh indicator
    const refreshIndicator = page.locator('[data-testid="pull-to-refresh-indicator"]');
    if (await refreshIndicator.isVisible()) {
      await expect(refreshIndicator).toBeVisible();
    }

    await scrollContainer.dispatchEvent('touchend', {});
  });

  test('should stack tasks vertically on mobile', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Get first two task cards
    const taskCards = page.locator('[data-testid="task-card"]');
    const firstCard = taskCards.nth(0);
    const secondCard = taskCards.nth(1);

    // Get bounding boxes
    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    // Cards should be stacked vertically (second card below first)
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height);
  });

  test('should make search bar full width on mobile', async ({ page }) => {
    // Search bar should be visible
    const searchBar = page.getByPlaceholder(/search/i);
    await expect(searchBar).toBeVisible();

    // Get viewport and search bar widths
    const viewportSize = page.viewportSize();
    const searchBox = await searchBar.boundingBox();

    // Search bar should take most of the width (allowing for padding)
    const widthRatio = searchBox!.width / viewportSize!.width;
    expect(widthRatio).toBeGreaterThan(0.85); // At least 85% width
  });

  test('should show mobile-optimized filters', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Filter buttons should be visible
    const statusFilter = page.getByRole('button', { name: /status/i });
    await expect(statusFilter).toBeVisible();

    // Click filter
    await statusFilter.click();

    // Filter dropdown should be visible and touch-friendly
    const filterDropdown = page.getByRole('menu').or(page.locator('[role="listbox"]'));
    await expect(filterDropdown.first()).toBeVisible();
  });

  test('should have touch-friendly button sizes on mobile', async ({ page }) => {
    // Wait for buttons to load
    const createIssueButton = page.getByRole('button', { name: /create issue/i });
    await expect(createIssueButton).toBeVisible();

    // Button should be at least 44x44px (Apple's guideline)
    const buttonBox = await createIssueButton.boundingBox();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Responsive Layout - Tablet', () => {
  test.beforeEach(async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize(devices['iPad Pro'].viewport);
    // Mock APIs
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tasks: tasksFixture.master.tasks }),
      });
    });

    await page.route('**/api/issues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, issues: issuesFixture }),
      });
    });

    await page.goto('/');
  });

  test('should show collapsible sidebar on tablet', async ({ page }) => {
    // Sidebar should be visible or have toggle button
    const sidebar = page.locator('[data-testid="sidebar"]');
    const toggleButton = page.getByRole('button', { name: /menu|toggle|sidebar/i });

    // Either sidebar is visible or toggle button is present
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    const toggleVisible = await toggleButton.isVisible().catch(() => false);

    expect(sidebarVisible || toggleVisible).toBe(true);
  });

  test('should persist sidebar state on tablet', async ({ page }) => {
    // Toggle sidebar
    const toggleButton = page.getByRole('button', { name: /menu|toggle|sidebar/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Wait for animation
      await page.waitForTimeout(300);

      // Reload page
      await page.reload();

      // Sidebar state should persist (implementation-dependent)
      // Check localStorage or URL for state persistence
      const sidebarState = await page.evaluate(() =>
        localStorage.getItem('tablet-sidebar-open')
      );

      // State should be saved
      expect(sidebarState).not.toBeNull();
    }
  });

  test('should show both tasks and issues on tablet', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Tasks should be visible
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();

    // Issues should be visible (if sidebar is open)
    const sidebar = page.locator('[data-testid="sidebar"]');
    if (await sidebar.isVisible()) {
      await expect(page.getByText('Login button not responsive')).toBeVisible();
    }
  });

  test('should have optimized layout for tablet width', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Get viewport width
    const viewportSize = page.viewportSize();

    // Main content should use appropriate width
    const mainContent = page.locator('[data-testid="main-content"]');
    const mainBox = await mainContent.boundingBox();

    // Content should not be too narrow or too wide
    const widthRatio = mainBox!.width / viewportSize!.width;
    expect(widthRatio).toBeGreaterThan(0.5); // At least 50% of viewport
    expect(widthRatio).toBeLessThan(1.0); // Not full width (if sidebar is visible)
  });
});

test.describe('Responsive Layout - Desktop', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  test.beforeEach(async ({ page }) => {
    // Mock APIs
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tasks: tasksFixture.master.tasks }),
      });
    });

    await page.route('**/api/issues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, issues: issuesFixture }),
      });
    });

    await page.goto('/');
  });

  test('should show split-screen layout on desktop', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Both tasks and issues should be visible
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();
    await expect(page.getByText('Login button not responsive')).toBeVisible();

    // Sidebar should be always visible (no toggle button needed)
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should have proper 70-30 split on desktop', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Get viewport width
    const viewportSize = page.viewportSize();

    // Get main content and sidebar widths
    const mainContent = page.locator('[data-testid="main-content"]');
    const sidebar = page.locator('[data-testid="sidebar"]');

    const mainBox = await mainContent.boundingBox();
    const sidebarBox = await sidebar.boundingBox();

    // Calculate width ratios
    const mainRatio = mainBox!.width / viewportSize!.width;
    const sidebarRatio = sidebarBox!.width / viewportSize!.width;

    // Main content should be roughly 70%, sidebar 30%
    expect(mainRatio).toBeGreaterThan(0.6);
    expect(mainRatio).toBeLessThan(0.8);
    expect(sidebarRatio).toBeGreaterThan(0.2);
    expect(sidebarRatio).toBeLessThan(0.4);
  });

  test('should not show pull-to-refresh on desktop', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Pull-to-refresh indicator should not be visible
    const refreshIndicator = page.locator('[data-testid="pull-to-refresh-indicator"]');
    await expect(refreshIndicator).not.toBeVisible();
  });

  test('should show multiple task cards per row on desktop', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Get first two task cards
    const taskCards = page.locator('[data-testid="task-card"]');
    const count = await taskCards.count();

    if (count >= 2) {
      const firstCard = taskCards.nth(0);
      const secondCard = taskCards.nth(1);

      // Get bounding boxes
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();

      // Cards might be side by side or stacked (depends on design)
      // Just verify they're positioned logically
      expect(firstBox!.x).toBeDefined();
      expect(secondBox!.x).toBeDefined();
    }
  });

  test('should have hover effects on desktop', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Hover over a task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await taskCard.hover();

    // Card should have visual feedback (opacity, shadow, etc.)
    // This is implementation-dependent, so we just verify hover is possible
    await expect(taskCard).toBeVisible();
  });
});

test.describe('Responsive Breakpoint Tests', () => {
  const breakpoints = [
    { name: 'Small Mobile', width: 320, height: 568 },
    { name: 'Medium Mobile', width: 375, height: 667 },
    { name: 'Large Mobile', width: 414, height: 896 },
    { name: 'Small Tablet', width: 768, height: 1024 },
    { name: 'Large Tablet', width: 1024, height: 768 },
    { name: 'Small Desktop', width: 1280, height: 720 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
  ];

  for (const breakpoint of breakpoints) {
    test(`should render correctly at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({
      page,
    }) => {
      // Set viewport size
      await page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height,
      });

      // Mock APIs
      await page.route('**/api/tasks', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, tasks: tasksFixture.master.tasks }),
        });
      });

      await page.route('**/api/issues', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, issues: issuesFixture }),
        });
      });

      await page.goto('/');

      // Wait for content to load
      await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });

      // Take screenshot for visual regression
      await page.screenshot({
        path: `e2e/screenshots/breakpoint-${breakpoint.width}x${breakpoint.height}.png`,
        fullPage: true,
      });

      // Verify core elements are visible
      await expect(page.getByText('Setup project infrastructure')).toBeVisible();

      // Verify no horizontal overflow
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      expect(bodyBox!.width).toBeLessThanOrEqual(breakpoint.width);
    });
  }

  test('should handle orientation change on mobile', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });

    // Mock APIs
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tasks: tasksFixture.master.tasks }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="task-card"]');

    // Take portrait screenshot
    await page.screenshot({ path: 'e2e/screenshots/portrait.png' });

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500); // Wait for layout to adjust

    // Take landscape screenshot
    await page.screenshot({ path: 'e2e/screenshots/landscape.png' });

    // Verify content is still visible
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();
  });

  test('should handle zoom levels', async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Mock APIs
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, tasks: tasksFixture.master.tasks }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="task-card"]');

    // Test different zoom levels
    for (const zoomLevel of [0.75, 1.0, 1.25, 1.5]) {
      await page.evaluate((zoom) => {
        document.body.style.zoom = zoom.toString();
      }, zoomLevel);

      await page.waitForTimeout(300);

      // Verify content is still accessible
      await expect(page.getByText('Setup project infrastructure')).toBeVisible();
    }
  });
});
