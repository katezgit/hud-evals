# Auth Pages Spec — `/login` and `/register`

> Scope: outer chrome, card frame, typography, layout. Forms, OAuth buttons, field labels, and server actions are untouched.

---

## Layout decision

**No BrandPanel. Centered form only.**

Auth is a high-frequency utility gate, not a first-impression pitch surface. Alex, Sam, and Riley each see it at the start of every session. The BrandPanel copy ("The platform for building RL environments") is first-impression acquisition text — re-exposing it on every login re-read creates friction for users who have already internalized what HUD is. The onboarding BrandPanel earns its space because it runs once; auth runs daily.

The result: single-column centered layout, same as the current structure, but with updated outer background and card chrome to match the app's new look-and-feel.

---

## Outer background

**`bg-panel bg-grid-overlay`** — same as the onboarding form-side section and the AppShell main area.

`bg-muted-surface` (current) is a flat, tonally neutral gray. In dark mode it reads as a featureless void — the "lost in the dark forest" condition the operator flagged. `bg-panel bg-grid-overlay` gives the same ambient texture the user sees inside the app, so the auth gate feels continuous with the product rather than a flat interstitial. No token addition needed; both utilities already exist.

---

## Form card chrome

Replace the current `<Card variant="elevated">` component with plain `<div>` using explicit classes. The `<Card>` component is valid when content is a discrete object with stable identity actionable as a unit among peers — a single centered auth form has no peers, so the card primitive is being used as a container convenience, not a card. The explicit classes give equivalent chrome without the semantic mismatch.

```
<div className="w-full max-w-[420px] rounded-lg bg-card p-6 lg:border lg:border-border lg:p-10">
```

- `max-w-[420px]` — matches onboarding form col; current layout uses `max-w-[400px]` on the outer `layout.tsx` wrapper. Move the cap inside the card div and remove it from the layout wrapper (layout becomes `flex min-h-screen items-center justify-center bg-panel bg-grid-overlay p-6`).
- `rounded-lg bg-card` — gives the visible "room" frame in dark mode (card is `surface-elevated-dark` = `#161D28`, lifting above `panel-dark`).
- `p-6 lg:border lg:border-border lg:p-10` — mobile padding + desktop border + desktop padding ladder, identical to onboarding.

**No `CardHeader` / `CardContent` / `CardFooter` sub-sections.** The current card's internal section divider borders (from `CardHeader` bottom border and `CardFooter` top border) go away. They add structural noise for a three-row form that has no tabbing or section-jump requirement. The content flows as a single vertical stack inside the card div.

---

## Internal card structure

The card div contains everything — BrandMark, heading, form, footer link — as one flat `flex flex-col gap-8` stack with internal sub-gaps. No internal borders.

```
<div className="flex flex-col gap-8">
  {/* BrandMark + heading */}
  <div className="flex flex-col items-center gap-3">
    <BrandMark size="sm" />
    <h1 className="text-subtitle font-semibold text-foreground">Sign in to HUD</h1>
  </div>

  {/* Form content — LoginForm / RegisterForm, unchanged */}
  <LoginForm />

  {/* Footer link */}
  <p className="text-center text-caption text-muted-foreground">
    Don't have an account?{" "}
    <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
      Sign up
    </Link>
  </p>
</div>
```

The footer link moves **inside** the card. Outside-card placement (current) requires the eye to escape the bounded region for a next-action link — inside placement keeps all interactive affordances in one visual unit. The card is the room; the footer link is part of the room.

---

## Typography

**No change from current in-app sizes.**

- Heading "Sign in to HUD" / "Create your HUD account": `text-subtitle font-semibold` — keep. Auth is a utility; the heading exists for context, not hierarchy emphasis. Bumping to marketing-tier arbitrary values would be inconsistent with every other in-app heading and would signal "pitch" to a returning user who just wants to authenticate.
- Form labels, inputs, helper text: unchanged — these are inside `LoginForm` / `RegisterForm` and out of scope.
- Footer link: `text-caption text-muted-foreground` — keep current.

No new type tokens. No arbitrary inline values for type.

---

## Breakpoint

No BrandPanel, so no `lg` split. The layout remains single-column at all breakpoints. The outer `layout.tsx` wrapper is a flexbox centering shell with no breakpoint-aware changes needed.

---

## Token list

No new tokens. All values used exist:

| Utility / token | Source |
|---|---|
| `bg-panel` | `packages/ui/src/styles/theme.css` — `--color-panel` |
| `bg-grid-overlay` | `apps/portal/src/app/globals.css` — `@utility bg-grid-overlay` (rename note: current utility is `bg-grid-backdrop`; see layout note below) |
| `bg-card` | `packages/ui/src/styles/theme.css` — `--color-card` |
| `border-border` | `packages/ui/src/styles/theme.css` — `--color-border` |
| `rounded-lg`, `p-6`, `p-10`, `max-w-[420px]` | Tailwind built-in / inline |

> **`bg-grid-overlay` vs `bg-grid-backdrop` note.** The onboarding layout uses `bg-grid-overlay`. The `globals.css` utility is named `bg-grid-backdrop`. If these are the same utility (a rename in progress), use whichever is the current live name. If `bg-grid-overlay` is a separate token from `packages/ui`, confirm before the engineer implements. Do not introduce a second utility for the same pattern.

---

## Layout.tsx change

```tsx
// apps/portal/src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-panel bg-grid-overlay p-6">
      {children}
    </main>
  );
}
```

The `max-w-[400px]` cap moves from the layout wrapper into each page's card div at `max-w-[420px]` (harmonized with onboarding). Layout is a pure centering shell; width cap is the card's concern.

---

## Page structure (login — register mirrors it)

```tsx
// apps/portal/src/app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px] rounded-lg bg-card p-6 lg:border lg:border-border lg:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <BrandMark size="sm" />
          <h1 className="text-subtitle font-semibold text-foreground">
            Sign in to HUD
          </h1>
        </div>
        <LoginForm />
        <p className="text-center text-caption text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

Register page: same structure, heading "Create your HUD account", `<RegisterForm />`, footer "Already have an account? Sign in" linking to `/login`.
