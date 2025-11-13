# End-to-End Tests with Playwright

This directory contains comprehensive E2E tests for the TaskMasterWebIntegration project.

## Test Structure

```
e2e/
├── fixtures/           # Test data fixtures
│   ├── tasks.json     # Mock tasks data
│   └── issues.json    # Mock issues data
├── screenshots/       # Visual regression screenshots (gitignored)
├── tasks.spec.ts      # Task feature tests
├── issues.spec.ts     # Issue feature tests
├── responsive.spec.ts # Responsive layout tests
└── README.md          # This file
```

## Test Coverage

### Tasks Feature (tasks.spec.ts)
- View tasks list with loading states
- Search tasks by title/description
- Filter tasks by status and priority
- Combine search and filters
- Expand tasks to view subtasks
- Show task dependencies
- Handle empty search results
- Handle API errors gracefully

### Issues Feature (issues.spec.ts)
- View issues list in sidebar
- Create new issue with validation
- Edit existing issue
- Delete issue with confirmation
- Filter issues by severity and status
- Search issues
- Link issues to tasks
- Add and display tags
- Handle empty state and errors

### Responsive Behavior (responsive.spec.ts)
- **Mobile (320px-767px)**: Hidden sidebar, toggle button, pull-to-refresh, touch-friendly UI
- **Tablet (768px-1023px)**: Collapsible sidebar with state persistence
- **Desktop (1024px+)**: Split-screen layout (70-30), always-visible sidebar
- **Breakpoint Tests**: Validates rendering at 7 different viewport sizes
- **Orientation Changes**: Tests portrait and landscape modes
- **Zoom Levels**: Tests accessibility at different zoom levels

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (pause on failures)
npm run test:e2e:debug

# Show test report
npm run test:e2e:report

# Run specific test file
npx playwright test e2e/tasks.spec.ts

# Run specific test by name
npx playwright test -g "should display task list"

# Run tests for specific project (browser/device)
npx playwright test --project="Desktop Chrome"
npx playwright test --project="Mobile Chrome"
```

### CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow trigger

See `.github/workflows/playwright.yml` for CI configuration.

## Test Fixtures

Test fixtures provide predictable data for E2E tests:

- **tasks.json**: Contains 5 tasks with various statuses (done, in-progress, pending, blocked) and priorities
- **issues.json**: Contains 5 issues with different severities and statuses, some linked to tasks

Fixtures are mocked via Playwright's `page.route()` API, ensuring tests don't depend on backend state.

## Best Practices

### 1. Use Feature Objects (Not Page Objects)
Tests are organized by user-facing features, not by page structure.

### 2. Resilient Selectors
Tests use semantic selectors:
```typescript
// Good: Semantic roles
page.getByRole('button', { name: /create issue/i })
page.getByLabel(/title/i)

// Good: Test IDs for complex elements
page.locator('[data-testid="task-card"]')

// Avoid: CSS selectors
page.locator('.card-container > div:nth-child(2)') // ❌ Fragile
```

### 3. API Mocking
All tests mock API responses for isolation and speed:
```typescript
await page.route('**/api/tasks', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true, tasks: tasksFixture }),
  });
});
```

### 4. Accessibility Testing
Tests use `getByRole` and ARIA attributes where possible, ensuring accessibility.

### 5. Visual Regression
Responsive tests capture screenshots at different breakpoints for visual comparison.

## Debugging Failed Tests

### 1. View Test Report
```bash
npm run test:e2e:report
```

### 2. Check Screenshots
Failed tests automatically capture screenshots in `test-results/*/screenshot.png`

### 3. Watch Videos
Failed tests record videos in `test-results/*/video.webm`

### 4. Run in Debug Mode
```bash
npm run test:e2e:debug
```

### 5. Use Trace Viewer
```bash
npx playwright show-trace test-results/.../trace.zip
```

## Configuration

See `playwright.config.ts` for:
- Browser configurations
- Viewport sizes
- Retry logic
- Timeout settings
- Reporter settings
- Web server configuration

## CI/CD Artifacts

GitHub Actions uploads:
- HTML test reports (30 days retention)
- Screenshots on failure (7 days retention)
- Videos on failure (7 days retention)

Access artifacts via:
1. GitHub Actions run page
2. "Artifacts" section at bottom of run

## Adding New Tests

1. Create test file in `e2e/` directory
2. Import test fixtures
3. Mock API routes in `beforeEach`
4. Write tests using Arrange-Act-Assert pattern
5. Use semantic selectors (`getByRole`, `getByLabel`, `getByText`)
6. Add test IDs to components if needed: `data-testid="component-name"`

Example:
```typescript
import { test, expect } from '@playwright/test';
import myFixture from './fixtures/my-data.json';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock APIs
    await page.route('**/api/my-endpoint', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(myFixture),
      });
    });

    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange: Set up test state (already done in beforeEach)

    // Act: Perform user action
    await page.getByRole('button', { name: /click me/i }).click();

    // Assert: Verify outcome
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

## Troubleshooting

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check if dev server is starting properly
- Verify API mocks are working

### Flaky tests
- Use `waitForSelector` instead of `waitForTimeout`
- Check for race conditions in async operations
- Ensure API mocks are properly set up

### Screenshots not matching
- Viewport size differences
- Font rendering differences between OS
- Animation timing issues (disable animations in test mode)

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
- [CI/CD Integration](https://playwright.dev/docs/ci)
