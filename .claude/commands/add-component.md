Add a new component to the design system (`packages/ui`).

Component name: $ARGUMENTS

**Deliverables (all three must land in the same feature branch):**

```
packages/ui/src/components/<name>.tsx          source — design-system-architect (step 1)
packages/ui/src/components/<name>.test.tsx     test   — unit-test-engineer     (step 4)
packages/ui/src/components/<name>.stories.tsx  story  — storybook-documenter   (step 5)
```

Multi-agent chain. Tests come **after** a11y + reviewer converges, otherwise reviewer-driven fixes (prop renames, accessible-name changes) invalidate just-written tests. Stories follow tests because they reference the final API too. Feature-worktree pattern from [`.claude/workflows/feature-worktree-protocol.md`](../workflows/feature-worktree-protocol.md): one shared worktree, one feature branch, one merge.

0. **Create the feature worktree before spawning any agent:**

   ```bash
   git worktree add -b feat/<component-name> .claude/worktrees/feat-<component-name> main
   ```

   Record the absolute path and branch name — every chained agent receives them.

1. Spawn `design-system-architect` with the component name AND these directives at the top of the prompt:

   ```
   FEATURE_WORKTREE: <abs path to .claude/worktrees/feat-<component-name>>
   FEATURE_BRANCH: feat/<component-name>
   ```

   It owns implementation, token mapping, and the `frontend-reviewer` loop inside the feature worktree (spec gate → implement → re-skin → register → reviewer loop → commit) per `.claude/agents/design-system-architect.md`. It does **not** author the test file — that is step 4.

2. After the architect returns (with `frontend-reviewer` PASS), spawn `accessibility-expert` to review the component files in the feature worktree. A11y review is not worktree-isolated — point it at the feature worktree path explicitly.

3. If the a11y review reports CRITICAL or MAJOR issues, re-spawn `design-system-architect` with the findings AND the same `FEATURE_WORKTREE` + `FEATURE_BRANCH` directives. Loop until only MINOR/none remain. **Do not proceed to step 4 until this loop converges** — tests written against a pre-fix API are throwaway work.

4. Spawn `unit-test-engineer` with the component name AND the same `FEATURE_WORKTREE` + `FEATURE_BRANCH` directives. It authors `<name>.test.tsx` against the finalized component per the doctrine in [`docs/testing/unit-testing-guidelines.md`](../../docs/testing/unit-testing-guidelines.md). The agent itself enforces query priority, `userEvent` over `fireEvent`, no class-name assertions, no `data-slot` lookups, no library re-testing.

5. Spawn `storybook-documenter` with the component name AND the same `FEATURE_WORKTREE` + `FEATURE_BRANCH` directives. Stories land in the same feature branch.

6. **Verify all three deliverables exist before merging:**

   ```bash
   ls <FEATURE_WORKTREE>/packages/ui/src/components/<name>.{tsx,test.tsx,stories.tsx}
   ```

   If any file is missing, do not proceed to the merge gate — re-spawn the responsible agent (architect for `.tsx`, `unit-test-engineer` for `.test.tsx`, storybook-documenter for `.stories.tsx`) with the gap explicitly named.

7. **Apply the merge gate from [`.state/phases.md`](../../.state/phases.md).** Read `.state/state.md` first for the current lifecycle phase.

   - **`greenfield`:** `git merge --no-commit --no-ff feat/<component-name>` from main, reload if there's runtime impact, commit the merge, then `git worktree remove -f .claude/worktrees/feat-<component-name>` and `git branch -d feat/<component-name>`.
   - **`production`:** `git push -u origin feat/<component-name>` and `gh pr create` — Kate merges. Do not auto-merge.

**Anti-pattern (do not do):** Dispatch the architect without creating the feature worktree first. The architect's auto-isolation worktree may seed from a stale ancestor of main, and downstream agents in the chain see divergent bases. Symptoms: agent reports "missing scaffolding" (test-setup.ts, tsconfig types) and `git diff main..<branch> --stat` shows large deletions. Recovery requires manual file copy — see `feedback_worktree_stale_base` memory.

**Anti-pattern (do not do):** Spawn `unit-test-engineer` before the a11y + reviewer loop converges. Reviewer-driven fixes change prop names, accessible names, and DOM structure — every such change invalidates already-written tests. The ordering is load-bearing.
