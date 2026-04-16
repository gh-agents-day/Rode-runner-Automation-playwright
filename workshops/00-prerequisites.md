# Module 00 — Prerequisites & Tooling

> **Goal:** Verify that every required tool is installed and working before the workshop begins.

---

## Required Tools

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 18.x or higher | https://nodejs.org |
| npm | 9.x or higher | Bundled with Node |
| VS Code | Latest stable | https://code.visualstudio.com |
| GitHub Copilot extension | Latest | VS Code Marketplace |
| GitHub Copilot Chat extension | Latest | VS Code Marketplace |

---

## Step 00-A — Verify Node.js and npm

Open a terminal and run:

```bash
node --version
```

Expected output: `v18.x.x` or higher.

```bash
npm --version
```

Expected output: `9.x.x` or higher.

> If Node is missing, download the LTS installer from https://nodejs.org and re-run the checks above.

---

## Step 00-B — Install VS Code Extensions

1. Open VS Code.
2. Click the **Extensions** icon in the sidebar (or `Ctrl+Shift+X`).
3. Search for **GitHub Copilot Chat** and install it.
4. Sign in with your GitHub account when prompted.

Verify the extension is active — you should see the Copilot icon (✦) in the VS Code status bar.

---


## Step 00-C — Enable Playwright MCP in VS Code

The **Playwright MCP** (Model Context Protocol) server gives Copilot the ability to navigate web pages, click elements, take screenshots, and run JavaScript — all from the Chat panel.

1. In VS Code Settings (`Ctrl+,`), search for `chat.mcp.enabled`.
2. Set it to **true**.
3. Restart VS Code completely so the setting takes effect.

---

## Step 00-D — Create the MCP Config File

Install the Playwright MCP server globally or install via VS Code MCP gallery.

```json
{
  "servers": {
    "microsoft/playwright-mcp": {
			"type": "stdio",
			"command": "npx",
			"args": [
				"@playwright/mcp@latest"
			],
			"gallery": "https://api.mcp.github.com",
			"version": "0.0.1-seed"
		}
  }
}
```

> This tells VS Code to launch the Playwright MCP server automatically when Copilot Chat starts.

---

## Step 00-E — Verify MCP is Connected

1. Open Copilot Chat (`Ctrl+Shift+I`).
2. Click the **Tools** (🔧) icon in the chat toolbar.
3. You should see a section labelled **playwright** with tools like:
   ---

**Next:** [01 — Project Setup](./01-project-setup.md)
   - `playwright_screenshot`
   - `playwright_click`
   - `playwright_evaluate`

> ✅ If those tools appear, MCP is connected. If not, see the [Troubleshooting](#troubleshooting) section below.

---

## Step 00-G — Inspect the Source Code

Your starting material is the `src/` folder:

```
src/
├── index.html    ← Game HTML with data-testid attributes on every element
├── styles.css    ← All styles (not relevant to testing)
└── game.js       ← Game engine + window.__gameState test API
```

Open `src/index.html` and notice the `data-testid` attributes — these are the stable selectors your tests will use:

| Attribute | Element |
|-----------|---------|
| `game-canvas` | The canvas where the game renders |
| `start-button` | The button that starts the game |
| `replay-button` | Shown after game over |
| `score-display` | Live score number |
| `coin-display` | Coins collected |
| `best-display` | Personal best score |
| `game-hud` | Top UI bar |
| `game-overlay` | Start / Game-Over overlay panel |
| `powerup-display` | Active power-up badges |

Open `src/game.js` and locate `window.__gameState` near the bottom. This object exposes:

```javascript
window.__gameState.getState()       // "idle" | "playing" | "dead"
window.__gameState.getScore()       // number
window.__gameState.getLives()       // 0–3
window.__gameState.isPlaying()      // boolean
window.__gameState.getPlayerY()     // pixel Y on canvas
window.__gameState.isDucking()      // boolean
window.__gameState.hasShield()      // boolean
window.__gameState.triggerStartGame()
window.__gameState.forceGameOver()
window.__gameState.setLives(n)
```

> This API is your "test surface" — use it inside `page.evaluate()` calls.

---

## Troubleshooting

### MCP tools do not appear in Chat

- Make sure `chat.mcp.enabled` is `true` in Settings.
- Confirm `.vscode/mcp.json` exists and is valid JSON.
- Restart VS Code completely (not just reload window).
- Run `npx @playwright/mcp@latest --help` in a terminal to confirm the package is accessible.

### Node version too old

- Use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to switch versions.

---

**Next:** [01 — Project Setup →](./01-project-setup.md)
