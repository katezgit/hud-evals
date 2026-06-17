# Sidebar Route Transition — app ↔ manage

The sidebar panel is a fixed position in the chrome; entering Manage replaces workspace content
with settings content by sliding the panel left (workspace exits left, settings enters from
right), establishing Manage as a layer that sits to the right of — and one step removed from —
the primary workspace. Returning reverses exactly: settings exits right, workspace re-enters from
left. This is a single spatial axis, one direction each way, no ambiguity.

---

## A. Direction rationale

Manage is "to the right" of the main workspace in the mental model — it is a settings layer you
step into, not a peer section at the same level. The workspace sidebar exits toward the left
(receding behind the user), and the settings sidebar enters from the right (stepping forward into
view). On return the directions reverse: settings exits right (receding), workspace re-enters
from the left (restoring). This is the same axis used by the Trace panel altitude switch
(`--animate-slide-right-in` / `--animate-slide-left-out`) — one established spatial convention,
not two competing metaphors.

---

## B. Choreography

| Direction         | Outgoing sidebar                                        | Incoming sidebar                                        | Overlap     |
|-------------------|---------------------------------------------------------|---------------------------------------------------------|-------------|
| /app → /manage    | Slides left to −100% width + fades to opacity 0        | Slides in from +100% width to 0 + fades to opacity 1   | 50ms offset |
| /manage → /app    | Slides right to +100% width + fades to opacity 0       | Slides in from −100% width to 0 + fades to opacity 1   | 50ms offset |

**Overlap model:** outgoing starts first. Incoming begins 50ms after outgoing starts (not after it
completes). Both are in motion simultaneously for most of the transition. Total wall-clock budget:
outgoing-start → incoming-complete = 120ms + 50ms = 170ms. Well inside the 300ms budget.

The 50ms stagger is not a sequential hand-off — it is a brief lead so the outgoing panel has
visually "left" before the incoming panel's arrival is perceptible. This reads as one fluid swap,
not two separate events.

---

## C. Timing

| Phase             | Duration              | Token           | Value  |
|-------------------|-----------------------|-----------------|--------|
| Outgoing exit     | `--duration-fast`     | `duration-fast` | 120ms  |
| Incoming enter    | `--duration-subtle`   | `duration-subtle` | 180ms |
| Stagger delay     | (inline: 50ms)        | not a token — fixed offset | 50ms |

Rationale: the outgoing panel clears stage quickly (`--duration-fast` + accelerated ease) so it
does not compete with the incoming panel. The incoming panel takes slightly longer (`--duration-subtle`)
so it settles into place with controlled deceleration rather than a snap. The 50ms stagger is a
single fixed value, too narrow to merit a token; engineers may inline it as a `transition-delay`
on the incoming element.

Alex returns from Manage frequently. The exit path (Manage → app) is perceived as the same cost
as the entry path because the durations are symmetrical — the transition is reversible at zero
extra cognitive load.

---

## D. Easing

| Phase          | Easing                  | Token                    | Value                        | Rationale                              |
|----------------|-------------------------|--------------------------|------------------------------|----------------------------------------|
| Outgoing exit  | `--ease-in-accelerated` | `ease-in-accelerated`    | `cubic-bezier(0.3, 0, 1, 1)` | Clears stage fast; matches modal exit  |
| Incoming enter | `--ease-out-emphasized` | `ease-out-emphasized`    | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Decelerates to rest; matches panel enter |

No new easing values needed. Both are already in the token set and already carry the correct
semantic meaning in this codebase (`ease-in-accelerated` = dismissal/exit; `ease-out-emphasized` =
enter/settle).

---

## E. Opacity

Slide + fade: both translate and opacity move together in a single composite transition on each
sidebar element.

- Outgoing: `translateX` to ±100% AND `opacity` 1 → 0, simultaneous, same duration.
- Incoming: `translateX` from ±100% to 0 AND `opacity` 0 → 1, simultaneous, same duration.

Pure translateX without fade would flash the panel edge against the sidebar background at the
moment of entry/exit. The opacity layer removes that artifact and softens the motion to match
"calm, dense, deliberate" — not a hard geometric wipe.

---

## F. Main content area

Main content area does not transition. Only the sidebar panel transitions. The content region
(the area to the right of the sidebar) does not slide, fade, or animate during the sidebar swap.

Rationale: the content area is already replacing its full tree on route change (different
`(app)` vs `(manage)` layout). Animating it in addition to the sidebar doubles the motion surface
without adding spatial information — the sidebar transition already communicates the spatial shift
completely. Spare; no redundant motion.

---

## G. Reduced motion

Under `prefers-reduced-motion: reduce`, all `--duration-*` tokens collapse to `0ms` (enforced by
the existing `@media` override in `theme.css`). Result: both sidebars swap instantly with no
visual transition. No additional reduced-motion declarations are needed for this choreography
beyond using the token-based durations.

The opacity values also collapse to an instant swap because the transition duration is 0ms — no
separate `opacity: 1` override is required.

---

## H. First-load / refresh

No transition on initial page load. If the user hard-refreshes `/manage/profile`, the settings
sidebar renders at rest with no animation — there is no outgoing workspace sidebar to transition
from. Motion applies only to client-side route transitions where both route groups exist in
navigation history within the same session.

---

## Implementation note (architecture-agnostic)

The two sidebars share the same panel position in the layout. Because they live in sibling route
groups (`(app)/layout.tsx` and `(manage)/layout.tsx`), the outgoing sidebar's DOM has typically
unmounted before the incoming sidebar's DOM mounts. To animate both simultaneously, the engineer
must choose one of the following architectures — the motion spec works under any of them:

- **Shared parent layout:** hoist both sidebars into the root layout and conditionally render by
  `pathname`. React controls both mounts; both are in the DOM during the transition.
- **Parallel routes:** use Next.js `@app` / `@manage` slots in the root layout to keep both
  sidebar slot trees alive during the route change.
- **View Transitions API:** let the browser snapshot the outgoing sidebar, mount the incoming
  sidebar, then animate between snapshots. Check Safari support at time of implementation.

The motion designer does not prescribe which architecture to use.

---

## Tokens used

| Token                  | Value                          | Phase used       |
|------------------------|--------------------------------|------------------|
| `--duration-fast`      | 120ms                          | Outgoing exit    |
| `--duration-subtle`    | 180ms                          | Incoming enter   |
| `--ease-in-accelerated`| `cubic-bezier(0.3, 0, 1, 1)`  | Outgoing exit    |
| `--ease-out-emphasized`| `cubic-bezier(0.05, 0.7, 0.1, 1)` | Incoming enter |

No new tokens required. The 50ms stagger delay is a fixed inline value on the incoming element's
transition-delay — too narrow and too specific to this pattern to merit a token.
