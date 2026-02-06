import { test, expect } from '@playwright/test';

test.describe('Mission Lifecycle', () => {
  test('should create, complete, and delete a mission', async ({ page }) => {
    // 1. Infiltrate (Load Page)
    await page.goto('/');

    // 2. Acquire Target (Add Todo)
    const input = page.getByPlaceholder('Add a new mission...');
    await expect(input).toBeVisible();
    await input.fill('Operation E2E Shield');
    await input.press('Enter');

    // 3. Confirm Target Acquisition (Verify in List)
    const todoItem = page.locator('app-todo-item').filter({ hasText: 'Operation E2E Shield' });
    await expect(todoItem).toBeVisible();

    // 4. Execute Mission (Mark Complete)
    const checkbox = todoItem.locator('.custom-checkbox');
    await checkbox.click();

    // Verify completion status (visual check on class)
    await expect(checkbox).toHaveClass(/checked/);
    const content = todoItem.locator('.todo-content');
    await expect(content).toHaveClass(/completed/);

    // 5. Clean Up (Delete)
    const deleteBtn = todoItem.locator('.delete-btn');
    await deleteBtn.click();

    // 6. Confirm Neutralization (Verify Gone)
    await expect(todoItem).not.toBeVisible();
  });

  test('should display empty state initially or after clearing', async ({ page }) => {
    await page.goto('/');

    // Check if we have items, if so delete them all (cleanup)
    const items = page.locator('app-todo-item');
    const count = await items.count();

    for (let i = 0; i < count; ++i) {
       await items.first().locator('.delete-btn').click();
       await page.waitForTimeout(200); // Wait for optimistic UI
    }

    // Verify Empty State
    await expect(page.getByText('All caught up!')).toBeVisible();
    await expect(page.getByText('Your mission log is empty.')).toBeVisible();
  });
});
