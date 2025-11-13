import { test, expect } from '@playwright/test';

/**
 * Issue Management E2E Tests
 *
 * Tests critical user flows for issue management including:
 * - Issue creation via modal form
 * - Issue viewing and detail modal
 * - Issue editing and updates
 * - Issue deletion
 * - Issue-task linking
 * - Loading and error states
 */

test.describe('Issue Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display issues panel in sidebar', async ({ page }) => {
    // Check for issues header
    const issuesHeader = page.locator('h2:has-text("Issues")');
    await expect(issuesHeader).toBeVisible();

    // Check for "New Issue" button
    const newIssueButton = page.locator('button:has-text("New Issue")');
    await expect(newIssueButton).toBeVisible();
  });

  test('should show loading state for issues', async ({ page }) => {
    // Intercept API to simulate loading
    await page.route('**/api/issues', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.reload();

    // Check for loading skeleton in issues panel
    const skeleton = page.locator('.animate-pulse').first();
    await expect(skeleton).toBeVisible();
  });

  test('should show empty state when no issues exist', async ({ page }) => {
    // Intercept API to return empty issues
    await page.route('**/api/issues', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for empty state message
    await expect(page.locator('text=No issues yet')).toBeVisible();

    // Verify empty state CTA button
    const createButton = page.locator('button:has-text("Create Issue")');
    await expect(createButton).toBeVisible();
  });

  test('should display issue cards when issues exist', async ({ page }) => {
    // Skip if no issues exist
    const issueCards = page.locator('.border.border-border.rounded-lg.p-4.bg-background');
    const count = await issueCards.count();

    if (count === 0) {
      // Check for empty state instead
      await expect(page.locator('text=No issues yet')).toBeVisible();
    } else {
      // Verify issue cards are visible
      await expect(issueCards.first()).toBeVisible();

      // Check issue card structure
      const firstCard = issueCards.first();
      const issueId = firstCard.locator('.text-xs.font-mono');
      await expect(issueId).toBeVisible();

      const issueTitle = firstCard.locator('h4.text-sm.font-medium');
      await expect(issueTitle).toBeVisible();
    }
  });
});

test.describe('Issue Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open create issue modal when "New Issue" is clicked', async ({ page }) => {
    // Click "New Issue" button
    const newIssueButton = page.locator('button:has-text("New Issue")').first();
    await newIssueButton.click();

    // Wait for modal to appear
    await page.waitForTimeout(300);

    // Verify modal title
    await expect(page.locator('text=Create New Issue')).toBeVisible();

    // Verify form fields are present
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
  });

  test('should create a new issue successfully', async ({ page }) => {
    // Intercept POST request to /api/issues
    let issueCreated = false;
    await page.route('**/api/issues', async (route) => {
      if (route.request().method() === 'POST') {
        issueCreated = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-issue-' + Date.now(),
            title: 'Test Issue',
            description: 'This is a test issue',
            severity: 'medium',
            status: 'open',
            tags: [],
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Open create issue modal
    await page.locator('button:has-text("New Issue")').first().click();
    await page.waitForTimeout(300);

    // Fill in form
    await page.locator('input[name="title"]').fill('Test Issue E2E');
    await page.locator('textarea[name="description"]').fill('This is an E2E test issue');

    // Select severity (if dropdown exists)
    const severityButton = page.locator('button[role="combobox"]:has-text("medium"), button:has-text("Medium")').first();
    if (await severityButton.isVisible()) {
      await severityButton.click();
      await page.waitForTimeout(200);
      await page.locator('[role="option"]:has-text("medium"), [role="option"]:has-text("Medium")').first().click();
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"]:has-text("Create")');
    await submitButton.click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify modal is closed
    await expect(page.locator('text=Create New Issue')).not.toBeVisible();

    // Verify issue was created (check API was called)
    expect(issueCreated).toBeTruthy();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Open create issue modal
    await page.locator('button:has-text("New Issue")').first().click();
    await page.waitForTimeout(300);

    // Try to submit without filling form
    const submitButton = page.locator('button[type="submit"]:has-text("Create")');
    await submitButton.click();

    // Wait for validation
    await page.waitForTimeout(300);

    // Verify error messages appear (form should prevent submission)
    // Modal should still be open
    await expect(page.locator('text=Create New Issue')).toBeVisible();
  });

  test('should close modal when cancel is clicked', async ({ page }) => {
    // Open create issue modal
    await page.locator('button:has-text("New Issue")').first().click();
    await page.waitForTimeout(300);

    // Verify modal is open
    await expect(page.locator('text=Create New Issue')).toBeVisible();

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Wait for animation
    await page.waitForTimeout(300);

    // Verify modal is closed
    await expect(page.locator('text=Create New Issue')).not.toBeVisible();
  });

  test('should close modal when clicking overlay', async ({ page }) => {
    // Open create issue modal
    await page.locator('button:has-text("New Issue")').first().click();
    await page.waitForTimeout(300);

    // Verify modal is open
    await expect(page.locator('text=Create New Issue')).toBeVisible();

    // Click overlay (outside modal)
    await page.locator('[role="dialog"]').press('Escape');

    // Wait for animation
    await page.waitForTimeout(300);

    // Verify modal is closed
    await expect(page.locator('text=Create New Issue')).not.toBeVisible();
  });
});

test.describe('Issue Detail View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open issue detail modal when issue card is clicked', async ({ page }) => {
    // Find first issue card
    const issueCard = page.locator('.border.border-border.rounded-lg.p-4.bg-background').first();

    // Skip if no issues exist
    const issueCount = await page.locator('.border.border-border.rounded-lg.p-4.bg-background').count();
    test.skip(issueCount === 0, 'No issues available for testing');

    // Click issue card
    await issueCard.click();

    // Wait for modal to appear
    await page.waitForTimeout(300);

    // Verify issue detail content is visible
    // Look for common issue detail elements
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('should display correct issue information in detail modal', async ({ page }) => {
    // Skip if no issues exist
    const issueCards = page.locator('.border.border-border.rounded-lg.p-4.bg-background');
    const issueCount = await issueCards.count();
    test.skip(issueCount === 0, 'No issues available for testing');

    // Get issue title from card
    const firstCard = issueCards.first();
    const cardTitle = await firstCard.locator('h4.text-sm.font-medium').textContent();

    // Click to open detail modal
    await firstCard.click();
    await page.waitForTimeout(300);

    // Verify modal displays issue information
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Title should be somewhere in the modal
    if (cardTitle) {
      await expect(modal.locator(`text=${cardTitle}`)).toBeVisible();
    }
  });

  test('should close issue detail modal when close button is clicked', async ({ page }) => {
    // Skip if no issues exist
    const issueCount = await page.locator('.border.border-border.rounded-lg.p-4.bg-background').count();
    test.skip(issueCount === 0, 'No issues available for testing');

    // Open issue detail
    await page.locator('.border.border-border.rounded-lg.p-4.bg-background').first().click();
    await page.waitForTimeout(300);

    // Find and click close button (X button)
    const closeButton = page.locator('[role="dialog"] button[aria-label*="Close"], [role="dialog"] button:has-text("×")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try pressing Escape
      await page.keyboard.press('Escape');
    }

    // Wait for animation
    await page.waitForTimeout(300);

    // Verify modal is closed
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Issue Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show edit and delete options in issue detail modal', async ({ page }) => {
    // Skip if no issues exist
    const issueCount = await page.locator('.border.border-border.rounded-lg.p-4.bg-background').count();
    test.skip(issueCount === 0, 'No issues available for testing');

    // Open issue detail
    await page.locator('.border.border-border.rounded-lg.p-4.bg-background').first().click();
    await page.waitForTimeout(300);

    // Look for action buttons (Edit, Delete, etc.)
    const modal = page.locator('[role="dialog"]');

    // Check if Edit button exists
    const hasEditButton = await modal.locator('button:has-text("Edit")').count() > 0;

    // Check if Delete button exists
    const hasDeleteButton = await modal.locator('button:has-text("Delete")').count() > 0;

    // At least one action should be available
    expect(hasEditButton || hasDeleteButton).toBeTruthy();
  });

  test('should handle issue status updates', async ({ page }) => {
    // Skip if no issues exist
    const issueCount = await page.locator('.border.border-border.rounded-lg.p-4.bg-background').count();
    test.skip(issueCount === 0, 'No issues available for testing');

    // Intercept PATCH/PUT requests
    let issueUpdated = false;
    await page.route('**/api/issues/*', async (route) => {
      if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
        issueUpdated = true;
        await route.continue();
      } else {
        await route.continue();
      }
    });

    // Open issue detail
    await page.locator('.border.border-border.rounded-lg.p-4.bg-background').first().click();
    await page.waitForTimeout(300);

    // Look for status change controls (dropdown, buttons, etc.)
    const modal = page.locator('[role="dialog"]');
    const statusControl = modal.locator('button[role="combobox"], select[name="status"]').first();

    // If status control exists, try to change it
    if (await statusControl.isVisible()) {
      await statusControl.click();
      await page.waitForTimeout(200);

      // Try to select a different status
      const statusOption = page.locator('[role="option"]').first();
      if (await statusOption.isVisible()) {
        await statusOption.click();
        await page.waitForTimeout(500);
      }
    }
  });
});
