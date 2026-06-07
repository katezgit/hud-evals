# Visual QA — Screenshot Capture

> **When this fires:** on entry to the `design-qa` phase, after `implementation` is marked complete. This is the capture procedure that feeds the `design-qa` review doc.

## Two kinds of screenshots — different locations

| Kind | Who takes it | When | Location | Tracked in git? |
|---|---|---|---|---|
| **Ad-hoc audit capture** — engineer self-verifies a change mid-implementation ("does this look right?") | any engineer agent (`staff-frontend-engineer`, `design-system-architect`, `frontend-reviewer`, `accessibility-expert`) | any time during implementation | `.intermediate/audits/{topic}/{name}.png` | **No** — `.intermediate/` is gitignored. See [CLAUDE.md → Hard rules → "Intermediate vs canonical artifacts"](../../CLAUDE.md). |
| **Formal design-QA capture** — engineer captures for the designer's parity review | `design-system-architect` or `staff-frontend-engineer` | only on entry to the `design-qa` phase | `docs/design/reviews/screenshots/{feature}-{YYYY-MM-DD}/{screen}-{state}.png` | **Yes** — canonical record, cited from `docs/design/reviews/qa-{date}.md`. |

**The default for any engineer agent taking a screenshot is the ad-hoc / `.intermediate/` path.** Only the design-QA phase exit triggers the canonical capture, and only the two named engineers above are authorized to write to the canonical path.

The legacy `.claude/screenshots/` convention is **retired**. Existing tracked files there get cleaned up via the pre-PR consolidation workflow.

## Who runs what

- **Engineers** (design-system-architect or staff-frontend-engineer) capture screenshots.
- **Product-designer + motion-designer** review the captures against the approved screen spec and write the `design-qa` review doc.

Motion is NOT captured via screenshot — motion-designer drives the app live.

## Capture procedure — formal design-QA

1. Start the dev server. See [`auto-reload.md`](./auto-reload.md).
2. Drive the browser via the Chrome DevTools MCP (tools surface as `mcp__chrome-devtools__*`): navigate to the target route, force the state (empty fixture, throttled network for loading, injected error for error), then screenshot.
3. Save to:

   ```
   docs/design/reviews/screenshots/{feature}-{YYYY-MM-DD}/{screen}-{state}.png
   ```

## Capture procedure — ad-hoc audit

1. Start the dev server.
2. Drive the browser via Chrome DevTools MCP, take the screenshot.
3. Save to:

   ```
   .intermediate/audits/{topic}/{descriptive-name}.png
   ```

   where `{topic}` is the artifact under scrutiny (e.g. `button-hover-states`, `home-empty-loading`, `palette-contrast`). Use a descriptive filename so future-you can navigate the folder without opening each file.

4. **Do not commit.** `.intermediate/` is gitignored. If you need to share with the Operator, paste the file path in your response — they'll open it locally.

## States per screen

Capture: `default`, `empty`, `loading`, `error`.

Skip `success` and `disabled` unless the screen spec explicitly calls them out.

## Viewport

- Default: **1440×900** (desktop).
- Additionally **390×844** (mobile) if the spec defines a mobile breakpoint.

## Review doc

Product-designer writes `docs/design/reviews/qa-{YYYY-MM-DD}.md`, embedding each screenshot alongside a diff vs the screen spec. The state machine already names this path — do not rename it.

## Exit criteria

- Every captured screen passes parity vs its spec, **OR**
- Every delta is logged as a follow-up task via the Artifact Rule.

No partial pass. A captured-but-unreviewed state blocks phase exit.
