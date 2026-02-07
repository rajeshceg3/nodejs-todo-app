import { expect, type Locator, type Page } from '@playwright/test';

export class MissionControlPage {
  readonly page: Page;
  readonly missionInput: Locator;
  readonly todoList: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.missionInput = page.getByPlaceholder('Add a new mission...');
    this.todoList = page.locator('app-todo-list');
    this.emptyState = page.locator('.empty-state');
  }

  async goto() {
    await this.page.goto('/');
  }

  async addMission(text: string) {
    await this.missionInput.fill(text);
    await this.missionInput.press('Enter');
  }

  async getMission(text: string) {
    return this.page.locator('app-todo-item').filter({ hasText: text });
  }

  async completeMission(text: string) {
    const mission = await this.getMission(text);
    await mission.locator('.custom-checkbox').click();
  }

  async deleteMission(text: string) {
    const mission = await this.getMission(text);
    await mission.locator('.delete-btn').click();
  }

  async clearAllMissions() {
    const items = this.page.locator('app-todo-item');
    while ((await items.count()) > 0) {
      const currentCount = await items.count();
      await items.first().locator('.delete-btn').click();
      // Wait for the list size to decrease by 1 to confirm deletion
      await expect(items).toHaveCount(currentCount - 1);
    }
  }

  async verifyMissionExists(text: string) {
    const mission = await this.getMission(text);
    await expect(mission).toBeVisible();
  }

  async verifyMissionGone(text: string) {
    const mission = await this.getMission(text);
    await expect(mission).not.toBeVisible();
  }

  async verifyMissionCompleted(text: string) {
    const mission = await this.getMission(text);
    await expect(mission.locator('.todo-content')).toHaveClass(/completed/);
    await expect(mission.locator('.custom-checkbox')).toHaveClass(/checked/);
  }

  async verifyEmptyState() {
     await expect(this.page.getByText('All caught up!')).toBeVisible();
     await expect(this.page.getByText('Your mission log is empty.')).toBeVisible();
  }
}
