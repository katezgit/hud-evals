# Testing TODOs

## Token Cleanup: `bg-elevated` / `bg-muted` Collision

`--color-elevated` and `--color-muted` resolve to identical hex (`#F0F2F6` light, `#161D28` dark) — two tokens, one color. Surface ladder collapsed at one rung. Surfaced during the table density work: Pattern A's bordered wrapper had to use `bg-card` (white) instead of the semantically-obvious `bg-elevated`, because a `bg-muted` `<thead>` against a `bg-elevated` body produces zero contrast.

Also: in light theme `bg-elevated` (`#F0F2F6`) is **darker** than `bg-background` (`#F6F8FA`) — so the token name "elevated" actually paints down-tier, inverted from typical convention.

### Tasks

- [ ] Audit every consumer of `bg-elevated` across `apps/**` + `packages/**`; classify each as "needs white surface" (→ `bg-card`) or "needs gray band" (→ `bg-muted`)
- [ ] Migrate consumers per audit
- [ ] Delete the `--color-elevated` token + the `bg-elevated` utility from `packages/ui/src/styles/primitive.css`
- [ ] Add a visual regression check (Chromatic story) showing the surface ladder so the next addition can't reintroduce a duplicate
- [ ] Update `docs/conventions/token-architecture.md` documenting the resolved ladder: `background → card → muted → secondary`

## Visual Testing: Chromatic Sample

Set up a working Storybook + Chromatic visual testing example.

### Tasks

- [ ] Install `@chromatic-com/storybook` addon
- [ ] Configure Chromatic project token
- [ ] Add visual test for a sample component (e.g., Button with all variants)
- [ ] Verify visual diff shows in Storybook sidebar (accept/reject workflow)
- [ ] Add Chromatic step to CI pipeline (GitHub Actions)
- [ ] Document the setup in `visual-testing.md`
