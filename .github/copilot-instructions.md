---
name: Playwright Test Generator Agent Instructions
description: Playwright test generator agent instructions. These guidelines will be followed by the Rode Runner Test Generator Agent when generating test code.
applyTo: '**/tests/**/*.spec.js' # this instruction applies to any file ending with .spec.js in the tests/ folder or its subfolders
---
1. **File header** — every file starts with:
    ```javascript
    // @ts-check
    'use strict';

    const { test, expect } = require('@playwright/test');
    const { GamePage }     = require('./helpers/GamePage');
    ```

  2. **Test ID prefix** — each test has a unique ID in the description:
    - Positive: `POS-01`, `POS-02`, …
    - Negative: `NEG-01`, …
    - Edge cases: `EDG-01`, …
    - Agent-generated: `AGENT-01`, …

  3. **Always call `await game.goto()`** as the very first statement in every test.

  4. **Use `getByTestId()`** via the GamePage locators — never CSS class selectors.

  5. **State changes must use `waitForFunction()`** — never `page.waitForTimeout()` for assertions.

  6. **Wrap related tests in `test.describe()`** blocks.

  7. **Use `toBeVisible()` / `toBeHidden()`** for element visibility assertions.

  8. **Screenshot tests** use `toHaveScreenshot('filename.png')`.