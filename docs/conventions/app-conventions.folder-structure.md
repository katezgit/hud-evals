# App Folder Structure

How to organize a Next.js App Router dashboard. Covers both the **high-level composition** (which route groups exist and what each owns) and the **per-segment mechanics** (special files, private folders, server vs client).

For error/loading nuance, see [loading-and-errors](app-conventions.loading-and-errors.md).

## Composition: route groups

A dashboard has up to four layout boundaries. Each is a Next.js route group `(name)` — URL-invisible.

| Group          | Purpose                                          | Gate                              | Shell                              |
| -------------- | ------------------------------------------------ | --------------------------------- | ---------------------------------- |
| `(auth)`       | Public sign-in / sign-up                         | none                              | Centered card                      |
| `(onboarding)` | Authed users not yet onboarded                   | session + not-onboarded           | Minimal                            |
| `(app)`        | Major business operations (lists, detail, dashboards) | session [+ onboarded]        | App shell (operations sidebar + topbar) |
| `(manage)`     | Settings / admin (profile, members, billing, …)  | session [+ admin for admin pages] | Manage shell (settings sidebar)    |

Two reasons to keep `(app)` and `(manage)` separate even though both are authed:
1. Different shell chrome — operations sidebar vs settings sidebar.
2. Different mental mode — "doing work" vs "configuring the workspace".

Drop a group if the project does not need it. `(onboarding)` is optional; small apps may collapse `(manage)` into `(app)/settings/`.

## Tree

```
src/
├── app/
│   ├── layout.tsx                    # Root: <html>, ThemeProvider, Toaster, metadata template
│   ├── globals.css
│   ├── global-error.tsx              # Outside root layout — own <html>/<body>
│   ├── global-not-found.tsx          # Outside root layout — own <html>/<body>
│   │
│   ├── (auth)/
│   │   ├── layout.tsx                # Centered container
│   │   └── {login, register}/page.tsx
│   │
│   ├── (onboarding)/
│   │   ├── layout.tsx                # requireSession + redirect if onboarded
│   │   └── {step}/page.tsx
│   │
│   ├── (app)/
│   │   ├── layout.tsx                # requireSession + <AppShell>
│   │   ├── loading.tsx               # Segment Suspense fallback
│   │   ├── error.tsx                 # Segment error boundary ("use client")
│   │   ├── not-found.tsx             # Universal authed 404
│   │   ├── page.tsx                  # Home
│   │   └── {resource}/
│   │       ├── page.tsx              # Index / list
│   │       ├── _components/
│   │       ├── _data/
│   │       └── [id]/
│   │           ├── page.tsx          # Detail
│   │           ├── not-found.tsx     # Resource-specific 404
│   │           └── _components/
│   │
│   └── (manage)/
│       ├── layout.tsx                # requireSession + <ManageShell>
│       ├── not-found.tsx
│       └── manage/
│           ├── layout.tsx            # Section header / shared context
│           └── {section}/page.tsx
│
├── components/                       # Cross-route shared UI
│   └── shell/                        # App shell internals (nav, avatar, brand mark)
│
├── lib/
│   ├── auth/                         # session.ts (get/set/require), actions.ts (sign-in/out)
│   └── cn.ts
│
└── middleware.ts                     # Reverse-gate: authed users away from /login
```

## Layout layering

```
RootLayout (app/layout.tsx)
  └── <html>, <body>, ThemeProvider, Toaster
      └── GroupLayout ((app)/layout.tsx)
          └── requireSession() + <Shell>
              └── SegmentLayout (optional)
                  └── page.tsx
```

Rules:
- **Root layout** is the **only** place for `<html>`, `<body>`, `<ThemeProvider>`, `<Toaster>`. Anything global lives here.
- **Group layouts** own the auth gate and the shell. Never gate inside a `page.tsx`.
- **Segment layouts** are for repeated chrome within a sub-tree (e.g. a settings page-header context provider that every settings page shares).

### Toaster — root only

`<Toaster />` mounts once at the root layout, so it serves every route (auth feedback, onboarding, app, manage). Do **not** mount a second Toaster inside a group layout; toasts emitted during cross-group navigation would unmount mid-flight.

## Auth gating — two directions

| Direction                                    | Mechanism                                       | Where                                              |
| -------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| Unauthed → public auth pages OK              | none                                            | `(auth)` has no gate                               |
| Unauthed → protected route blocked           | `requireSession()` redirects to `/login`        | `(app)`, `(onboarding)`, `(manage)` group layouts  |
| Authed → auth pages redirected away          | Middleware redirects `/login`, `/register` → `/` | `middleware.ts`                                    |

Two mechanisms because they fire at different times. Layout gating is server-render time (no flash). Middleware fires per-request — needed for the reverse direction where there is no layout to host the redirect.

### Onboarding gate (when onboarding exists)

The two-sided gate composes naturally:
- `(onboarding)/layout.tsx`: `requireSession()` → if `session.onboarded`, redirect to `/`.
- `(app)/layout.tsx`: after `requireSession()`, if `!session.onboarded`, redirect to onboarding entry.

Onboarding completion is a server action that sets `session.onboarded = true` then redirects to `/`.

## Error / 404 hierarchy

Most-specific wins. See [loading-and-errors](app-conventions.loading-and-errors.md) for when to add per-route variants.

| File                                       | Fires when                                              | In root layout?               |
| ------------------------------------------ | ------------------------------------------------------- | ----------------------------- |
| `app/global-error.tsx`                     | Root layout itself crashed                              | **No** — own `<html>/<body>`  |
| `app/global-not-found.tsx`                 | URL matches no segment                                  | **No** — own `<html>/<body>`  |
| `app/(app)/error.tsx`                      | Page/layout under `(app)` threw                         | Yes — toaster/theme intact    |
| `app/(app)/not-found.tsx`                  | `notFound()` under `(app)` with no closer handler       | Yes                           |
| `app/(app)/{resource}/[id]/not-found.tsx`  | `notFound()` from that detail page                      | Yes — entity-specific copy    |

Notes:
- `global-error.tsx` and `global-not-found.tsx` render **outside** the root layout, so they must define their own `<html>` and `<body>`. There is no `ThemeProvider` in scope, so pin a theme via `data-theme` and inline a `<style>` block to opt dark-mode users into `color-scheme: dark`:

  ```tsx
  // app/global-not-found.tsx (and app/global-error.tsx)
  import "./globals.css";

  export default function GlobalNotFound() {
    return (
      <html lang="en" data-theme="light">
        <head>
          <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }`}</style>
        </head>
        <body className="min-h-screen bg-background">
          {/* … 404 UI … */}
        </body>
      </html>
    );
  }
  ```

  Works because every semantic color token is defined with `light-dark()` keyed on `color-scheme` — flipping `color-scheme` alone is enough; no per-token swap needed.
- Any `error.tsx` is a **client component** (`"use client"`) — it receives `reset()` as a prop.
- Per-segment `error.tsx` / `not-found.tsx` are optional. Add only when the copy or recovery action differs from the parent.
- Expected errors (API 404, validation, permission) are **not** for boundaries — handle inline.

## Per-segment mechanics

### Special files

| File             | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `page.tsx`       | Route component (required)                                             |
| `layout.tsx`     | Wrapper, preserves state across navigation within the segment          |
| `error.tsx`      | Error boundary for the segment (client component)                      |
| `loading.tsx`    | Suspense fallback during server render                                 |
| `not-found.tsx`  | 404 for the segment                                                    |

### Route-private folders

Folders prefixed with `_` are not routed. Use them for code only this segment imports.

```
{resource}/
├── _components/         # Route-private UI
│   ├── index.ts         # Barrel export (optional)
│   └── *.tsx
├── _data/               # Route-private data shapes, loaders, fixtures
├── _hooks/              # Route-private hooks (when extensive)
├── page.tsx
└── layout.tsx
```

Add `_data/` and `_hooks/` only when the segment has enough to warrant the split.

### Server vs client components

- **Default**: server components (no directive).
- **`"use client"`**: only for stateful/interactive components and any `error.tsx`.
- **Pattern**: a server `page.tsx` fetches data, then passes it into a client `_components/` interactive shell.

## Cross-route shared

| Location                 | Contents                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| `src/components/`        | UI primitives or composite components imported by more than one route group |
| `src/components/shell/`  | App shell internals (nav links, avatar menu, brand mark, sidebar context) |
| `src/lib/`               | Non-UI utilities (auth, formatting, fetch wrappers)                   |

Two conventions for cross-route UI both work; pick one per project and stick with it:
- **`src/components/`** — flat, project-wide. Easier to find, no relationship to routing.
- **`app/_components/`** — colocated with `app/`. Signals "shared across routes" via folder placement.

When a component is consumed by only one route group, put it inside that group's `_components/` instead.

## Cloning checklist

Starting a new dashboard from this structure:

- [ ] Update `app/layout.tsx` metadata template (`"%s | <Product>"`)
- [ ] Replace brand mark imports
- [ ] Wire real auth in `lib/auth/`
- [ ] Define resource-specific `not-found.tsx` for entities where "deleted" / "moved" is common
- [ ] Decide which groups apply: drop `(onboarding)` or `(manage)` if not needed
- [ ] Edit middleware matcher if auth route names change
- [ ] Edit `global-not-found.tsx` support email and home-link target
