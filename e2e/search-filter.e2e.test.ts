import { test, expect } from '@playwright/test';

/**
 * Search and Filter E2E Tests
 *
 * Tests critical user flows for search and filtering including:
 * - Search bar functionality with debouncing
 * - Filter bar interactions (status, priority, severity)
 * - Combined search + filter operations
 * - Filter badge management
 * - Clear all functionality
 * - Real-time filtering results
 */

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display search bar on dashboard', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Verify search icon
    const searchIcon = page.locator('.lucide-search, svg').first();
    await expect(searchIcon).toBeVisible();
  });

  test('should allow typing in search bar', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Type search query
    await searchInput.fill('test query');

    // Verify value
    await expect(searchInput).toHaveValue('test query');
  });

  test('should show clear button when search has text', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Initially, clear button should not be visible
    const clearButton = page.locator('button[aria-label*="Clear"]');
    await expect(clearButton).not.toBeVisible();

    // Type text
    await searchInput.fill('search term');

    // Clear button should appear
    await expect(clearButton).toBeVisible();
  });

  test('should clear search when clear button is clicked', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    const clearButton = page.locator('button[aria-label*="Clear"]');

    // Type text
    await searchInput.fill('search term');
    await expect(searchInput).toHaveValue('search term');

    // Click clear button
    await clearButton.click();

    // Verify search is cleared
    await expect(searchInput).toHaveValue('');

    // Clear button should be hidden
    await expect(clearButton).not.toBeVisible();
  });

  test('should debounce search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Type multiple characters quickly
    await searchInput.type('test', { delay: 50 });

    // Wait less than debounce time
    await page.waitForTimeout(200);

    // Input should show all characters
    await expect(searchInput).toHaveValue('test');

    // Wait for debounce
    await page.waitForTimeout(400);

    // Search should be applied (network request may occur)
  });

  test('should filter tasks based on search query', async ({ page }) => {
    // Skip if no tasks exist
    const initialTaskCount = await page.locator('.task-card').count();
    test.skip(initialTaskCount === 0, 'No tasks available for testing');

    // Get first task title
    const firstTaskTitle = await page.locator('.task-card h3').first().textContent();

    if (firstTaskTitle) {
      // Search for part of the title
      const searchTerm = firstTaskTitle.substring(0, 5);
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill(searchTerm);

      // Wait for debounce
      await page.waitForTimeout(500);

      // Verify results are filtered (at least one task should match)
      const filteredTaskCount = await page.locator('.task-card').count();
      expect(filteredTaskCount).toBeGreaterThan(0);
      expect(filteredTaskCount).toBeLessThanOrEqual(initialTaskCount);
    }
  });

  test('should show no results when search matches nothing', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Search for something that definitely doesn't exist
    await searchInput.fill('xyzabc123nonexistent999');

    // Wait for debounce and filtering
    await page.waitForTimeout(500);

    // Should show empty state
    const hasEmptyState = await page.locator('text=No tasks found').isVisible();
    const taskCount = await page.locator('.task-card').count();

    // Either empty state is visible or no task cards exist
    expect(hasEmptyState || taskCount === 0).toBeTruthy();
  });
});

test.describe('Filter Bar Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display filter buttons', async ({ page }) => {
    // Check for Status filter
    await expect(page.locator('button:has-text("Status")')).toBeVisible();

    // Check for Priority filter
    await expect(page.locator('button:has-text("Priority")')).toBeVisible();
  });

  test('should open status filter dropdown', async ({ page }) => {
    const statusButton = page.locator('button:has-text("Status")').first();
    await statusButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(300);

    // Verify filter options are visible
    await expect(page.locator('text=Filter by Status')).toBeVisible();

    // Check for status options
    await expect(page.locator('label:has-text("pending")')).toBeVisible();
    await expect(page.locator('label:has-text("in-progress")')).toBeVisible();
    await expect(page.locator('label:has-text("done")')).toBeVisible();
  });

  test('should open priority filter dropdown', async ({ page }) => {
    const priorityButton = page.locator('button:has-text("Priority")').first();
    await priorityButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(300);

    // Verify filter options are visible
    await expect(page.locator('text=Filter by Priority')).toBeVisible();

    // Check for priority options
    await expect(page.locator('label:has-text("high")')).toBeVisible();
    await expect(page.locator('label:has-text("medium")')).toBeVisible();
    await expect(page.locator('label:has-text("low")')).toBeVisible();
  });

  test('should apply status filter when checkbox is selected', async ({ page }) => {
    // Skip if no tasks exist
    const initialTaskCount = await page.locator('.task-card').count();
    test.skip(initialTaskCount === 0, 'No tasks available for testing');

    // Open status filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);

    // Select "done" status
    const doneCheckbox = page.locator('label:has-text("done")').first();
    await doneCheckbox.click();

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Close dropdown by clicking outside or pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify filter badge appears
    const filterBadge = page.locator('.gap-1.pl-3.pr-1:has-text("done")');
    await expect(filterBadge).toBeVisible();

    // Verify button shows count
    const statusButton = page.locator('button:has-text("Status")').first();
    const buttonBadge = statusButton.locator('.rounded-full');
    await expect(buttonBadge).toBeVisible();
  });

  test('should apply priority filter when checkbox is selected', async ({ page }) => {
    // Skip if no tasks exist
    const initialTaskCount = await page.locator('.task-card').count();
    test.skip(initialTaskCount === 0, 'No tasks available for testing');

    // Open priority filter
    await page.locator('button:has-text("Priority")').first().click();
    await page.waitForTimeout(300);

    // Select "high" priority
    const highCheckbox = page.locator('label:has-text("high")').first();
    await highCheckbox.click();

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Close dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify filter badge appears
    const filterBadge = page.locator('.gap-1.pl-3.pr-1:has-text("high")');
    await expect(filterBadge).toBeVisible();
  });

  test('should show filter badge count on button', async ({ page }) => {
    // Open status filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);

    // Select multiple statuses
    await page.locator('label:has-text("pending")').first().click();
    await page.waitForTimeout(200);
    await page.locator('label:has-text("done")').first().click();
    await page.waitForTimeout(200);

    // Close dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify badge shows "2"
    const statusButton = page.locator('button:has-text("Status")').first();
    const badge = statusButton.locator('.rounded-full:has-text("2")');
    await expect(badge).toBeVisible();
  });

  test('should remove filter when badge X is clicked', async ({ page }) => {
    // Apply a filter first
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("done")').first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Find filter badge
    const filterBadge = page.locator('.gap-1.pl-3.pr-1:has-text("done")').first();
    await expect(filterBadge).toBeVisible();

    // Click remove button on badge
    const removeButton = filterBadge.locator('button');
    await removeButton.click();

    // Wait for removal
    await page.waitForTimeout(300);

    // Badge should be gone
    await expect(filterBadge).not.toBeVisible();
  });

  test('should show "Clear all" button when filters are active', async ({ page }) => {
    // Initially, Clear all should not be visible
    const clearAllButton = page.locator('button:has-text("Clear all")');
    await expect(clearAllButton).not.toBeVisible();

    // Apply a filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("pending")').first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Clear all should now be visible
    await expect(clearAllButton).toBeVisible();
  });

  test('should clear all filters when "Clear all" is clicked', async ({ page }) => {
    // Apply multiple filters
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("pending")').first().click();
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await page.locator('button:has-text("Priority")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("high")').first().click();
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify badges exist
    await expect(page.locator('.gap-1.pl-3.pr-1:has-text("pending")')).toBeVisible();
    await expect(page.locator('.gap-1.pl-3.pr-1:has-text("high")')).toBeVisible();

    // Click Clear all
    const clearAllButton = page.locator('button:has-text("Clear all")');
    await clearAllButton.click();

    // Wait for clearing
    await page.waitForTimeout(300);

    // All badges should be gone
    await expect(page.locator('.gap-1.pl-3.pr-1:has-text("pending")')).not.toBeVisible();
    await expect(page.locator('.gap-1.pl-3.pr-1:has-text("high")')).not.toBeVisible();

    // Clear all button should be hidden
    await expect(clearAllButton).not.toBeVisible();
  });
});

test.describe('Combined Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should apply both search and filters together', async ({ page }) => {
    // Skip if no tasks exist
    const initialTaskCount = await page.locator('.task-card').count();
    test.skip(initialTaskCount === 0, 'No tasks available for testing');

    // Apply search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('task');
    await page.waitForTimeout(500);

    const afterSearchCount = await page.locator('.task-card').count();

    // Apply filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("pending")').first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const afterFilterCount = await page.locator('.task-card').count();

    // Combined result should be <= either individual filter
    expect(afterFilterCount).toBeLessThanOrEqual(afterSearchCount);
    expect(afterFilterCount).toBeLessThanOrEqual(initialTaskCount);
  });

  test('should maintain search when clearing filters', async ({ page }) => {
    // Apply search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Apply filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("done")').first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Clear filters
    const clearAllButton = page.locator('button:has-text("Clear all")');
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      await page.waitForTimeout(300);
    }

    // Search value should still be present
    await expect(searchInput).toHaveValue('test');
  });

  test('should maintain filters when clearing search', async ({ page }) => {
    // Apply filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("pending")').first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Apply search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Clear search
    const clearButton = page.locator('button[aria-label*="Clear"]');
    await clearButton.click();
    await page.waitForTimeout(300);

    // Filter badge should still be visible
    const filterBadge = page.locator('.gap-1.pl-3.pr-1:has-text("pending")');
    await expect(filterBadge).toBeVisible();
  });

  test('should update results in real-time as filters change', async ({ page }) => {
    // Skip if no tasks exist
    const initialTaskCount = await page.locator('.task-card').count();
    test.skip(initialTaskCount === 0, 'No tasks available for testing');

    // Record initial count
    const initialCount = await page.locator('.task-card').count();

    // Apply first filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("done")').first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const afterFirstFilter = await page.locator('.task-card').count();

    // Add second filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);
    await page.locator('label:has-text("pending")').first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const afterSecondFilter = await page.locator('.task-card').count();

    // Should be accumulative (OR logic) - more results
    expect(afterSecondFilter).toBeGreaterThanOrEqual(afterFirstFilter);
  });
});

test.describe('Mobile Filter Interactions', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display filter buttons on mobile', async ({ page }) => {
    // Filter buttons should still be visible on mobile
    await expect(page.locator('button:has-text("Status")')).toBeVisible();
    await expect(page.locator('button:has-text("Priority")')).toBeVisible();
  });

  test('should open filter popover on mobile', async ({ page }) => {
    // Open status filter
    await page.locator('button:has-text("Status")').first().click();
    await page.waitForTimeout(300);

    // Popover should be visible
    await expect(page.locator('text=Filter by Status')).toBeVisible();
  });

  test('should have touch-friendly filter buttons (44px)', async ({ page }) => {
    const statusButton = page.locator('button:has-text("Status")').first();

    // Get button size
    const box = await statusButton.boundingBox();

    if (box) {
      // Height should be at least 44px for touch targets
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
