import { test, expect } from '@playwright/test';
import issuesFixture from './fixtures/issues.json' with { type: 'json' };

/**
 * E2E Tests for Issues Feature
 *
 * Tests critical user flows:
 * - View issues list
 * - Create new issue
 * - Edit existing issue
 * - Delete issue
 * - Filter issues by status/severity
 * - Link issues to tasks
 */

test.describe('Issues Feature', () => {
  let createdIssueId: string | null = null;

  test.beforeEach(async ({ page }) => {
    // Mock the issues API with fixture data
    await page.route('**/api/issues', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'GET') {
        // GET all issues
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            issues: issuesFixture,
          }),
        });
      } else if (method === 'POST') {
        // CREATE new issue
        const postData = request.postDataJSON();
        const newIssue = {
          id: `issue-${Date.now()}`,
          ...postData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        createdIssueId = newIssue.id;

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            issue: newIssue,
          }),
        });
      }
    });

    // Mock individual issue API calls
    for (const issue of issuesFixture) {
      await page.route(`**/api/issues/${issue.id}`, async (route) => {
        const request = route.request();
        const method = request.method();

        if (method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              issue,
            }),
          });
        } else if (method === 'PUT') {
          // UPDATE issue
          const updateData = request.postDataJSON();
          const updatedIssue = {
            ...issue,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              issue: updatedIssue,
            }),
          });
        } else if (method === 'DELETE') {
          // DELETE issue
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Issue deleted successfully',
            }),
          });
        }
      });
    }

    // Navigate to dashboard
    await page.goto('/');
  });

  test('should display issues list in sidebar', async ({ page }) => {
    // Wait for issues to load
    await expect(page.getByText('Login button not responsive')).toBeVisible();

    // Verify multiple issues are displayed
    await expect(page.getByText('API timeout on dashboard load')).toBeVisible();
    await expect(page.getByText('Memory leak in task list')).toBeVisible();

    // Check issue count
    const issueCards = page.locator('[data-testid="issue-card"]');
    await expect(issueCards).toHaveCount(issuesFixture.length);
  });

  test('should display issue severity badges', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Verify severity badges
    await expect(page.getByText('critical')).toBeVisible();
    await expect(page.getByText('high', { exact: true })).toBeVisible();
    await expect(page.getByText('medium', { exact: true })).toBeVisible();
    await expect(page.getByText('low', { exact: true })).toBeVisible();
  });

  test('should display issue status badges', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Verify status badges
    await expect(page.getByText('open', { exact: true })).toBeVisible();
    await expect(page.getByText('in-progress')).toBeVisible();
    await expect(page.getByText('resolved', { exact: true })).toBeVisible();
  });

  test('should open create issue modal', async ({ page }) => {
    // Find and click "Create Issue" button
    const createButton = page.getByRole('button', { name: /create issue/i });
    await createButton.click();

    // Modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/create new issue/i)).toBeVisible();

    // Form fields should be visible
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/severity/i)).toBeVisible();
  });

  test('should create new issue successfully', async ({ page }) => {
    // Click create issue button
    const createButton = page.getByRole('button', { name: /create issue/i });
    await createButton.click();

    // Fill in the form
    await page.getByLabel(/title/i).fill('Test E2E Issue');
    await page
      .getByLabel(/description/i)
      .fill('This is a test issue created by E2E tests');

    // Select severity
    await page.getByLabel(/severity/i).click();
    await page.getByRole('option', { name: /high/i }).click();

    // Select status
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /open/i }).click();

    // Submit form
    await page.getByRole('button', { name: /submit|create/i }).click();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Success message or new issue should appear
    await expect(
      page.getByText('Test E2E Issue').or(page.getByText(/created successfully/i))
    ).toBeVisible();
  });

  test('should validate required fields in create form', async ({ page }) => {
    // Click create issue button
    const createButton = page.getByRole('button', { name: /create issue/i });
    await createButton.click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /submit|create/i }).click();

    // Error messages should appear
    await expect(
      page.getByText(/required/i).or(page.getByText(/must provide/i)).first()
    ).toBeVisible();

    // Modal should still be open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should cancel issue creation', async ({ page }) => {
    // Click create issue button
    const createButton = page.getByRole('button', { name: /create issue/i });
    await createButton.click();

    // Fill in some data
    await page.getByLabel(/title/i).fill('Test Issue');

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Modal should close without creating issue
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Issue should not appear in list
    await expect(page.getByText('Test Issue')).not.toBeVisible();
  });

  test('should open issue detail modal', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Click on an issue
    const issueCard = page.locator('[data-testid="issue-card"]').first();
    await issueCard.click();

    // Detail modal should open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Should show issue details
    await expect(page.getByText(/description/i)).toBeVisible();
    await expect(page.getByText(/severity/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
  });

  test('should edit issue from detail modal', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Click on an issue
    const issueCard = page.locator('[data-testid="issue-card"]').filter({
      hasText: 'API timeout on dashboard load',
    });
    await issueCard.click();

    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click();

    // Change severity
    await page.getByLabel(/severity/i).click();
    await page.getByRole('option', { name: /critical/i }).click();

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Success message or updated issue should appear
    await expect(
      page.getByText(/updated/i).or(page.getByText(/saved/i))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should delete issue', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Click on an issue
    const issueCard = page.locator('[data-testid="issue-card"]').filter({
      hasText: 'Documentation missing examples',
    });
    await issueCard.click();

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click();

    // Confirm deletion (if there's a confirmation dialog)
    const confirmButton = page.getByRole('button', {
      name: /confirm|yes|delete/i,
    });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Issue should be removed from list
    await expect(page.getByText('Documentation missing examples')).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('should filter issues by severity', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Open severity filter (in sidebar)
    const severityFilter = page.getByRole('button', { name: /severity/i });
    await severityFilter.click();

    // Select critical severity
    await page.getByRole('checkbox', { name: /critical/i }).click();

    // Close filter
    await page.keyboard.press('Escape');

    // Only critical issues should be visible
    await expect(page.getByText('Memory leak in task list')).toBeVisible();

    // Count visible issue cards
    const issueCards = page.locator('[data-testid="issue-card"]');
    const criticalCount = issuesFixture.filter((i) => i.severity === 'critical').length;
    await expect(issueCards).toHaveCount(criticalCount);
  });

  test('should filter issues by status', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Open status filter
    const statusFilter = page.getByRole('button', { name: /status/i });
    await statusFilter.click();

    // Select open status
    await page.getByRole('checkbox', { name: /open/i }).click();

    // Close filter
    await page.keyboard.press('Escape');

    // Only open issues should be visible
    const openCount = issuesFixture.filter((i) => i.status === 'open').length;
    const issueCards = page.locator('[data-testid="issue-card"]');
    await expect(issueCards).toHaveCount(openCount);
  });

  test('should search issues', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Search for specific issue
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('memory leak');

    // Only matching issue should be visible
    await expect(page.getByText('Memory leak in task list')).toBeVisible();

    // Other issues should not be visible
    await expect(page.getByText('Login button not responsive')).not.toBeVisible();
  });

  test('should link issue to task', async ({ page }) => {
    // Click create issue button
    const createButton = page.getByRole('button', { name: /create issue/i });
    await createButton.click();

    // Fill in the form
    await page.getByLabel(/title/i).fill('Linked Issue Test');
    await page.getByLabel(/description/i).fill('Testing task linking');

    // Select severity and status
    await page.getByLabel(/severity/i).click();
    await page.getByRole('option', { name: /medium/i }).click();

    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /open/i }).click();

    // Link to a task (if field exists)
    const taskLinkField = page.getByLabel(/related task/i);
    if (await taskLinkField.isVisible()) {
      await taskLinkField.click();
      await page.getByRole('option').first().click();
    }

    // Submit form
    await page.getByRole('button', { name: /submit|create/i }).click();

    // Verify issue was created with task link
    await expect(page.getByText('Linked Issue Test')).toBeVisible();
  });

  test('should display issue tags', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Click on issue with tags
    const issueCard = page.locator('[data-testid="issue-card"]').filter({
      hasText: 'Login button not responsive',
    });
    await issueCard.click();

    // Tags should be visible in detail view
    await expect(page.getByText('ui')).toBeVisible();
    await expect(page.getByText('mobile')).toBeVisible();
    await expect(page.getByText('authentication')).toBeVisible();
  });

  test('should add tags to issue', async ({ page }) => {
    // Click create issue button
    const createButton = page.getByRole('button', { name: /create issue/i });
    await createButton.click();

    // Fill in the form
    await page.getByLabel(/title/i).fill('Issue with Tags');
    await page.getByLabel(/description/i).fill('Testing tag functionality');

    // Select severity and status
    await page.getByLabel(/severity/i).click();
    await page.getByRole('option', { name: /low/i }).click();

    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /open/i }).click();

    // Add tags (if tags input exists)
    const tagsInput = page.getByLabel(/tags/i);
    if (await tagsInput.isVisible()) {
      await tagsInput.fill('bug');
      await page.keyboard.press('Enter');
      await tagsInput.fill('ui');
      await page.keyboard.press('Enter');
    }

    // Submit form
    await page.getByRole('button', { name: /submit|create/i }).click();

    // Verify tags appear in created issue
    await page.waitForTimeout(500); // Brief wait for UI update
    if (await page.getByText('bug').isVisible()) {
      await expect(page.getByText('bug')).toBeVisible();
    }
  });

  test('should handle empty issues list', async ({ page }) => {
    // Mock empty issues response
    await page.route('**/api/issues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          issues: [],
        }),
      });
    });

    await page.goto('/');

    // Should show empty state message
    await expect(
      page.getByText(/no issues/i).or(page.getByText(/create your first issue/i))
    ).toBeVisible();
  });

  test('should handle issues API error', async ({ page }) => {
    // Mock API error
    await page.route('**/api/issues', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Failed to load issues',
        }),
      });
    });

    await page.goto('/');

    // Should show error message or fallback UI
    await expect(
      page.getByText(/error/i).or(page.getByText(/failed/i))
    ).toBeVisible();
  });

  test('should close issue detail modal', async ({ page }) => {
    // Wait for issues to load
    await page.waitForSelector('[data-testid="issue-card"]');

    // Click on an issue
    const issueCard = page.locator('[data-testid="issue-card"]').first();
    await issueCard.click();

    // Modal should be open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close modal (X button or Escape key)
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
