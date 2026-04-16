# Module 03 — Generate Test Scenarios with a Custom Agent

> **Goal:** Use a custom Copilot agent to analyse the game source code and your discovery table, then produce a structured **test scenario document** covering positive, negative, and edge-case categories. No test code is written in this module — only test *designs*.

---

## Why design scenarios before coding?

Jumping straight to code often misses whole categories of risk. Designing scenarios first lets you:

- Reason about coverage deliberately (positive / negative / edge / power-up / performance)
- Spot gaps before implementation
- Get a reviewable artifact that non-engineers can read
- Give the test-generation agent a clear brief in the next module

---

## Step 03-A — Ensure the Server is Still Running

```bash
# In a dedicated terminal (from Step 02-A)
npm run serve
```

If it stopped, restart it now.

---

## Step 03-B — Create the Test Scenario Generator Agent

We will now create the **Test Scenario Generator Agent** that will help us design our tests.

1. Ensure the folder **.github/agents/** exists in your project root.
2. Create a new file called **test-scenario-agent.agent.md** inside that folder.
3. Copy and paste the following content into **.github/agents/test-scenario-agent.agent.md**:

```markdown
  ---
  name : Rode Runner Scenario Design Agent
  mode: agent
  description: >
    Scenario design agent — analyses game source code and produces a structured
    test scenario document covering positive, negative, edge-case, power-up,
    and visual categories. Does NOT write test code.
  tools: [browser, 'playwright/*']
  ---

  # Scenario Design Agent — Rode Runner

  You are an expert QA analyst tasked with designing a **test scenario document** for the Rode Runner browser game.

  ## Your Mission

  Produce a structured Markdown document containing test scenarios across all required categories. You may use the Playwright MCP tools to verify any behavior you are unsure about by navigating to `http://localhost:3000`.

  **Do NOT write Playwright code** in this document. Scenarios are plain-language test designs.

  ---

  ## Game Summary

  The Rode Runner game is an endless-runner browser game with the following key properties:

  - Served at `http://localhost:3000` (entry point: `src/index.html`)
  - Game logic in `src/game.js`
  - Three states: `idle → playing → dead`
  - `window.__gameState` test API provides read and programmatic control
  - Every UI element has a `data-testid` attribute (stable selectors)

  ### State Machine

    [idle]
      │  click start-button
      ▼
    [playing]
      │  lives reach 0
      ▼
    [dead]
      │  click replay-button
      ▼
    [playing] (score resets)

  ### Key Game Rules

  1. **Start**: overlay hides, state = "playing", lives = 3, score = 0
  2. **Score**: increments every 6 frames (+1, or +2 with ×2 power-up)
  3. **Coins**: +5 score each (+10 with ×2); displayed as "🪙 N"
  4. **Jump**: Space / ArrowUp / W — up to 2 jumps before landing
  5. **Duck**: ArrowDown / S — only while on ground
  6. **Lives**: Start at 3; each obstacle hit removes 1 life with 100-frame invincibility
  7. **Shield power-up**: Absorbs one hit; displayed as blue aura
  8. **Magnet power-up**: Pulls coins from 120 px radius
  9. **x2 power-up**: Doubles score and coin gain for 8 seconds
  10. **Speed boost**: Speed × 1.6 for 8 seconds
  11. **Game Over**: lives ≤ 0 → state = "dead", overlay shows score + replay button
  12. **Best score**: Session-scoped; never decreases

  ### data-testid selectors

  `game-canvas`, `game-overlay`, `start-button`, `replay-button`, `score-display`,
  `coin-display`, `best-display`, `game-hud`, `powerup-display`, `score-panel`,
  `coin-panel`, `best-panel`, `game-title`, `game-subtitle`, `gameover-title`,
  `final-score`, `highscore-display`

  ---

  ## Required Categories

  You MUST produce scenarios for **all** of the following:

  ---

  ### Category 1 — Positive Scenarios (Happy Path)

  At least **10 scenarios** covering:

  - Page load initial state
  - Start button behavior
  - Score accumulation over time
  - Coin collection and display
  - Jump mechanics (single and double)
  - Duck mechanics
  - Game-over flow
  - Replay flow
  - Best score persistence
  - HUD visibility during play

  ---

  ### Category 2 — Negative Scenarios (Adverse Conditions)

  At least **8 scenarios** covering:

  - Keyboard input when game is idle (should do nothing)
  - Score before game starts
  - Lives before game starts
  - Attempting to trigger actions in wrong state
  - HUD display does not show NaN or undefined
  - No score gain when not playing

  ---

  ### Category 3 — Edge Cases (Boundary / Timing)

  At least **8 scenarios** covering:

  - Rapid repeated input (Space, ArrowDown)
  - Setting lives to 0 programmatically
  - Score display sync with internal state
  - Page refresh resets state
  - Immediate replay after game over
  - Double-jump limit (max 2 jumps)
  - Very high score (use setLives + long play or simulate)
  - Viewport / responsive layout at different sizes

  ---

  ### Category 4 — Power-Up Scenarios

  At least **5 scenarios** covering:

  - Shield absorbs one hit and is then consumed
  - x2 doubles score gain while active
  - x2 doubles coin gain while active
  - Magnet pulls coins
  - Speed boost increases game speed
  - Power-up expiry returns game to normal

  ---

  ### Category 5 — Visual / Screenshot Scenarios

  At least **3 scenarios** covering:

  - Start screen visual baseline
  - Game-over screen visual baseline
  - HUD elements are rendered and contain only valid numeric text

  ---

  ## Output Format

  Return the full document in Markdown with this structure:

  ```markdown
  # Rode Runner — Test Scenario Document
  ## 1. Positive Scenarios
  | ID | Title | Precondition | Steps | Expected Result |
  ...

  ## 2. Negative Scenarios
  ...

  ## 3. Edge Cases
  ...

  ## 4. Power-Up Scenarios
  ...

  ## 5. Visual Scenarios
  ...
  Each scenario row must have: **ID**, **Title**, **Precondition**, **Steps** (numbered), **Expected Result**.

  Use IDs in the format: `POS-01`, `NEG-01`, `EDG-01`, `PWR-01`, `VIS-01`.
  ---

  ## Verification Instruction

  If you are uncertain whether a behavior is correct, use the Playwright MCP to verify it:
  1. Navigate to `http://localhost:3000`
  2. Perform the relevant action
  3. Evaluate `window.__gameState.<method>()` to confirm
  4. Record your observation in the scenario

  Do not guess — verify.

```

## Step 03-C — Generate Scenarios

1. Open Copilot Chat (`Ctrl+Shift+I`) and ensure you are in **Rode Runner Scenario Design Agent** mode.
2. Provide the following prompt:

```text
Generate a comprehensive test scenario document for the Rode Runner game which is running in the integrated browser at http://localhost:3000..
Analyze the source code in #file:game.js  and #file:index.html.
Incorporate findings from our previous exploration.
Create scenarios for:
- Positive (happy-path)
- Negative (adverse-condition)
- Edge-cases (boundary/timing)
- Power-ups
Save the output to a new file: tests/test-scenarios.md.
```

---

### Sample Output

# Rode Runner — Test Scenario Document

## 1. Positive Scenarios (Happy Path)

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| POS-01 | Page loads with overlay | Fresh page load | Navigate to / | game-overlay visible, state="idle" |
| POS-02 | Start button starts game | state="idle" | Click start-button | overlay hidden, state="playing", lives=3, score=0 |
| POS-03 | Score increments while playing | state="playing" | Wait 2 seconds | score > 0 |
| POS-04 | Jump reduces player Y | state="playing" | Press Space | getPlayerY() < 290 |
| POS-05 | Double jump works | state="playing", player in air | Press Space twice | player Y decreases further |
| POS-06 | Duck while on ground | state="playing" | Hold ArrowDown | isDucking() === true |
| POS-07 | Score shown in overlay after game over | state="dead" | Force game over | final-score text === score |
| POS-08 | Replay resets game | state="dead" | Click replay-button | state="playing", score=0, lives=3 |
| POS-09 | Coin display updates | Collect coin | Wait for coin | coin-display text increases |
| POS-10 | Best score persists across replay | Complete one game | Replay | best-display >= previous score |

## 2. Negative Scenarios (Adverse Conditions)

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| NEG-01 | Space in idle state does nothing | state="idle" | Press Space | state stays "idle" |
| NEG-02 | Score stays 0 before game starts | state="idle" | Read score | score === 0 |
| NEG-03 | Duck key in idle state does nothing | state="idle" | Hold ArrowDown | isDucking() === false |
| NEG-04 | No lives lost before game starts | state="idle" | Read lives | lives === 3 |
| NEG-05 | Triple jump not possible | state="playing", 2 jumps used | Press Space 3rd time | player does not jump again |

## 3. Edge Cases (Boundary / Timing)

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| EDG-01 | Rapid Space presses do not crash | state="playing" | Press Space 10× quickly | game still playing |
| EDG-02 | setLives(0) triggers game over | state="playing" | setLives(0) | state="dead" |
| EDG-03 | Score display matches internal state | state="playing" | Read both sources | scoreDisplay.text === getScore() |
| EDG-04 | Replay immediately after game over | state="dead" | Click replay instantly | state="playing" |
| EDG-05 | Page refresh resets to idle | any | Reload page | state="idle", score=0 |

## 4. Power-Up Scenarios

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| PWR-01 | Shield absorbs one hit | hasShield()=true | Trigger collision | lives unchanged, shield gone |
| PWR-02 | x2 doubles score gain | hasX2()=true | Wait 2 frames | score increments by 2 per interval |
| PWR-03 | Magnet pulls coins | hasMagnet()=true | Coins nearby | coin count increases faster |

## 5. Visual / Screenshot Scenarios

| ID | Title | Steps | Expected Result |
|----|-------|-------|----------------|
| VIS-01 | Start screen snapshot | Navigate to / | Screenshot matches baseline |
| VIS-02 | Game-over screen snapshot | Force game over | Screenshot matches baseline |
| VIS-03 | No NaN/undefined in HUD | state="playing" | HUD text contains only numbers |

---

## Step 03-F — Review and Refine the Scenarios

The agent's output is a starting point. Review it and ask for improvements:

**Add more scenarios:**
```
Add 5 more negative scenarios covering invalid game states.
```

**Deepen a category:**
```
Expand the power-up scenarios to cover expiry after 8 seconds.
```

**Ask about coverage gaps:**
```
What game behaviors from the source code are NOT covered by any scenario yet?
```

---

## Step 03-G — Save the Scenario Document

Copy the full Markdown output from the agent and save it as `test-scenarios.md` at the project root.

This file serves as the **brief** you hand to the test-generation agent in Module 04.

---

## Step 03-H — Understanding the Test Categories

| Category | What it tests | Typical risk |
|----------|--------------|-------------|
| **Positive** | Happy path, all inputs valid | Regressions after feature changes |
| **Negative** | Invalid input, wrong state | Input validation gaps |
| **Edge cases** | Boundary values, rapid input, timing | Race conditions, state corruption |
| **Power-ups** | Conditional feature activation | Interaction bugs |
| **Visual** | Pixel-level UI consistency | CSS/layout regressions |

---

## Checkpoint ✅

Before moving on, confirm:

- [ ] You have a scenario document with at least **20 scenarios**
- [ ] All five categories are represented (positive, negative, edge, power-up, visual)
- [ ] Every scenario has an ID, title, precondition, steps, and expected result
- [ ] The document is saved as `test-scenarios.md`

---

**Next:** [04 — Generate Test Suites with a Custom Agent →](./04-generate-test-suites.md)
