import { test, expect } from '@playwright/test';
import { MissionControlPage } from './pages/mission-control.page';

test.describe('Mission Lifecycle', () => {
  let missionPage: MissionControlPage;

  test.beforeEach(async ({ page }) => {
    missionPage = new MissionControlPage(page);
    await missionPage.goto();
  });

  test('should execute full mission lifecycle: Create -> Complete -> Delete', async ({ page }) => {
    const missionName = 'Operation Red Wing ' + Date.now();

    // 1. Acquire Target (Create)
    await missionPage.addMission(missionName);
    await missionPage.verifyMissionExists(missionName);

    // 2. Execute Mission (Complete)
    await missionPage.completeMission(missionName);
    await missionPage.verifyMissionCompleted(missionName);

    // 3. Clean Up (Delete)
    await missionPage.deleteMission(missionName);
    await missionPage.verifyMissionGone(missionName);
  });

  test('should handle empty input gracefully', async ({ page }) => {
    const countBefore = await page.locator('app-todo-item').count();

    await missionPage.missionInput.focus();
    await missionPage.missionInput.press('Enter');

    // Wait a bit to ensure nothing happened (flaky but hard to assert "nothing happened")
    await page.waitForTimeout(500);

    const countAfter = await page.locator('app-todo-item').count();
    expect(countAfter).toBe(countBefore);
  });

  test('should verify empty state when no missions exist', async ({ page }) => {
    // This test is destructive, it clears everything.
    await missionPage.clearAllMissions();
    await missionPage.verifyEmptyState();
  });
});
