Add or clean up unit tests for a component or library.

Target: $ARGUMENTS

This command is a dispatch to `unit-test-engineer`. The agent owns all `**/*.test.{ts,tsx}` work per [CLAUDE.md ownership table](../../CLAUDE.md) and applies the doctrine in [`docs/testing/unit-testing-guidelines.md`](../../docs/testing/unit-testing-guidelines.md).

## Process

1. Spawn `unit-test-engineer` with the target path.

   - If the target is a file (`packages/ui/src/components/button.tsx`): author or update its co-located `*.test.{ts,tsx}`.
   - If the target is a directory: scan for `*.test.{ts,tsx}` files in scope; clean them up against the doctrine; flag components that have none with a one-line reason whether a test is warranted.
   - If the target is "all" or empty: agent decides scope and reports plan in its first message.

2. The agent runs gates (`test`, `check-types`, `lint`) before returning. If gates fail, it fixes the tests and re-runs — it does not patch source code. Source defects are returned to orchestrator for the path-owning engineer.

## Out of scope for this command

- **E2E tests** — use `/test:e2e` and `test-agents`.
- **Visual regression** — Chromatic, not unit tests. Don't ask the agent to assert visual properties (colors, spacing, sizes).
- **Source code changes** — `unit-test-engineer` never edits the file under test. If a test reveals a defect, route to the path-owning engineer (`design-system-architect` for `packages/ui/**`, `library-engineer` for `packages/libs/**`, `staff-frontend-engineer` for `apps/**`).
