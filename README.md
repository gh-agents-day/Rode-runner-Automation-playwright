# 🏃 Rode Runner — Playwright & GitHub Copilot Agent Workshop

> **Audience:** Developers and QA engineers with basic JavaScript knowledge  
> **Duration:** ~3–4 hours  
> **What you start with:** Only the `src/` folder containing the game source code

---

## What You Will Build

Starting from a bare game source (`src/`), you will:

1. Set up a Playwright project from scratch
2. Configure the **Playwright MCP** server so GitHub Copilot can control a real browser
3. Build **custom GitHub Copilot agents** that explore the app, generate test scenarios, and write complete test suites
4. Run those tests and view the HTML report

By the end you will have a fully automated test pipeline — built almost entirely by AI agents that you directed.

---

## Workshop Modules

| Module | File | Time |
|--------|------|------|
| 00 — Prerequisites & Tooling | [00-prerequisites.md](workshops/00-prerequisites.md) | 20 min |
| 01 — Project Setup | [01-project-setup.md](workshops/01-project-setup.md) | 20 min |
| 02 — Explore the App with a Copilot Agent | [02-explore-with-agent.md](workshops/02-explore-with-agent.md) | 30 min |
| 03 — Generate Test Scenarios with a Custom Agent | [03-generate-scenarios.md](workshops/03-generate-scenarios.md) | 40 min |
| 04 — Generate Test Suites with a Custom Agent | [04-generate-test-suites.md](workshops/04-generate-test-suites.md) | 50 min |
| 05 — Run and Report | [05-run-and-report.md](workshops/05-run-and-report.md) | 20 min |


---

## Agent Prompt Files

Pre-built agent prompts live in `workshops/agents/`. You paste or attach them in Copilot Chat.

| Prompt | Purpose |
|--------|---------|
| [01-explore-agent.md](./agents/01-explore-agent.md) | Navigate the game live and map all testable behaviors |
| [02-scenario-agent.md](./agents/02-scenario-agent.md) | Produce a structured test-scenario document (no code yet) |
| [03-test-generator-agent.md](./agents/03-test-generator-agent.md) | Convert scenarios into runnable Playwright `.spec.js` files |
| [04-report-analyzer-agent.md](./agents/04-report-analyzer-agent.md) | Triage failures after a test run |

---

## Folder Structure You Will Create

```
(project root)
├── src/                          ← Provided — game source (do not modify)
│   ├── index.html
│   ├── styles.css
│   └── game.js
│
├── tests/                        ← You create this
│   ├── helpers/
│   │   └── GamePage.js           ← Page-Object Model helper
│   ├── positive.spec.js
│   ├── negative.spec.js
│   ├── edge-cases.spec.js
│   └── agent-generated.spec.js
│
├── .vscode/
│   └── mcp.json                  ← Playwright MCP server config
│
├── package.json
└── playwright.config.js
```

---

## Quick-Start (experienced users)

```bash
# 1. Install dependencies
npm install
npx playwright install chromium

# 2. Start game server
npx serve src -p 3000

# 3. Open VS Code, attach Copilot Chat, paste agents/01-explore-agent.md
# 4. Follow modules 02 → 05
```

---

*Happy testing! Keep running, keep shipping. 🏃*
