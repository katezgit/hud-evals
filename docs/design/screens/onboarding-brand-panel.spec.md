# BrandPanel — Typography Spec

**Surface:** `apps/portal/src/app/(onboarding)/onboarding/_components/brand-panel.tsx`
**Context:** Marketing/pitch context — pinned dark-teal left column, `lg:w-[45%]`, shown only to unauthenticated visitors entering the signup flow. Not a dashboard surface.
**Viewport:** ≥1024px only. At 1280px, the panel is ~576px wide; at 1440px, ~648px.

---

## Decision: arbitrary values, not new tokens

Single caller (`brand-panel.tsx`) with no downstream reuse. Adding named tokens (`--text-marketing-headline`, `--text-marketing-body`) extends the portal's `@theme` vocabulary for zero benefit — no second consumer exists, and the in-app text ladder is already calibrated for dashboard density. Arbitrary values keep the decision local and visible at the call site.

**If a second marketing surface appears (e.g., a post-cancellation re-engage panel), promote at that point.**

---

## Typography ladder

### Existing in-app scale for reference

| Token | px | Role |
|---|---|---|
| `text-meta` | 10px | micro labels, mono chrome |
| `text-label` | 12px | form labels, mono data |
| `text-body` | 14px | primary reading size |
| `text-subtitle` | 16px | section anchors |
| `text-display` | 24px | page / hero display |

The BrandPanel needs a headline well above `text-display` (24px) to register as a marketing pitch to visitors who haven't interacted with the product yet — including Alex, who, at this stage, is not yet 40 minutes into a problem. He just signed up. The platform still needs to earn that first session.

---

## 1. Headline — "The platform for building RL environments"

**Current:** `text-display font-medium tracking-tight` → 24px / 32px line-height / −0.02em tracking

**Specified:**

```
text-[42px] leading-[1.1] font-medium tracking-[-0.03em]
```

- **Size: 42px.** At ~576px panel width, 42px wraps the headline to roughly 3 lines without crowding. 48px (the conventional "big hero" number) would force 3 tight lines; 36px would read as large-in-app but not marketing-grade. 42px hits the register of Linear's marketing headlines and Vercel's homepage `h1` (`~44–48px`) while staying proportional to the panel width. Precise, not ornamental.
- **Line-height: 1.1 (46px at 42px).** Tighter than `leading-tight` (1.25) because at 40px+ the default leading accumulates too much air for a column this narrow. 1.1 keeps visual mass without the lines colliding. The personality is "composed" not "airy."
- **Weight: `font-medium` (500).** Unchanged. Alex reads `font-bold` as marketing puffery; `font-medium` at 42px reads as confident without performing confidence. This is the Linear posture: their marketing page headings at large sizes stay at 400–500 weight.
- **Tracking: −0.03em.** Slightly tighter than `text-display`'s −0.02em because larger type needs more compression to not appear loose. Standard practice at 40px+. Do not go to −0.04em — that's editorial/fashion, wrong tone.
- **Rationale for personas:** Alex will read the headline in under 500ms and decide if HUD is worth the form. "The platform for building RL environments" is exact and functional. The size earns his attention without flattering him. Sam and Riley both read "RL environments" as signal this is an infrastructure product, not a general-purpose tool. No one is being cajoled.

---

## 2. Paragraph (description)

**Current:** `text-body max-w-[280px]` → 14px / 22px line-height

**Specified:**

```
text-[17px] leading-[1.6] max-w-[340px]
```

- **Size: 17px.** 16px is the standard "marketing body" floor; 17px adds one step of legibility without visually competing with the headline. 14px (`text-body`) reads as in-app caption in this context — too tight for a visitor's first encounter with the platform value prop. 18px starts to feel like a landing page pitch deck. 17px is the precise number: readable, calm, not amplified.
- **Line-height: 1.6 (27.2px).** Generous for a marketing paragraph — more vertical rhythm than the dashboard's 1.375 (`text-body`). The personality is "composed, deliberate" — comfortable spacing signals the platform isn't hurried. This tracks Vercel and Linear's prose rhythm at this size.
- **max-width: 340px.** The current 280px is calibrated for 14px text at ~42–45ch. At 17px, 280px yields only ~30ch — too short for natural English sentences, forces excessive line breaks. 340px gives ~36–38ch, which is the correct reading width for body copy at this size. Still short enough to stay comfortably within the 576px panel with margin.

---

## 3. Metric labels + values (decorative, aria-hidden)

**Current:** `font-mono text-label` (12px) for both label column and value column

**Specified:** No change — stay at `text-label` (12px).

**Rationale.** These are explicitly `aria-hidden` decorative telemetry — they are texture and context, not pitch copy. Keeping them at 12px creates a deliberate size contrast between the headline (42px) and the decorative chrome (12px). Growing the metrics proportionally would make them visually compete with the paragraph and blur the hierarchy: a visitor's eye should read headline → paragraph → (notice the telemetry as ambient richness). The contrast is the point. The personality adjective "traceable" lives here — even at 12px, `0.7341` and `$0.0043` are exact values that a technical reader immediately recognizes as real.

---

## 4. Footer "hud-platform · enterprise infrastructure"

**Current:** `font-mono text-meta` (10px)

**Specified:** No change — stay at `text-meta` (10px).

**Rationale.** The footer is a legal/brand footnote, not communication. `text-meta` is the right tier: ambient, non-competing, chrome. Growing it with the headline would promote it into the reading hierarchy where it doesn't belong. The `aria-hidden` on this element confirms it's pure decoration. "Enterprise infrastructure" at 10px reads like a serial number on hardware — exactly right for HUD's composed, earnest personality. It should not be the first thing a visitor reads, and at 10px it won't be.

---

## 5. BrandMark wordmark sizing

**Current:** BrandMark default — 26px square mark, `text-[14px]` wordmark, `font-mono font-semibold tracking-[.06em]`

**Specified:** No change.

**Rationale.** The BrandMark is a navigation anchor at the top of the column, not a hero element. It is above the headline in the DOM and serves as brand identification, not pitch. Bumping it would create two competing "brand" moments (mark + headline). The 26px mark is already substantial on a dark panel. The personality is "spare" — the mark does its job and gets out of the way. No size bump.

---

## 6. Gap rhythm between sections

**Current:** Outer wrapper `gap-12` (48px), headline block `gap-4` (16px), metrics `mt-12 gap-2`

**Specified:**

```
Outer wrapper: gap-16 (64px)
Headline block: gap-5 (20px)
Metrics: mt-16 gap-2 (unchanged gap-2 within metric rows)
```

- **Outer wrapper gap-12 → gap-16 (48px → 64px).** With the headline growing from 24px to 42px, the vertical mass of the headline block increases substantially. gap-12 was calibrated for a 24px headline; at 42px + 1.1 leading the block is visually much heavier. gap-16 restores the proportional breathing room between the BrandMark, the headline block, and the metrics section.
- **Headline block gap-4 → gap-5 (16px → 20px).** At 17px body text with 1.6 line-height, the paragraph starts ~27px below the baseline of the last headline word. gap-4 (16px) was right for 14px body. gap-5 gives a single step of additional space proportional to the taller body text — prevents the paragraph from feeling clinched to the headline.
- **Metrics mt-12 → mt-16.** Tracks the outer wrapper gap increase for consistency. The metrics block is already visually separate (aria-hidden, size contrast); mt-16 keeps that separation proportional.
- **Metric row gap-2 (8px): unchanged.** The bar-label rhythm within the metric rows is correct as-is. Each row is 12px type; 8px between rows reads as tight-but-intentional telemetry, which is the right register.

---

## Implementation summary — diff from current

| Element | Current classes | Change |
|---|---|---|
| Headline `h2` | `text-display font-medium tracking-tight` | → `text-[42px] leading-[1.1] font-medium tracking-[-0.03em]` |
| Paragraph `p` | `max-w-[280px] text-body` | → `max-w-[340px] text-[17px] leading-[1.6]` |
| Metric labels/values | `font-mono text-label` | No change |
| Footer | `font-mono text-meta` | No change |
| BrandMark | default | No change |
| Outer `div` | `flex flex-col gap-12` | → `flex flex-col gap-16` |
| Headline block `div` | `flex flex-col gap-4` | → `flex flex-col gap-5` |
| Metrics `div` | `mt-12 flex flex-col gap-2` | → `mt-16 flex flex-col gap-2` |

No new CSS tokens. No changes to `apps/portal/src/app/globals.css` or `packages/ui/src/styles/`.
