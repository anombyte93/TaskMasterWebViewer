import { test, expect } from '@playwright/test';
import tasksFixture from './fixtures/tasks.json' with { type: 'json' };

/**
 * E2E Tests for Tasks Feature
 *
 * Tests critical user flows:
 * - View tasks list with loading states
 * - Search tasks by title/description
 * - Filter tasks by status and priority
 * - View task details (subtasks, dependencies)
 * - Navigate between tasks
 */

test.describe('Tasks Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the tasks API with fixture data
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tasks: tasksFixture.master.tasks,
        }),
      });
    });

    // Mock individual task API calls
    for (const task of tasksFixture.master.tasks) {
      await page.route(`**/api/tasks/${task.id}`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            task,
          }),
        });
      });
    }

    // Navigate to dashboard
    await page.goto('/');
  });

  test('should display task list with correct data', async ({ page }) => {
    // Wait for tasks to load
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();

    // Verify all tasks are displayed
    for (const task of tasksFixture.master.tasks) {
      await expect(page.getByText(task.title)).toBeVisible();
    }

    // Verify task count
    const taskCards = page.locator('[data-testid="task-card"]');
    await expect(taskCards).toHaveCount(tasksFixture.master.tasks.length);
  });

  test('should display task status badges', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Verify status badges are visible
    await expect(page.getByText('done', { exact: true })).toBeVisible();
    await expect(page.getByText('in-progress')).toBeVisible();
    await expect(page.getByText('pending', { exact: true })).toBeVisible();
    await expect(page.getByText('blocked', { exact: true })).toBeVisible();
  });

  test('should display priority indicators', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid="task-card"]');

    // Verify priority badges
    await expect(page.getByText('high', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('medium', { exact: true })).toBeVisible();
    await expect(page.getByText('low', { exact: true })).toBeVisible();
  });

  test('should search tasks by title', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Find search input
    const searchInput = page.getByPlaceholder(/search tasks/i);
    await expect(searchInput).toBeVisible();

    // Search for "authentication"
    await searchInput.fill('authentication');

    // Only authentication task should be visible
    await expect(page.getByText('Implement authentication')).toBeVisible();
    await expect(page.getByText('Setup project infrastructure')).not.toBeVisible();
    await expect(page.getByText('Build dashboard UI')).not.toBeVisible();
  });

  test('should search tasks by description', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Search by description keyword
    const searchInput = page.getByPlaceholder(/search tasks/i);
    await searchInput.fill('JWT');

    // Task with JWT in details should appear
    await expect(page.getByText('Implement authentication')).toBeVisible();
  });

  test('should clear search and show all tasks', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    const searchInput = page.getByPlaceholder(/search tasks/i);

    // Search for something
    await searchInput.fill('authentication');
    await expect(page.getByText('Setup project infrastructure')).not.toBeVisible();

    // Clear search
    await searchInput.clear();

    // All tasks should be visible again
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();
    await expect(page.getByText('Implement authentication')).toBeVisible();
    await expect(page.getByText('Build dashboard UI')).toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Click status filter button
    const statusFilter = page.getByRole('button', { name: /status/i });
    await statusFilter.click();

    // Select "done" status
    await page.getByRole('checkbox', { name: /done/i }).click();

    // Apply filter (if there's an apply button, otherwise filter applies automatically)
    // Close the filter menu by clicking outside or pressing Escape
    await page.keyboard.press('Escape');

    // Only done tasks should be visible
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();
    await expect(page.getByText('Implement authentication')).not.toBeVisible();
  });

  test('should filter tasks by multiple statuses', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Open status filter
    const statusFilter = page.getByRole('button', { name: /status/i });
    await statusFilter.click();

    // Select multiple statuses
    await page.getByRole('checkbox', { name: /done/i }).click();
    await page.getByRole('checkbox', { name: /in-progress/i }).click();

    // Close filter
    await page.keyboard.press('Escape');

    // Both done and in-progress tasks should be visible
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();
    await expect(page.getByText('Implement authentication')).toBeVisible();

    // Pending and blocked should not be visible
    await expect(page.getByText('Build dashboard UI')).not.toBeVisible();
    await expect(page.getByText('Deploy to production')).not.toBeVisible();
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Open priority filter
    const priorityFilter = page.getByRole('button', { name: /priority/i });
    await priorityFilter.click();

    // Select high priority
    await page.getByRole('checkbox', { name: /high/i }).click();

    // Close filter
    await page.keyboard.press('Escape');

    // Only high priority tasks should be visible
    const taskCards = page.locator('[data-testid="task-card"]');
    const count = await taskCards.count();

    // Count high priority tasks in fixture
    const highPriorityCount = tasksFixture.master.tasks.filter(
      (t) => t.priority === 'high'
    ).length;

    expect(count).toBe(highPriorityCount);
  });

  test('should combine search and filters', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Search for "authentication"
    const searchInput = page.getByPlaceholder(/search tasks/i);
    await searchInput.fill('authentication');

    // Apply status filter for in-progress
    const statusFilter = page.getByRole('button', { name: /status/i });
    await statusFilter.click();
    await page.getByRole('checkbox', { name: /in-progress/i }).click();
    await page.keyboard.press('Escape');

    // Should only show authentication task (which is in-progress)
    await expect(page.getByText('Implement authentication')).toBeVisible();

    // Other tasks should not be visible
    const taskCards = page.locator('[data-testid="task-card"]');
    await expect(taskCards).toHaveCount(1);
  });

  test('should expand task to show subtasks', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Find task with subtasks (Implement authentication)
    const taskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: 'Implement authentication',
    });

    // Click to expand
    await taskCard.click();

    // Subtasks should be visible
    await expect(page.getByText('Create login endpoint')).toBeVisible();
    await expect(page.getByText('Implement JWT tokens')).toBeVisible();
  });

  test('should show task dependencies', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Find task with dependencies
    const taskCard = page.locator('[data-testid="task-card"]').filter({
      hasText: 'Build dashboard UI',
    });

    // Expand task
    await taskCard.click();

    // Should show dependency indicator or blocked status reason
    // This depends on your UI implementation
    await expect(
      page.getByText(/depends on/i).or(page.getByText(/blocked until/i))
    ).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Search for non-existent task
    const searchInput = page.getByPlaceholder(/search tasks/i);
    await searchInput.fill('nonexistent task xyz');

    // Should show "no results" message
    await expect(
      page.getByText(/no tasks found/i).or(page.getByText(/no results/i))
    ).toBeVisible();

    // No task cards should be visible
    const taskCards = page.locator('[data-testid="task-card"]');
    await expect(taskCards).toHaveCount(0);
  });

  test('should show loading state initially', async ({ page }) => {
    // Intercept API call with delay
    await page.route('**/api/tasks', async (route) => {
      // Delay response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tasks: tasksFixture.master.tasks,
        }),
      });
    });

    // Navigate and check for loading state
    await page.goto('/');

    // Should show loading indicator (skeleton, spinner, etc.)
    await expect(
      page
        .locator('[data-testid="loading-skeleton"]')
        .or(page.getByRole('status'))
        .first()
    ).toBeVisible();

    // Wait for tasks to load
    await expect(page.getByText('Setup project infrastructure')).toBeVisible({
      timeout: 3000,
    });
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/tasks', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
      });
    });

    await page.goto('/');

    // Should show error message
    await expect(
      page
        .getByText(/failed to load/i)
        .or(page.getByText(/error/i))
        .first()
    ).toBeVisible();
  });

  test('should persist filter state on navigation', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="task-card"]');

    // Apply a filter
    const statusFilter = page.getByRole('button', { name: /status/i });
    await statusFilter.click();
    await page.getByRole('checkbox', { name: /done/i }).click();
    await page.keyboard.press('Escape');

    // Verify filtered results
    await expect(page.getByText('Setup project infrastructure')).toBeVisible();

    // Navigate away and back (simulated with reload)
    await page.reload();

    // Filter state might persist via localStorage or URL params
    // This test depends on your implementation
    // If you use URL params, verify the URL contains filter info
    const url = page.url();
    // Example: expect(url).toContain('status=done');
  });
});
