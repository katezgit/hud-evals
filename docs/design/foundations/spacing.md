# Spacing

Personality posture is **spare and dense** (see `docs/product/personality.md`). Alex arrives mid-investigation; Sam is triaging a regression on a deadline. Gaps that read as "comfortable" in a consumer product read as "bloated" here. Every spacing value is the tightest value that avoids a collision — not the most comfortable value that still works.

---

## Canon

`--spacing: 0.25rem` is declared explicitly at `packages/ui/src/styles/primitive.css:122`. Tailwind v4 does not ship a default `--spacing`; HUD declares it so that every `gap-N`, `p-N`, and `m-N` utility derives from the same 4px base unit without ambiguity.

| Token | REM | PX | Canonical usage |
|---|---|---|---|
| `spacing-1` | 0.25rem | 4px | `mb-1` title → description; micro vertical stacks |
| `spacing-1.5` | 0.375rem | 6px | DropdownMenu item padding; button icon gap; form: label ↔ control gap |
| `spacing-2` | 0.5rem | 8px | Inline siblings (button + label, badge + dot); Input internal padding; form actions-row button gap |
| `spacing-3` | 0.75rem | 12px | Alert icon ↔ content gap; `px-3` in form-field controls |
| `spacing-4` | 1rem | 16px | `gap-4` between blocks; card/alert padding; form: field ↔ field |
| `spacing-6` | 1.5rem | 24px | `gap-6` between sections inside a panel; form: last field ↔ actions row |
| `spacing-8` | 2rem | 32px | `gap-8` between major regions; `pl-8` left-icon inset offset |

---

## Off-scale (drift)

Tailwind ships `spacing-5` (20px), `spacing-7` (28px), `spacing-9` (36px), `spacing-10` (40px), and higher multiples by default. HUD's canonical scale skips them entirely. If you reach for a 20px gap, the answer is almost always 16px (`gap-4`) or 24px (`gap-6`); the layout that "wants" 20px is usually a rhythm error somewhere else — a missing wrapper, a wrong padding on a sibling, or an attempt to paper over misaligned content. Reviewer FAILs `gap-5`, `p-7`, `gap-9`, `gap-10`, and arbitrary values like `gap-[18px]`.

---

## Composition cheatsheet

**Forms**
- Label ↔ control: 6px / `gap-1.5`
- Field ↔ field: 16px / `gap-4`
- Last field ↔ actions row: 24px / `gap-6`
- Actions row button gap: 8px / `gap-2`

**Cards / panels**
- Internal padding: 16px / `p-4` (compact cards) or 24px / `p-6` (spacious panels)
- Section within a panel: 24px / `gap-6`
- Block within a section: 16px / `gap-4`

**Page**
- Major regions (e.g. header → content, content → sidebar): 32px / `gap-8`
- Sections within a region: 24px / `gap-6`
- Blocks within a section: 16px / `gap-4`

**Inline**
- Icon ↔ label: 6px / `gap-1.5` (small icons) or 8px / `gap-2` (standard icons)
- Badge ↔ dot or sibling badge: 8px / `gap-2`
- Title ↔ description (single header unit): 4px / `gap-1`

---

## Relation to other foundations

**Header rhythm** (`docs/design/foundations/header-rhythm.md`) — the title column owns 4px (`gap-1`) between title and description; breadcrumb ↔ title is 12px (`gap-3`) left inline at the outer `<header>`; meta-row items are 8px (`gap-2`). These are specializations of the canonical scale above, not overrides.

**Page shell** (`page-shell` utility) — owns browser-edge ↔ header (`py-6`, 24px) and header ↔ content (`gap-6`, 24px). These compose with this scale without conflict: `page-shell` sets the outermost rhythm; the tokens here govern everything inside the content region.
