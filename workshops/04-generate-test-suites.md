# Module 04 — Generate Test Suites with a Custom Agent

> **Goal:** Use a custom Copilot agent (with Playwright MCP) to convert your scenario document into four runnable Playwright `.spec.js` test files, then verify they are syntactically valid and can be discovered by Playwright.

---

## Step 04-A — Understand the Target File Layout

By the end of this module, your `tests/` folder will contain:

```
tests/
├── helpers/
│   └── GamePage.js              ← Already created in Module 01
├── positive.spec.js             ← Happy-path tests
├── negative.spec.js             ← Adverse-condition tests
├── edge-cases.spec.js           ← Boundary / timing tests
└── agent-generated.spec.js      ← AI-generated mixed tests
```

Each file follows the same pattern:

```javascript
// @ts-check
'use strict';

const { test, expect } = require('@playwright/test');
const { GamePage }     = require('./helpers/GamePage');

test.describe('Suite Name', () => {
  test('ID | Description', async ({ page }) => {
    const game = new GamePage(page);
    await game.goto();
    // ... test steps
  });
});
```

---

## Step 04-B — Create the Test Generator Agent

We will use the same **Test Generator Agent** we created in Module 03, but this time we'll use it to produce actual test code.

1. Ensure the folder **.github/agents/** exists in your project root.
2. Create a new file called **test-generator-agent.agent.md** inside that folder.
3. Copy and paste the following content into **.github/agents/test-generator-agent.agent.md**:

```markdown
---
name : Rode Runner Test Generator Agent
description: >
  Test generator agent — converts test scenarios into complete, runnable Playwright .spec.js files using the GamePage helper. Uses Playwright MCP to verify any behavior live before writing assertions.
tools: [playwright_navigate, playwright_evaluate, playwright_screenshot, playwright_click, playwright_press, playwright_wait_for_selector]
mode: agent
---

# Test Generator Agent — Rode Runner

You are an expert Playwright test automation engineer.

## Your Mission

Convert the test scenarios provided to you into complete, runnable Playwright `.spec.js` test files.  
Use the **Playwright MCP** to verify any behavior you are uncertain about before writing assertions.

---

## Project Context

- **Game URL:** `http://localhost:3000`
- **Test framework:** `@playwright/test`
- **Page Object Model:** `tests/helpers/GamePage.js` (already exists — see below)
- **Playwright config:** `playwright.config.js` at project root

---

## GamePage Helper API

Every test MUST import and use `GamePage`. Here is the full API:

```javascript
const { GamePage } = require('./helpers/GamePage');

// Navigation
await game.goto()                    // Navigate + wait for __gameState

// Game actions
await game.clickStart()              // Click start-button + waitForFunction(isPlaying)
await game.clickReplay()             // Click replay-button + waitForFunction(isPlaying)
await game.pressJump()               // Press Space
await game.pressDuck(ms?)            // Hold ArrowDown for ms (default 400)
await game.forceGameOver()           // API call + wait for dead state
await game.waitForScore(n, timeout?) // Poll until score >= n

// State readers (all async, return via page.evaluate)
await game.getState()     // "idle" | "playing" | "dead"
await game.getScore()     // number
await game.getCoins()     // number
await game.getLives()     // 0–3
await game.isPlaying()    // boolean
await game.isDead()       // boolean
await game.getPlayerY()   // number (lower = player higher on screen)
await game.isDucking()    // boolean
await game.hasShield()    // boolean
await game.hasMagnet()    // boolean
await game.hasX2()        // boolean

// Locators (Playwright Locator objects — use with expect())
game.canvas          // [data-testid="game-canvas"]
game.overlay         // [data-testid="game-overlay"]
game.startButton     // [data-testid="start-button"]
game.replayButton    // [data-testid="replay-button"]
game.scoreDisplay    // [data-testid="score-display"]
game.coinDisplay     // [data-testid="coin-display"]
game.bestDisplay     // [data-testid="best-display"]
game.hud             // [data-testid="game-hud"]
game.powerupArea     // [data-testid="powerup-display"]
```

---

## Required Test Patterns

<details> 
<summary> On the required test patterns will go here — see the "Live Verification Instruction" and "Output Instruction" sections below for more info</summary>

Include at least one test using each of these patterns:

### Pattern A — Read state via window.__gameState

```javascript
expect(await game.getState()).toBe('idle');
```

### Pattern B — Wait for score threshold

```javascript
await game.waitForScore(10);
expect(await game.getScore()).toBeGreaterThanOrEqual(10);
```

### Pattern C — Physics assertion (player Y)

```javascript
const groundY = await game.getPlayerY();
await game.pressJump();
await page.waitForTimeout(100);
const airY = await game.getPlayerY();
expect(airY).toBeLessThan(groundY);
```

### Pattern D — Force game over and verify overlay

```javascript
const score = await game.getScore();
await game.forceGameOver();
await expect(game.overlay).toBeVisible();
await expect(page.getByTestId('final-score')).toHaveText(String(score));
```

### Pattern E — Negative: input in idle state

```javascript
await page.keyboard.press('Space');
await page.waitForTimeout(200);
expect(await game.getState()).toBe('idle');
```

### Pattern F — Edge case: rapid input

```javascript
for (let i = 0; i < 10; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(30);
}
expect(await game.isPlaying()).toBe(true);
```

### Pattern G — Screenshot regression

```javascript
await expect(page).toHaveScreenshot('start-screen.png');
```

### Pattern H — Score display sync

```javascript
const internal = await game.getScore();
await expect(game.scoreDisplay).toHaveText(String(internal));
```
</details>

## Minimum Requirements per File

| File | Min tests | Required patterns |
|------|-----------|------------------|
| `positive.spec.js` | 10 | A, B, C, D |
| `negative.spec.js` | 8 | A, E |
| `edge-cases.spec.js` | 8 | F, H |
| `agent-generated.spec.js` | 10 | A, B, G, H, and at least one using `setLives()` |

---

## Live Verification Instruction

Before writing any assertion, use Playwright MCP to confirm the behavior:

1. Navigate to `http://localhost:3000`
2. Perform the action described in the scenario
3. Evaluate the relevant `window.__gameState` method
4. Write the assertion based on what you observed — not on assumption

---

## Output Instruction

Return the **complete JavaScript file content** for the requested suite.  
Start immediately with the file header comment block. Do not add explanation text before or after the code.

Example expected structure:

```javascript
// @ts-check
// tests/positive.spec.js — Positive (happy-path) test suite for Rode Runner
'use strict';

const { test, expect } = require('@playwright/test');
const { GamePage }     = require('./helpers/GamePage');

test.describe('Page Load & Initial State', () => {
  test('POS-01 | Page loads with game overlay visible', async ({ page }) => {
    const game = new GamePage(page);
    await game.goto();
    // ...
  });
});
```

---

## Step 04-C — Generate the Positive Test Suite

### 1. Attach files and run the agent

In Copilot Chat, using the `test-generator-agent.agent.md`:
```text
Generate the POSITIVE test suite for Rode Runner.
Analyze #file:tests/test-scenarios.md and use ONLY scenarios from the "Positive Scenarios" category.
Use Playwright MCP to verify any behavior you are uncertain about (navigate to http://localhost:3000).
Save the output to tests/positive.spec.js.
Each test must use GamePage helpers from #file:tests/helpers/GamePage.js.
Prefix each test ID with POS-.
```

### 2. Quick smoke-test

```bash
npx playwright test tests/positive.spec.js --project=chromium --list
```

This should list all discovered tests without running them. If any test IDs show up, the file is syntactically valid.

---

## Step 04-D — Generate the Negative Test Suite

In Copilot Chat (continuing the same test-generator-agent session), send:

```text
Now generate the NEGATIVE test suite.
Use scenarios from the "Negative Scenarios" category in #file:tests/test-scenarios.md.
Prefix test IDs with NEG-.
Save to tests/negative.spec.js.
```

Verify:

```bash
npx playwright test tests/negative.spec.js --project=chromium --list
```

---

## Step 04-E — Generate the Edge-Cases Test Suite

In Copilot Chat (continuing the same test-generator-agent session), send:
```text
Generate the EDGE-CASES test suite.
Use scenarios from the "Edge Cases" category in #file:tests/test-scenarios.md.
Prefix test IDs with EDG-.
Save to tests/edge-cases.spec.js.
```

Verify:

```bash
npx playwright test tests/edge-cases.spec.js --project=chromium --list
```

---

**Next:** [05 — Run and Report](./05-run-and-report.md)

