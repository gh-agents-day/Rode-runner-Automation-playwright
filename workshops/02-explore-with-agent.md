# Module 02 — Explore the App with a Copilot Agent

> **Goal:** Use GitHub Copilot in **Agent mode** with the **Playwright MCP** to autonomously navigate the Rode Runner game in a real browser, discover every interactive element, and map all testable behaviors — without writing a single line of test code yet.

---

## Why "explore first"?

Before writing tests you need to understand:

- What elements exist on the page (selectors, labels, visibility)
- How the game transitions between states (`idle → playing → dead`)
- What `window.__gameState` looks like at each state
- Which behaviors are most risk-prone (fast-path vs edge-path)

The exploration agent does all of this live in a browser and hands you a structured discovery table you can refer to in later modules.

---

## Step 02-A — Start the Game Server

Open a **dedicated terminal** (keep it running throughout the workshop):

```bash
npm run serve
```

Confirm `http://localhost:3000` loads in your browser before continuing.

---

## Step 02-B — Open Copilot Chat in Agent Mode

1. Open Copilot Chat with `Ctrl+Shift+I`.
2. At the bottom of the chat panel, click the **model/mode selector** (usually shows the current model name).
3. Choose **Agent** mode (not "Ask" or "Edit").
4. Verify the 🔧 toolbar button shows **playwright** tools in the list.

---

## Step 02-C — Create the Exploration Agent

Before we can start exploring, we need to define the **Rode Runner Exploration Agent**.

1. Create a new folder **.github/agents/** in your project root if it doesn't already exist.
2. Create a new file called **explore-agent.agent.md** inside that folder.
3. Copy and paste the following content into **.github/agents/explore-agent.agent.md**:

```markdown
---
name: Rode Runner Exploration Agent
mode: agent
description: >
  Exploration agent — navigates the Rode Runner game in a live browser
  using Playwright MCP and maps all testable behaviors to a discovery table.
tools: [browser, 'playwright/*']
---

# Exploration Agent — Rode Runner

You are a Playwright MCP-powered browser automation agent.

## Your Mission

Navigate the **Rode Runner** game at `http://localhost:3000` and autonomously discover every testable behavior. Perform real browser actions using the Playwright MCP tools and report your findings as a structured Markdown table.

---

## Phase 1 — Navigate & Inspect

1. Navigate to `http://localhost:3000` from the integrated **browser**.
2. Take a screenshot and describe what you see (elements, layout, text).
3. List all interactive elements you find (buttons, inputs, canvas, overlays).
4. Evaluate `window.__gameState` to confirm the test API is available:
   
   `typeof window.__gameState !== 'undefined'`
   
5. Record the initial values:
   - `window.__gameState.getState()`   → expected `"idle"`
   - `window.__gameState.getScore()`   → expected `0`
   - `window.__gameState.getLives()`   → expected `3`

---

## Phase 2 — Explore Idle State

1. Confirm the overlay (`[data-testid="game-overlay"]`) is **visible**.
2. Confirm the title text inside the overlay reads "RODE RUNNER".
3. Press the **Space** key — confirm the game state does **not** change.
4. Press **ArrowDown** — confirm `isDucking()` is still `false`.
5. Read the start button text: `[data-testid="start-button"]`.

---

## Phase 3 — Start the Game and Play

1. Click `[data-testid="start-button"]`.
2. Confirm the overlay disappears (`game-overlay` hidden).
3. Confirm `getState()` === `"playing"`.
4. Confirm `getLives()` === `3`, `getScore()` === `0`.
5. Wait 2 seconds, then confirm `getScore()` > 0.
6. Press **Space** — wait 100ms — confirm `getPlayerY()` dropped below 290.
7. Press **ArrowDown** for 400ms — confirm `isDucking()` === `true`.
8. Release ArrowDown — confirm `isDucking()` returns to `false`.
9. Press **Space** twice rapidly — confirm a double jump executes.
10. Read and record the current values of `score-display`, `coin-display`, `best-display`.

---

## Phase 4 — Game Over Flow

1. Call `window.__gameState.forceGameOver()`.
2. Wait for `window.__gameState.isDead()` === `true`.
3. Confirm the overlay is **visible** again.
4. Confirm text `"GAME OVER"` or a game-over title appears.
5. Confirm `[data-testid="replay-button"]` is visible.
6. Confirm the final score is shown somewhere in the overlay.
7. Click the replay button.
8. Confirm `getState()` returns `"playing"`.
9. Confirm `getScore()` === `0` and `getLives()` === `3`.

---

## Phase 5 — Edge Cases

1. **Page refresh**: Reload the page — confirm state returns to `"idle"` and score is `0`.
2. **Start then immediate start**: Start the game, then try clicking start again to confirm the game continues normally.
3. **setLives(1)**: Start the game, set `window.__gameState.setLives(1)`, then call `forceGameOver()` — confirm game-over flow.
4. **Inspect power-up display**: Note whether `[data-testid="powerup-display"]` is shown or hidden.

---

## Phase 6 — Extra Inspection

Run the following evaluations and record all return values:

`
window.__gameState.getHighScore()
window.__gameState.getSpeed()
window.__gameState.getFrame()
window.__gameState.hasShield()
window.__gameState.hasMagnet()
window.__gameState.hasX2()
window.__gameState.hasSpeedBoost()
window.__gameState.getObstacleCount()
window.__gameState.getCoinCount()
`
Take a final screenshot.

---

## Phase 7 — Summarise

Return a **Markdown table** with every behavior you discovered.

Include one row per observation:

| # | Element / API | Action | Assertion | Result |
|---|--------------|--------|-----------|--------|
| 1 | `[data-testid="game-overlay"]` | Visible on load | `overlay.isVisible() === true` | ✅ PASS |
| 2 | `window.__gameState.getState()` | Read on load | `=== "idle"` | ✅ PASS |
| … | | | | |

Mark each result ✅ PASS or ❌ FAIL with a brief reason if it failed.

Sort rows: Idle state first, then Playing, then Game Over, then Edge Cases.
```

## Step 02-D — Run the Exploration Agent

1. Open Copilot Chat (`Ctrl+Shift+I`).
2. Switch to **Explore-agent** mode using the model/mode selector at the bottom.
3. Provide the following prompt to start the exploration:

```text
please explore the game at http://localhost:3000 using integrated browser.
Use the Playwright MCP to run the exploration defined in this agent file.
Navigate to http://localhost:3000 and complete all phases.
Return the full discovery table in Markdown.
```

---

## Step 02-E — What the Agent Does
The agent will now autonomously:
1. Open the browser and navigate to the game.
2. Execute all phases of the exploration.
3. Use the Playwright MCP tools to interact with the page and evaluate state.
4. Provide you with a detailed Markdown table of all behaviors found.

---

**Next:** [03 — Generate Test Scenarios with a Custom Agent](./03-generate-scenarios.md)

## Checkpoint ✅

Before moving on, confirm:

- [ ] The agent successfully navigated `http://localhost:3000` using MCP tools
- [ ] You have a discovery table covering idle, playing, jumping, ducking, and game-over states
- [ ] `replay-button` was discovered and confirmed visible after game over
- [ ] `window.__gameState` API was confirmed accessible from the browser context
- [ ] You have at least 10 rows in your discovery table

---

## Key Concepts Learned

| Concept | What you observed |
|---------|------------------|
| `data-testid` selectors | Stable, CSS-class-independent targets for Playwright |
| `window.__gameState` | Programmatic read/write API — no UI interaction needed |
| State machine | `idle → playing → dead → playing (replay)` |
| MCP tools | `playwright_navigate`, `playwright_click`, `playwright_evaluate`, `playwright_screenshot` |

---

**Next:** [03 — Generate Test Scenarios with a Custom Agent →](./03-generate-scenarios.md)
