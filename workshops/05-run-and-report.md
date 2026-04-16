# Module 05 — Run Tests and Generate Reports

> **Goal:** Execute the Playwright test suites you generated, view the rich HTML report, use Playwright MCP to run tests interactively, and use a Copilot agent to triage any failures.

---

## Step 05-A — Verify the Server is Running

Before running tests, confirm the game server is active:

```bash
# In a dedicated terminal
npm run serve
```

---

## Step 05-B — Run All Tests (Headless)

From the project root:

```bash
npm run test:all
```

This runs every `.spec.js` file in `tests/` across Chromium and Firefox, with full reporters (HTML, JSON, JUnit).

---

## Step 05-C — View the HTML Report

After the run, open the interactive report:

```bash
npm run report
```

### What you will see

- **Test list** with ✅/❌/⚠️ status for every test
- **Click any failed test** to expand the failure details:
  - Error message and stack trace
  - Screenshots captured on failure
  - Video replay (if `video: 'retain-on-failure'` is set in config)
- **Trace viewer** — click the trace link to see:
  - DOM snapshot at every Playwright action
  - Network timeline
  - Console errors

---

## Step 05-D — Run Tests via Playwright MCP (Interactive)

You can also trigger test-like interactions directly from Copilot Chat:

1. Open Copilot Chat in **Agent mode**.
2. Make sure the game server is running at `http://localhost:3000`.
3. Send:

```text
Using Playwright MCP:
1. Navigate to http://localhost:3000
2. Click the start button
3. Wait 5 seconds
4. Jump using the Space key
5. Screenshot the current state
```

---

## Step 05-E — Create the Report Analyzer Agent

If there are any failures, we can use a **Report Analyzer Agent** to triage them.

1. Ensure `.github/agents/report-analyzer-agent.agent.md` exists.
2. Create it if it doesn't:

```markdown
  ---
  name: Rode Runner Report Analyzer Agent
  mode: agent
  description: >
    Report analyzer agent — reads test-results/results.json and produces a
    prioritised failure report with P0/P1/P2/P3 classification and
    actionable recommendations.
  ---

  # Report Analyzer Agent — Rode Runner

  You are a senior QA analyst reviewing Playwright test results for the **Rode Runner** game.

  ## Your Mission

  Read `test-results/results.json`, analyse all test outcomes, and return a structured, prioritised failure report.

  ---

  ## Analysis Steps

  ### Step 1 — Parse the Results File

  Read `test-results/results.json`. For each test suite:

  - Count total tests, passed, failed, skipped
  - Identify **flaky tests** (failed on first attempt but passed on retry)
  - For each failure, extract:
    - Test ID and title
    - Suite name
    - Error message
    - Stack trace (first 3 relevant lines only)
    - Browser/project the failure occurred on

  ### Step 2 — Classify Failures by Priority

  Use this classification table:

  | Priority | Label | Criteria |
  |----------|-------|---------|
  | P0 | 🔴 Critical | Game crashes, state machine breaks (stuck in wrong state), overlay never hides/shows, test setup fails entirely |
  | P1 | 🟠 High | Wrong score/coin counts, lives not reset correctly, controls completely unresponsive, game-over flow broken |
  | P2 | 🟡 Medium | UI display text mismatches, timing-sensitive failures that pass on retry, minor state timing issues |
  | P3 | 🟢 Low | Screenshot pixel diffs, minor text format differences, tests that rely on font rendering |

  ### Step 3 — Identify Patterns

  Look for:
  - Multiple failures in the same test file (suggests structural issue)
  - Failures only on Firefox/WebKit (browser-specific bugs)
  - Failures only in CI (`retries > 0`) suggesting flakiness
  - Failures with "Timeout" in the error (timing issues)
  - Failures with "toHaveText" or "toHaveScreenshot" (assertion setup issues)

  ### Step 4 — Write Recommendations

  For each P0 and P1 failure, write a specific, actionable recommendation:

  - Bad: "Fix the test"
  - Good: "In EDG-03, replace `waitForTimeout(500)` with `waitForFunction(() => window.__gameState.getScore() > prevScore)` to avoid the timing race"

  ---

  ## Output Format

  Return the complete report in this exact Markdown structure:

  ```markdown
  # Rode Runner — Test Report Summary

  **Date:** [ISO date]  
  **Run command:** `npm run test:all`

  ---

  ## Executive Summary

  | Metric | Value |
  |--------|-------|
  | Total Tests | N |
  | Passed | N ✅ |
  | Failed | N ❌ |
  | Flaky | N ⚠️ |
  | Skipped | N |
  | Pass Rate | N% |
  | Browsers tested | Chromium, Firefox |

  ---

  ## Failures by Priority

  ### 🔴 P0 — Critical (Must fix before merge)

  | Test ID | Title | Browser | Error Summary |
  |---------|-------|---------|---------------|
  | … | … | … | … |

  **Details:**

  > **[Test ID]** — [Suite] › [Title]  
  > Error: `[error message]`  
  > Stack: `[file:line]`

  ---

  ### 🟠 P1 — High (Fix in current sprint)

  …

  ### 🟡 P2 — Medium (Fix in next sprint)

  …

  ### 🟢 P3 — Low (Backlog)

  …

  ---

  ## Flaky Tests

  | Test ID | Title | Pass Rate | Likely Cause |
  |---------|-------|-----------|-------------|
  | … | … | 1/2 | Timing |

  ---

  ## Recommendations

  ### Immediate Actions (P0 + P1)

  1. **[Test ID]** — [Specific fix instruction]
  2. …

  ### Maintenance (P2)

  1. …

  ### Optional (P3)

  1. …

  ---

  ## Coverage Gaps (if any)

  List any game behaviors from `src/game.js` that have no test coverage based on test titles.

  ---

  *Report generated by Copilot Report Analyzer Agent.*
```

---

## Additional Instructions

- If there are **zero failures**, still output the Executive Summary and a note confirming full pass.
- If the JSON file is missing or malformed, state that clearly and ask the user to run `npm run test:all` first.
- Do not fabricate test names or error messages — use only what is in the provided file.
- Include the raw error message verbatim for P0 failures.


## Step 05-F — Triage Failures

If you have test failures, run this in Copilot Chat with `report-analyzer-agent`:

```text
Analyze the latest test results. Identify the root cause of every failure.
Provide a table of failures with Severity, Test ID, Cause, and Fix.
```

---

## Summary ✅

Congratulations! You have completed the workshop. You have:

- Built a full test automation project from scratch.
- Created custom GitHub Copilot Agents to do the heavy lifting.
- Used the Playwright MCP to explore and verify behavior live in a browser.
- Run tests and used an analyzer agent to triage results.

# Optional steps to continue

## Step 05-F — Debug Mode (Step-by-Step)

For a failing test, run it in debug mode to step through each action:

```bash
npx playwright test --debug -g "NEG-01"
```

Replace `"NEG-01"` with the test name or ID to filter. This opens the **Playwright Inspector**:

- Green highlight shows the currently executing action
- Left panel shows all actions in order
- You can pause, step forward, and inspect the DOM at any point

---

## Step 05-G — Run a Single Test by Name

```bash
npx playwright test -g "POS-02"
npx playwright test -g "full game lifecycle"
```

---

## Step 05-H — Triage Failures with the Report Analyzer Agent

After a test run, use the Copilot agent to analyse the JSON report and prioritise fixes.

### 1. Run tests and save results

```bash
npx playwright test --reporter=json 2>&1
```

The JSON output is written to `test-results/results.json`.

### 2. Open Copilot Chat in Agent mode

### 3. Attach the report and run the analyzer agent

```
#file:test-results/results.json
#file:workshops/agents/04-report-analyzer-agent.md
```

Send:

```
Analyse the test results in results.json using the instructions in the attached prompt.
Return the full prioritised failure report in Markdown.
```

### 4. Review the output

The agent returns a report like:

```markdown
# Rode Runner — Test Report Summary

## Executive Summary
| Metric | Value |
|--------|-------|
| Total Tests | 35 |
| Passed | 30 |
| Failed | 4 |
| Flaky | 1 |
| Pass Rate | 86% |

## Failures by Priority

### 🔴 P0 Critical
_(none)_

### 🟠 P1 High
- EDG-03 | Score display out of sync after rapid input

### 🟡 P2 Medium
- NEG-05 | Triple-jump detection timing too tight
- VIS-02 | Game-over screenshot diff (font rendering)

### 🟢 P3 Low
- AGENT-07 | Minor text mismatch in coin-display format

## Recommendations
1. EDG-03: Add a 100ms stabilisation wait before reading scoreDisplay
2. NEG-05: Use waitForFunction instead of fixed timeout
3. VIS-02: Update snapshot baseline after confirming layout is correct
```

---

## Step 05-I — Fix Failing Tests Using the Agent

For any P0 or P1 failure identified above, ask the agent to fix it:

```
Test EDG-03 is failing because the score display doesn't update fast enough.
Look at the test in tests/edge-cases.spec.js and suggest a fix using waitForFunction.
```

Apply the suggested fix, then re-run:

```bash
npx playwright test -g "EDG-03" --project=chromium
```

---

## Step 05-J — Generate Visual Baseline Snapshots

If you have screenshot regression tests (like `VIS-01`), run them once in update mode to create the baseline:

```bash
npx playwright test --update-snapshots
```

Then run normally to compare:

```bash
npx playwright test
```

On a mismatch, the report shows a pixel-diff overlay so you can see exactly what changed.

---

## Step 05-K — Run Tests in CI Mode

Simulate a CI environment locally:

```bash
CI=true npx playwright test
```

In CI mode:
- `retries` increases to 2
- Server is not reused between runs
- Test output is optimised for log files

---

## Step 05-L — Generate JUnit Report for CI Systems

The JUnit reporter is already configured in `playwright.config.js`. After a run, the file is at:

```
test-results/junit.xml
```

This XML can be consumed by **Jenkins**, **Azure DevOps**, **GitHub Actions**, and most CI platforms to display test results in the pipeline UI.

---

## Step 05-M — GitHub Actions Quick-Start (Optional)

To run your tests automatically on every push, create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run tests
        run: npm run test:all

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload JUnit results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: junit-results
          path: test-results/junit.xml
```

---

## Checkpoint ✅

Before finishing, confirm:

- [ ] `npm run test:all` completes without a crash
- [ ] HTML report opens at `http://localhost:9323`
- [ ] You can view a failure trace or screenshot in the report
- [ ] `test-results/results.json` exists after the run
- [ ] The analyzer agent returned a prioritised failure report
- [ ] All P0 failures are resolved (or there are none)

---

## Recap — The Full Agent Workflow

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  EXPLORE AGENT  │────▶│ SCENARIO AGENT   │────▶│   TEST GENERATOR │────▶│ REPORT ANALYZER  │
│  (Module 02)    │     │  (Module 03)     │     │   AGENT (Mod 04) │     │  AGENT (Mod 05)  │
│                 │     │                  │     │                  │     │                  │
│ • Navigates app │     │ • Reads src code │     │ • Reads scenarios│     │ • Parses JSON    │
│ • Finds elements│     │ • Designs tests  │     │ • Writes .spec.js│     │ • Triages bugs   │
│ • Maps behaviors│     │ • No code yet    │     │ • Verifies via   │     │ • P0/P1/P2/P3    │
│ • Uses MCP live │     │ • Structured doc │     │   MCP            │     │ • Recommends fix │
└─────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │                        │
        ▼                        ▼                        ▼                        ▼
  Discovery Table          Scenarios.md            .spec.js files          Report.md
```

---

**You have completed the workshop!** 🎉

Return to [README →](./README.md) for a summary, or continue refining your tests using the agent prompts.
