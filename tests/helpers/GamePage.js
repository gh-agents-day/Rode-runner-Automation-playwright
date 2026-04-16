'use strict';

const { expect } = require('@playwright/test');

const GROUND_Y = 290; // canvas height 360 - player height 70

class GamePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // ── Locators ─────────────────────────────────────────────
    this.canvas       = page.getByTestId('game-canvas');
    this.overlay      = page.getByTestId('game-overlay');
    this.startButton  = page.getByTestId('start-button');
    this.replayButton = page.getByTestId('replay-button');
    this.scoreDisplay = page.getByTestId('score-display');
    this.coinDisplay  = page.getByTestId('coin-display');
    this.bestDisplay  = page.getByTestId('best-display');
    this.hud          = page.getByTestId('game-hud');
    this.powerupArea  = page.getByTestId('powerup-display');
  }

  // ── Navigation ───────────────────────────────────────────────

  /** Navigate to the game and wait until the test API is ready. */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForFunction(() => typeof window.__gameState !== 'undefined');
  }

  // ── Game actions ─────────────────────────────────────────────

  /** Click Start and wait until the game is in "playing" state. */
  async clickStart() {
    await this.startButton.click();
    await this.page.waitForFunction(() => window.__gameState.isPlaying());
  }

  /** Click Replay and wait until the game is in "playing" state. */
  async clickReplay() {
    await this.replayButton.click();
    await this.page.waitForFunction(() => window.__gameState.isPlaying());
  }

  /** Press the Space key (triggers a jump). */
  async pressJump() {
    await this.page.keyboard.press('Space');
  }

  /** Hold ArrowDown for `ms` milliseconds (triggers duck). */
  async pressDuck(ms = 400) {
    await this.page.keyboard.down('ArrowDown');
    await this.page.waitForTimeout(ms);
    await this.page.keyboard.up('ArrowDown');
  }

  /**
   * Force game over via the test API and wait for the dead state.
   */
  async forceGameOver() {
    await this.page.evaluate(() => window.__gameState.forceGameOver());
    await this.page.waitForFunction(() => window.__gameState.isDead());
  }

  /**
   * Poll until score reaches at least `minScore`.
   * @param {number} minScore
   * @param {number} [timeout=15000]
   */
  async waitForScore(minScore, timeout = 15_000) {
    await this.page.waitForFunction(
      (min) => window.__gameState.getScore() >= min,
      minScore,
      { timeout }
    );
  }

  // ── State readers ────────────────────────────────────────────

  async getState()    { return this.page.evaluate(() => window.__gameState.getState()); }
  async getScore()    { return this.page.evaluate(() => window.__gameState.getScore()); }
  async getCoins()    { return this.page.evaluate(() => window.__gameState.getCoins()); }
  async getLives()    { return this.page.evaluate(() => window.__gameState.getLives()); }
  async isPlaying()   { return this.page.evaluate(() => window.__gameState.isPlaying()); }
  async isDead()      { return this.page.evaluate(() => window.__gameState.isDead()); }
  async getPlayerY()  { return this.page.evaluate(() => window.__gameState.getPlayerY()); }
  async isDucking()   { return this.page.evaluate(() => window.__gameState.isDucking()); }
  async hasShield()   { return this.page.evaluate(() => window.__gameState.hasShield()); }
  async hasMagnet()   { return this.page.evaluate(() => window.__gameState.hasMagnet()); }
  async hasX2()       { return this.page.evaluate(() => window.__gameState.hasX2()); }

  // ── Assertion helpers ────────────────────────────────────────

  /** Assert the game is in "idle" state. */
  async expectIdle() {
    expect(await this.getState()).toBe('idle');
  }

  /** Assert the game is in "playing" state. */
  async expectPlaying() {
    expect(await this.isPlaying()).toBe(true);
  }

  /** Assert the game is in "dead" state. */
  async expectDead() {
    expect(await this.isDead()).toBe(true);
  }

  /** Assert score display text matches internal state. */
  async expectScoreDisplaySync() {
    const internal = await this.getScore();
    await expect(this.scoreDisplay).toHaveText(String(internal));
  }
}

module.exports = { GamePage, GROUND_Y };