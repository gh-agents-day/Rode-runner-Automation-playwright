# Module 01 — Project Setup

> **Goal:** Create all project scaffolding so Playwright can discover and run tests.  
> You should be in the **project root** (the folder that contains `src/`) for every command in this module.

---


## Step 01-A — Install Dependencies

```bash
npm install
```

This installs `@playwright/test` and the `serve` static-file server.

---

## Step 01-B — Install Playwright Browsers

```bash
npx playwright install chromium
```

> For the full browser suite (Chromium + Firefox + WebKit) run `npx playwright install` without arguments. The download is ~300 MB.

Verify the installation:

```bash
npx playwright --version
```

Expected: `Version 1.44.x` or higher.
---

## Step 01-C — Smoke Test the Setup

Start the game server in one terminal:

```bash
npm run serve
```

Open a second terminal and run:

```bash
npx playwright test --project=chromium --list
```

Expected: command runs without errors (no tests yet, but Playwright found the config).

Open the [VS Code integrated browser](https://code.visualstudio.com/docs/debugtest/integrated-browser). Press Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (macOS), type "Browser: Open Integrated Browser", and press Enter.

Then navigate to `http://localhost:3000` in the integrated browser, share it with agent, and verify the game loads with a canvas and a **START GAME** button.

---

## Checkpoint ✅

Before moving on, confirm:

- [ ] `npm install` completed without errors
- [ ] `npx playwright --version` prints `1.44.x` or higher
- [ ] `playwright.config.js` exists in the project root
- [ ] `tests/helpers/GamePage.js` exists
- [ ] `http://localhost:3000` shows the Rode Runner game
- [ ] Browser DevTools console shows `window.__gameState` is available (type `window.__gameState.getState()` — should return `"idle"`)

---

**Next:** [02 — Explore the App with a Copilot Agent](./02-explore-with-agent.md)
