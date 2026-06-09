# Card Usage — Anti-Pattern Guardrails

**Scope:** When a designer or engineer reaches for a `<Card>` wrapper. Governs whether the card is doing real work or adding visual chrome. Applies to all dashboard surfaces — index pages, detail pages, modals, drawers, settings, empty states.

---

## 1. The rule

> **A card is a load-bearing visual container that represents a discrete object the user can act on as a unit. Use it only when the content meets all three criteria below.**

Criteria — the content inside the card must:

1. Be a **discrete object** with a stable identity (a model, a job, a taskset, a credit balance, an environment).
2. Be **actionable as a unit** — the user can click it, hover it, select it, or take an action against the whole thing.
3. **Sit alongside peers** of the same shape — cards earn their chrome by being one of N similar containers the user scans across.

If any criterion fails, the card is decoration. Remove it.

---

## 2. Rationale

HUD is a developer dashboard for technical users (Alex the RL researcher, Sam the applied agent engineer, Riley the environment vendor). Every screen is read by someone fluent in JSON, comfortable with CLI output, and impatient with marketing-style visual softness. The peer products — Linear, Vercel's developer dashboard, Weights & Biases — earn trust through **information density, fast scan, and quiet chrome**. Bento-grid card landscapes belong on marketing sites.

A card carries cost:

- **Padding** — every card eats `space-md` to `space-lg` of inner padding plus outer gap. Three nested cards on a page can cost 80–120px of vertical real estate that should be data.
- **Border / elevation / radius** — visual weight that competes with the content for the eye's attention. A page with 8 cards has 8 frames; the user pays scan cost to confirm each frame is empty of meaning.
- **Implied hierarchy** — wrapping content in a card tells the user "this is an object." If it isn't an object, the card is a lie. The user spends a moment confused before moving on.
- **Reduced density tier** — a screen calibrated to "comfortable" density becomes "spacious" the moment everything gets a card; the design intent silently shifts.

The pattern this guideline rejects: **card-as-default-container**, where every section, every metric, every list, every form gets wrapped because "it groups things." Grouping is a job for spacing, headings, dividers, and tinted backgrounds — not cards. Reach for the lightest tool that does the job.

---

## 3. When to use a card — green-light examples

- **Index page list items.** A row in a list of models, jobs, tasksets, environments where each row is a discrete object the user can navigate into. The card is the affordance.
- **Selection grid.** A "pick one" interface — environment template picker, taskset template gallery — where each card represents one of N peer choices.
- **Resource summary widget on a dashboard.** A self-contained module like "Credit balance" or "Active jobs" that has internal structure (label + value + delta + sparkline) and can be hovered/clicked as one unit.
- **KPI tile.** A metric with a name, a value, a delta, and optionally a baseline — see `dashboard-design-guidelines.md`. These earn their chrome because they're peer tiles scanned together.
- **Discrete authoring objects.** A task in a taskset editor, a grader rule in a grader builder — things the user adds, edits, deletes, reorders.

---

## 4. Anti-patterns — red-light examples

Each is a case where designers default to a card and the right answer is **no card**.

### 4.1 The single-stat card

> A card with one piece of data inside (e.g., "Total runs: 42,381").

Fix: render the label + value as plain typography. Use type weight and size to establish the value's prominence. A card around a single number adds no information; the page background and a heading do the same job for free.

### 4.2 The page-wide card

> Wrapping the entire main content area in a card "to contain it."

Fix: the page itself is the container. The `<main>` element, the app-shell layout, and the page margin already provide the bounds. A page-wide card is a frame around the canvas — it tells the user nothing and costs ~24px of padding on every edge.

### 4.3 The card-around-a-heading-section

> A card wrapping a section that already has a heading ("Configuration", "Runs", "Logs", etc.).

Fix: the heading is the divider. A divider line below the heading, or generous top padding before the next section, separates content cheaper than a card border. Cards under headings imply each section is an *object*, which sections are not.

### 4.4 Nested cards

> A card containing one or more other cards.

Fix: collapse to one level. Either the outer card has weight (and the inner ones become plain blocks) or the inner ones have weight (and the outer card is removed). Two frames around the same content is one frame too many — the eye cannot tell which boundary matters.

### 4.5 The list-wrapped-in-a-card

> A `<ul>` or table inside a card "to keep it tidy."

Fix: lists and tables have their own structural rhythm — row borders, alternating backgrounds, headers, column rules. Adding a card around them double-frames the content. If the list needs visual grouping, use a tinted section background or a top/bottom divider rule.

### 4.6 The form-in-a-card on a form page

> A settings page or resource creation page where the entire form is wrapped in a card.

Fix: on a dedicated form page, the page IS the form. Section headings + spacing handle grouping. Card-wrapping is reserved for forms inside modals, drawers, or as one form among several peer forms on a parent page.

### 4.7 The card-as-spacer

> Adding a card to create visual separation between two blocks because spacing alone "feels too empty."

Fix: bump the spacing token. If `space-lg` feels insufficient, use `space-xl`. Empty space is a feature for technical users, not a bug — it lowers visual density and gives scan-resting points. Don't fill space with chrome.

### 4.8 The empty-state card

> A card containing an empty-state illustration + heading + CTA on a page that has no other content yet.

Fix: render the empty state directly on the page background, centered in the content area. See `empty-and-error-states.md`. The card adds no information when there's nothing else to separate it from.

### 4.9 The status-banner-as-card

> An alert, banner, or notice rendered as a card.

Fix: use the `<Alert>` component or a tinted banner. Alerts have their own visual semantics (icon, color, role) that a generic card flattens. Reaching for `<Card>` for a warning loses the affordance.

---

## 5. Decision ladder — what to reach for first

When you want to "group" or "contain" content, try these in order. Stop at the first one that does the job:

1. **Whitespace + heading.** A heading with appropriate type weight and `space-lg` above it groups everything below until the next heading. This is the default.
2. **Divider line.** A 1px horizontal rule between sections. Cheap, quiet, effective.
3. **Tinted background block.** A subtle background fill (one tier off the page background) with no border. Groups without framing.
4. **Card.** Border + radius + padding + elevation. Reserve for content matching all three criteria in §1.

Each step adds visual weight. Use the minimum that communicates the structure.

---

## 6. When in doubt

Ask: *if I remove the card chrome, does the page become harder to scan, or just less busy?*

- Harder to scan → the card was doing work, keep it.
- Less busy → the card was decoration, remove it.

The default answer is "less busy." Most cards in a developer dashboard are removable.
