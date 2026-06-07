# ThruScan Blockchain Motion Patterns

Domain-specific animation choreography for blockchain data events.
Each pattern specifies: trigger, visual sequence, absolute timing, purpose, and rate-limiting behavior.

---

## 1. New Block Arrival

### Trigger

A new block is received from the gRPC stream.

### Purpose

Signal that the chain is producing blocks and this block is new — not a stale refresh.
Confirm the live connection is healthy.

### Rate-limiting (REQUIRED — read before implementing)

Thru targets 10x Solana throughput. Blocks may arrive every 40ms. The block feed
animation (Phase 1) is 250ms. If every block triggers its own animation, the
animation queue will grow faster than it drains, making the list appear to lag the chain.

**Solution — animation flush interval:**

```
ANIMATION_FLUSH_INTERVAL = 100ms

On block arrival:
  1. Add block to buffer (do not animate immediately)
  2. If a flush is not already scheduled, schedule flush after 100ms

On flush:
  - Take all buffered blocks since last flush
  - If buffer.length <= 3: animate each with slide-up-row, staggered at --stagger-feed (40ms)
  - If buffer.length > 3:  instant-render all but the newest; animate newest with slide-up-row
  - Clear buffer
```

This means at 40ms block times, up to 2–3 blocks buffer before a flush. The feed
animates the most recent arrival; older arrivals in the batch appear instantly. The
result is a feed that feels live without animation buildup.

### Visual sequence (per flush)

All times below are absolute offsets from the flush moment (t=0).

```
Phase 1 — Feed update  (t=0ms → t=250ms)
  New block row slides in at top of feed.
  { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
  duration: 250ms, ease-data

Phase 2 — Block height counter rolls  (t=0ms → t=240ms, parallel with Phase 1)
  Header block height counter rolls to new value.
  Only changed digits roll; unchanged digits hold still.
  Per-digit: 120ms, ease-data, right-to-left stagger at 20ms per position.

Phase 3 — Live indicator acknowledges  (t=0ms → t=200ms, parallel)
  The live dot fires its block-arrival acknowledgment pulse (one-shot, separate from
  the ambient 2000ms pulse):
  { scale: 1 → 1.3 → 1, opacity: 1 throughout }
  duration: 200ms, ease-out

Phase 4 — Oldest row exits  (t=250ms → t=400ms, begins when Phase 1 ends at t=250ms, no additional delay)
  The bottom row of the visible list fades out to make room.
  { opacity: 0 }  duration: 150ms, ease-shell
  Do not use slide-down exit — it fights the visual direction of the incoming row.
```

Total choreography duration: 400ms. Within the recurring event cap.

### What does NOT animate

- The rest of the page (stats, nav, search) — holds completely still
- Previously-arrived block rows — they do not re-animate
- The network stats bar (TPS, validator count) — these update via flash-value only

### AnimatePresence configuration

```tsx
<AnimatePresence mode="sync">
  {blocks.map(block => <BlockRow key={block.hash} />)}
</AnimatePresence>
```

Use `mode="sync"` (not `mode="popLayout"`). Sync mode processes enter and exit
simultaneously, which preserves layout animation continuity when a row exits at the
bottom while a row enters at the top. `popLayout` would defer layout recalculation
and cause a visible jump when the exit row vacates its space.

---

## 2. Transaction Status Transitions

### States

```
Pending → Confirmed → Finalized
```

### Pending state presentation

```
Badge appearance:
  Background: --color-status-warning at 15% opacity
  Text: --color-status-warning
  Icon: animated spinner

Spinner spec:
  rotation: 0deg → 360deg
  duration: 1000ms
  easing: linear
  iteration: infinite
  — stops immediately when status changes, no deceleration out
```

### Pending → Confirmed transition

```
Sequence:
  1. Spinner stops (instant)
  2. Badge exits: { opacity: 0, scale: 0.85 }
     duration: 150ms, ease-shell
  3. Gap: --duration-badge-gap (50ms)
  4. Confirmed badge enters: { opacity: 1, scale: 1 }
     duration: 200ms, ease-shell

Confirmed badge:
  Background: --color-status-success at 15% opacity
  Text: --color-status-success
  Icon: checkmark (static)

Row-level flash (simultaneous with badge exit, step 2):
  The transaction row gets a brief background flash.
  { background-color: color-mix(in oklch, --color-status-success 8%, transparent) }
  flash-value animation: 400ms, ease-flash
  — this flash is on the row, not the badge
```

Total: ~400ms. Within the recurring event cap.

### Confirmed → Finalized transition

```
Sequence:
  1. Badge exits: { opacity: 0, scale: 0.85 }
     duration: 150ms, ease-shell
  2. Gap: --duration-badge-gap (50ms)
  3. Finalized badge enters: { opacity: 1, scale: 1 }
     duration: 200ms, ease-shell

Finalized badge:
  Background: --color-primary at 10% opacity
  Text: --color-primary
  Icon: shield or lock (static)
```

### Finalization ceremony (Transaction Detail page only)

The ceremony fires ONLY for the primary transaction in the page header — the one being
actively viewed. All other transactions on the same page (e.g. in a "related transactions"
list) get badge color change only. No ring.

**DOM structure for the ring element:**

```tsx
{/* Sibling to the status icon, absolutely positioned over it */}
<div
  aria-hidden="true"
  className="absolute inset-0 rounded-full border-2 border-current pointer-events-none"
  // Framer Motion animates this element:
  // initial: { scale: 1, opacity: 0.4 }
  // animate: { scale: 2, opacity: 0 }
/>
```

- `inset-0`: covers the exact bounding box of the status icon
- `rounded-full`: circular ring
- `border-2`: 2px border (inherits `border-current` color from the Finalized badge text color, which is `--color-primary`)
- `pointer-events-none`: non-interactive, cannot capture clicks
- `aria-hidden="true"`: hidden from assistive technology — purely decorative

**Ring animation:**

```
{ scale: 1 → 2, opacity: 0.4 → 0 }
duration: 800ms  (--duration-deliberate)
easing: ease-shell
Plays once. Does not loop.
```

800ms is justified here: this is a once-per-session event (a specific transaction
finalizing while the user is watching the detail page). It is not a recurring event.
The `--duration-deliberate` token exists precisely for this ceremony.

**Classification:** decorative

**Reduced-motion:** Suppressed entirely. Badge color change is the signal.

### Failure state

```
Pending → Failed:
  1. Spinner stops (instant)
  2. Badge transitions same as Confirmed but with error colors:
     --color-status-error at 15% background, --color-status-error text
  3. No row-level flash on failure — the badge change is sufficient.
     Flashing red on a table row would be alarming; the badge communicates the state.
```

---

## 3. Live Transaction Feed

### Feed behavior

New transactions stream in continuously during active network periods. The feed shows
the 20–50 most recent transactions.

### Rate-limiting

Same flush mechanism as block feed: `ANIMATION_FLUSH_INTERVAL = 100ms`.
If more than 3 transactions arrive in one flush interval, instant-render overflow
and animate only the newest.

### Row insertion

Each new transaction row uses `slide-up-row` (see animations.md).
Stagger: `--stagger-feed` (40ms) applied only when multiple transactions arrive in
the same flush. For single-transaction updates, no stagger delay.

### Feed overflow handling

When the feed reaches its maximum visible rows and a new row arrives:

```
New row: slide-up-row entrance at top (250ms, ease-data)
Overflow row: fade-out at bottom (150ms, ease-shell, simultaneous with entrance)
```

The overflow row does not slide down — it fades in place. Sliding it down while the
new row slides up creates competing vertical motion.

### Pause state

**Desktop (hover):** If the user hovers a row for more than 500ms, pause the live feed.

**Mobile (touch):** Tap the live feed area to toggle pause. No hover pause on touch
devices — hover events are unreliable and the 500ms threshold is impossible to control
on touch.

**Paused state:**
- New incoming rows queue (max 10) and are not displayed.
- Show a persistent "Paused" text badge above the feed (not a pill — a badge with the
  word "Paused" and a count of queued items).
- Badge uses `aria-live="polite"` to announce the queue count to screen readers.
- Badge entrance: `slide-up-row` (appears from above the feed header).

**Resuming:**
- Desktop: hover-end resumes feed.
- Mobile: tap again to resume.
- On resume: queued items appear instantly — no animation. Animating 10 rows in a burst
  is disorienting. Instant appearance after pause is clean.

### `aria-live` coordination

The feed element should carry `aria-live="polite"` and announce the count of newly
arrived items per flush, not individual items. Example: "3 new transactions" per flush.
When paused, announce the queue count: "Feed paused. 7 transactions queued."
Do not announce each transaction individually — this would overwhelm screen reader users.

---

## 4. Chain Data Loading States

### Page-level load (initial navigation to a block or transaction)

```
Sequence:
  1. Page skeleton appears instantly (no animation for the skeleton itself)
  2. Skeleton shimmer runs continuously until data arrives
  3. When data arrives:
     a. Skeleton exits: { opacity: 0 }  — 150ms, ease-shell
     b. Content enters: { opacity: 1 }  — 250ms, ease-data  (50ms delay after step a)
  Total reveal: ~450ms perceived
```

This sequence uses `--duration-slow` (500ms range) which is above the 400ms recurring
event cap. This is intentional: page-level load is a once-per-navigation event, not a
recurring streaming event. It earns the longer duration.

### Section-level load (tabs, expandable sections)

When a user opens a tab (e.g. "Internal Transactions" on a tx detail page) that
requires a new data fetch:

```
Tab content area:
  1. Show skeleton instantly
  2. Skeleton shimmer while loading
  3. Same skeleton → content reveal as above
```

Do not animate the tab itself or the tab panel mount. The content inside the panel
gets the skeleton treatment. The panel itself simply appears.

### Error state (chain RPC unavailable)

```
Error message appearance:
  fade-in  (200ms, ease-shell)
  No slide, no scale — errors appear with minimal drama.

Retry button:
  Standard hover/press scale-icon-action spec applies.
```

### Pagination / "Load more"

When the user clicks "Load more" on a transaction list:

```
New rows: appear with slide-up-row (250ms, ease-data)
Staggered at --stagger-feed (40ms).
Cap: floor(320ms / 40ms) = 8 rows. Rows 9+ appear instantly.
```

Do not animate the "Load more" button state. Disable it during the fetch.
A loading spinner inside the button is sufficient feedback.

---

## 5. Address / Hash Copy Interaction

When a user copies a hash or address:

```
Sequence:
  1. Copy icon → checkmark icon
     icon swap: fade-out (75ms, ease-shell) → fade-in (150ms, ease-shell)
  2. Hold checkmark for 1500ms
  3. Checkmark → copy icon
     icon swap: fade-out (75ms, ease-shell) → fade-in (150ms, ease-shell)
```

No toast notification for copy actions — the inline icon swap is sufficient.
Toast notifications are reserved for actions with side effects (wallet connection,
form submission).

---

## 6. Search

### Search panel open

```
Overlay backdrop: { opacity: 0 → 1 }  — 200ms, ease-shell
Search modal: { opacity: 0, y: -16, scale: 0.98 } → { opacity: 1, y: 0, scale: 1 }
              duration: 250ms, ease-shell
```

### Search results appear

```
Results list mount: fade-in (200ms, ease-shell)
Individual result rows: no stagger — all appear simultaneously
```

Staggering search results would make the list feel slow to populate.
At search speed, all results should appear as one unit.

### Search panel close

```
Modal:   { opacity: 0, scale: 0.98 }  — 150ms, ease-shell
Backdrop: { opacity: 0 }              — 150ms, ease-shell  (simultaneous)
```

---

## 7. Wallet Connection

### Connect wallet flow

This is a modal flow. The wallet embeds as an iframe (`wallet.thru.org/embedded`).

```
Modal open: slide-up-modal (350ms, ease-shell) — per animations.md spec
Iframe load: skeleton shimmer inside the modal while iframe initializes
Wallet ready: skeleton → content reveal (150ms + 250ms)
```

### Connection success

```
1. Modal closes: modal exit animation (200ms, ease-shell)
2. Wallet address appears in nav bar: slide-up-row (250ms, ease-data)
3. Balance appears with flash-value (400ms, ease-flash) after a 100ms delay
```

The delay before the balance flash ensures the address has settled visually before
the balance draws attention to itself.

### Connection failure

```
1. Error message appears inside the modal with fade-in (200ms, ease-shell)
2. Modal stays open
```

No shake animation on failure. Shake communicates "wrong password" in login flows.
Here the failure is technical (network, wallet unavailable) — a shake would feel
accusatory rather than informative.
