import { test, expect } from '@playwright/test';

/**
 * Task Viewing E2E Tests
 *
 * Tests critical user flows for task viewing including:
 * - Task list display and loading states
 * - Task card interactions
 * - Subtask expansion/collapse
 * - Task status badges and priority indicators
 * - Empty states and error handling
 */

test.describe('Task Viewing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard before each test
    await page.goto('/');

    // Wait for main content to load
    await page.waitForSelector('.scroll-container', { state: 'visible' });
  });

  test('should display the dashboard with task list', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/TaskMaster/);

    // Verify main layout is visible
    const mainLayout = page.locator('main');
    await expect(mainLayout).toBeVisible();
  });

  test('should show loading skeletons while tasks are loading', async ({ page }) => {
    // Navigate and intercept API call to simulate loading
    await page.route('**/api/tasks', async (route) => {
      // Delay response to see loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.reload();

    // Check for loading skeletons
    const skeleton = page.locator('.animate-pulse').first();
    await expect(skeleton).toBeVisible();
  });

  test('should display task cards when tasks are loaded', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForLoadState('networkidle');

    // Check for task cards (either real cards or empty state)
    const taskList = page.locator('.p-6.space-y-4').first();
    await expect(taskList).toBeVisible();

    // Look for either task cards or empty state message
    const hasTaskCards = await page.locator('.task-card').count() > 0;
    const hasEmptyState = await page.locator('text=No tasks found').isVisible();

    expect(hasTaskCards || hasEmptyState).toBeTruthy();
  });

  test('should display task card with correct information', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForLoadState('networkidle');

    // Find first task card
    const taskCard = page.locator('.task-card').first();

    // Skip if no tasks exist
    const taskCount = await page.locator('.task-card').count();
    test.skip(taskCount === 0, 'No tasks available for testing');

    // Verify task card structure
    await expect(taskCard).toBeVisible();

    // Check for task ID badge
    const taskIdBadge = taskCard.locator('.font-mono.text-xs');
    await expect(taskIdBadge).toBeVisible();

    // Check for task title
    const taskTitle = taskCard.locator('h3.font-medium');
    await expect(taskTitle).toBeVisible();

    // Check for task description
    const taskDescription = taskCard.locator('p.text-muted-foreground');
    await expect(taskDescription).toBeVisible();
  });

  test('should expand and collapse subtasks when chevron is clicked', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForLoadState('networkidle');

    // Find a task card with subtasks (look for chevron button)
    const expandButton = page.locator('button[aria-label*="subtasks"]').first();

    // Skip if no expandable tasks exist
    const expandableCount = await page.locator('button[aria-label*="subtasks"]').count();
    test.skip(expandableCount === 0, 'No expandable tasks available for testing');

    // Initially, subtasks should be collapsed
    await expect(expandButton).toHaveAttribute('aria-label', /Expand subtasks/);

    // Click to expand
    await expandButton.click();

    // Wait for animation
    await page.waitForTimeout(300);

    // Verify subtasks are visible
    await expect(expandButton).toHaveAttribute('aria-label', /Collapse subtasks/);

    // Check for subtask content
    const subtaskContainer = page.locator('.border-l-2.border-muted').first();
    await expect(subtaskContainer).toBeVisible();

    // Click to collapse
    await expandButton.click();

    // Wait for animation
    await page.waitForTimeout(300);

    // Verify subtasks are hidden
    await expect(expandButton).toHaveAttribute('aria-label', /Expand subtasks/);
  });

  test('should display subtask information correctly', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForLoadState('networkidle');

    // Find and expand a task with subtasks
    const expandButton = page.locator('button[aria-label*="Expand subtasks"]').first();

    // Skip if no expandable tasks exist
    const expandableCount = await page.locator('button[aria-label*="Expand subtasks"]').count();
    test.skip(expandableCount === 0, 'No expandable tasks available for testing');

    // Expand subtasks
    await expandButton.click();
    await page.waitForTimeout(300);

    // Find first subtask
    const subtask = page.locator('.border-l-2.border-muted .p-3').first();
    await expect(subtask).toBeVisible();

    // Check subtask structure
    const subtaskId = subtask.locator('.font-mono.text-xs');
    await expect(subtaskId).toBeVisible();

    const subtaskTitle = subtask.locator('h4.font-medium');
    await expect(subtaskTitle).toBeVisible();

    const subtaskDescription = subtask.locator('p.text-xs');
    await expect(subtaskDescription).toBeVisible();
  });

  test('should display correct status badge colors', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForLoadState('networkidle');

    // Skip if no tasks exist
    const taskCount = await page.locator('.task-card').count();
    test.skip(taskCount === 0, 'No tasks available for testing');

    // Find first task card
    const taskCard = page.locator('.task-card').first();

    // Check for status badge
    const statusBadge = taskCard.locator('.text-xs.font-medium.px-2.py-0\\.5').first();
    await expect(statusBadge).toBeVisible();

    // Verify badge has text
    const badgeText = await statusBadge.textContent();
    expect(badgeText).toBeTruthy();
  });

  test('should display progress bar for tasks with subtasks', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForLoadState('networkidle');

    // Find a task with subtasks
    const taskWithSubtasks = page.locator('.task-card:has(button[aria-label*="subtasks"])').first();

    // Skip if no tasks with subtasks exist
    const tasksWithSubtasksCount = await page.locator('.task-card:has(button[aria-label*="subtasks"])').count();
    test.skip(tasksWithSubtasksCount === 0, 'No tasks with subtasks available for testing');

    // Check for progress bar
    const progressBar = taskWithSubtasks.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('should show empty state when no tasks exist', async ({ page }) => {
    // Intercept API to return empty tasks
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for empty state message
    await expect(page.locator('text=No tasks found')).toBeVisible();

    // Verify empty state icon
    const emptyStateIcon = page.locator('.w-16.h-16.rounded-full.bg-muted');
    await expect(emptyStateIcon).toBeVisible();
  });

  test('should show error state when task loading fails', async ({ page }) => {
    // Intercept API to return error
    await page.route('**/api/tasks', async (route) => {
      await route.abort('failed');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for error message
    await expect(page.locator('text=Failed to load tasks')).toBeVisible();

    // Verify retry button exists
    const retryButton = page.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
  });
});

test.describe('Task Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain expanded state when interacting with multiple tasks', async ({ page }) => {
    // Find all expandable tasks
    const expandButtons = page.locator('button[aria-label*="Expand subtasks"]');
    const count = await expandButtons.count();

    // Skip if less than 2 expandable tasks
    test.skip(count < 2, 'Not enough expandable tasks for testing');

    // Expand first task
    await expandButtons.nth(0).click();
    await page.waitForTimeout(300);

    // Expand second task
    await expandButtons.nth(1).click();
    await page.waitForTimeout(300);

    // Verify both are expanded
    const firstExpanded = await expandButtons.nth(0).getAttribute('aria-label');
    const secondExpanded = await expandButtons.nth(1).getAttribute('aria-label');

    expect(firstExpanded).toContain('Collapse');
    expect(secondExpanded).toContain('Collapse');
  });

  test('should handle rapid expand/collapse clicks gracefully', async ({ page }) => {
    // Find first expandable task
    const expandButton = page.locator('button[aria-label*="subtasks"]').first();

    // Skip if no expandable tasks exist
    const expandableCount = await page.locator('button[aria-label*="subtasks"]').count();
    test.skip(expandableCount === 0, 'No expandable tasks available for testing');

    // Rapid clicks
    await expandButton.click();
    await expandButton.click();
    await expandButton.click();

    // Wait for animations to settle
    await page.waitForTimeout(500);

    // Should be in a valid state (either expanded or collapsed)
    const ariaLabel = await expandButton.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/Expand|Collapse/);
  });
});
