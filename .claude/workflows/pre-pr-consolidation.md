# Pre-PR Consolidation

> **When this fires:** any turn that is about to dispatch `release-manager` to open a PR or merge one, after the session's design + engineering iterations have landed. Run BEFORE the commit-and-push dispatch.

During a session, designers and engineers produce intermediate artifacts — polish specs, audit reports, HTML mockups, reviewer reports. Each captures a decision-state at a moment in the session. Operator iterations downstream often supersede those values (operator accepts a tactic, then rejects it after seeing it live, then picks a third option). If intermediates ship alongside the merged code, future readers see fragmented decision records that disagree with the canonical wireframe and DS specs.

The rule: **canonical docs must reflect the shipped state. Intermediates fold in, then delete.**

> **Scope note — `.intermediate/` is gitignored.** Under [CLAUDE.md → Hard rules → "Intermediate vs canonical artifacts"](../../CLAUDE.md), HTML previews, drafts, and discovery WIP live at `.intermediate/` and never enter the PR. This workflow now only handles:
> - **Legacy paths** — anything left over from before the rule landed (`docs/design/mockups/`, `docs/design/audits/`, `docs/design/screens/[feature]/audits/`).
> - **Leakage** — anything that violated the rule and accidentally landed in `docs/`. The fold pass still folds the decision into canonical and deletes the violation.
>
> Going forward, expect this workflow's surface area to shrink. The table below preserves the legacy paths for cleanup of work that predates the rule.

## Classification

| Artifact type | Action | Target canonical |
|---|---|---|
| Polish spec (`docs/design/screens/[feature]-polish.spec.md`) | Fold + delete | `docs/design/screens/[feature].wireframe.md` (and `.screen.md` if it exists) |
| Spacing / a11y / domain audit (`docs/design/audits/[feature]-*-audit.md`) | Fold decisions; delete OR archive | Wireframe + foundation docs (e.g. `docs/design/foundations/spacing.md`) |
| Per-page audit folder (`docs/design/screens/[feature]/audits/*.md`) | Fold decisions into the wireframe's Decisions Log; `git rm -r` the folder | Wireframe |
| Operator-supplied reference screenshots (`docs/design/screens/[feature]/_round*-refs/*.png`) | `git rm -r` the folder — they served iteration and are no longer needed | n/a — wireframe captures the decisions they informed |
| Variant exploration HTMLs (`docs/design/audits/[feature]-variant-[a-e].html`, `[feature]-variants.{html,md}`, `[feature].implementation.html`) | Fold the chosen variant's rationale + `git rm` | Wireframe Decisions Log |
| HTML mockup driving a final pick (`docs/design/mockups/[component].html`) | Fold chosen pattern's spec values + delete (or keep only the approved variant) | `docs/design/components/[name]/spec.md` |
| Reviewer report (`docs/design/reviews/[feature]-frontend-review.md`) | Archive OR delete — fixes already in code | n/a — fixes live in code |
| Ad-hoc audit screenshots (`.intermediate/audits/*.png` — current) or (`.claude/screenshots/*.png` — legacy, retired) | Already gitignored under `.intermediate/`. `git rm` any tracked legacy `.claude/screenshots/` leftovers. | n/a — verification-only, never source |
| New pattern doc (`docs/design/components/[primitive]/patterns.md`) | Keep as canonical | This IS canonical |
| Design-QA screenshot diff (`docs/design/reviews/qa-[date].md`) | Archive | n/a — historical record |

When in doubt: if a future reader needs the file to answer "what should this surface look like?", keep it. If the answer is "what was the in-session reasoning?", delete or archive.

## Process

The orchestrator runs this BEFORE the commit-and-push dispatch:

1. **Inventory intermediates — enumerate every path, not just one folder.** Run all of these against `git diff --name-only origin/main...HEAD` (and `git ls-files` for tracked items the diff would miss):

   ```sh
   git diff --name-only origin/main...HEAD | grep -E '
     ^docs/design/screens/.*/(audits|_round.*-refs)/
   | ^docs/design/audits/<feature-slug>
   | ^docs/design/mockups/<feature-slug>
   | \.implementation\.html$
   | -variant-[a-e]\.html$
   | -variants\.(html|md)$
   '

   # Plus tracked screenshots anywhere in the worktree:
   git ls-files | grep -E '\.(png|jpe?g|gif|webp)$' | grep -v 'docs/design/current-design/'

   # Plus the page-local audits folder if present:
   git ls-files | grep -E "^docs/design/screens/[^/]+/audits/"
   ```

   The variant HTMLs in particular live in `docs/design/audits/` (NOT `docs/design/screens/<feature>/audits/`) and are routinely missed by designer-side consolidation passes that only sweep the per-feature folder. Enumerate both.

2. **Classify each.** Apply the table above.

3. **Dispatch `product-designer`** for the fold pass. The brief must:
   - List each intermediate to fold by **exact path** — never "consolidate intermediates" or "fold audits" without enumerating the file list, because designers default to cleaning only their immediate working folder.
   - Cite both `docs/design/screens/<feature>/audits/` AND `docs/design/audits/<feature>-*` and `docs/design/mockups/<feature>-*` when applicable — they are parallel locations and both must be cleaned.
   - Instruct the designer to **cross-reference current code state** for every value — operator iterations may have superseded the spec's values.
   - Instruct the designer to `git rm` / `git rm -r` the intermediate after folding (deletions are part of the same commit as the fold).
   - Require a final grep to confirm no other doc references the deleted file.

4. **Dispatch screenshot cleanup separately if needed.** If step 1 surfaced tracked images, dispatch `release-manager` for a `git rm` commit BEFORE the PR commit. `.gitignore` already excludes `.claude/screenshots/` at the repo level — the cleanup is for files that became tracked before that rule landed (or before the engineer's no-screenshot-commit rule was in their default brief).

5. **Verify the fold.** Read the canonical doc's affected sections. Catch any drift between (a) what designer folded, (b) what code actually ships. Designer can mis-fold by trusting stale spec values — orchestrator re-derives by reading current code. Round-trip until clean.

6. **Re-run step 1 inventory** to confirm nothing remains. The most common failure mode for this workflow is "consolidation pass cleaned one folder, missed the parallel one" — the operator catches it in the PR diff and the orchestrator dispatches another cleanup commit. Avoid this by re-running the inventory greps after the designer returns and BEFORE dispatching release-manager.

7. **Only then** dispatch `release-manager` to stage + commit + push.

## Anti-patterns

- **Shipping intermediates alongside merged code.** Creates two sources of truth that diverge over time. Future audits flag drift.
- **Designer folds spec values without checking code.** Operator's iterations during the session supersede the original spec. The wireframe must reflect what's shipped, not what was designed.
- **Deleting historical artifacts (reviewer reports, QA screenshots) just because they're "intermediate."** Some intermediates have ongoing reference value as point-in-time records. Use the classification table; don't blanket-delete.
- **Doing this consolidation after the PR is merged.** Possible but loses the natural review surface; reviewers see the cleaned canonical state on the merge PR, not after.

## When to skip

- Pure code change with no design artifacts touched.
- Single-commit hotfix that didn't produce intermediates.
- Operator explicitly says "ship as-is, no consolidation" — rare; honor it.
