# Turborepo FAQ

## Why do apps need `@import "@repo/ui/styles.css"` in `globals.css`?

CSS and JS are separate pipelines.

`import { Button } from "@repo/ui"` is a **JS import** — it gives you the React component, which outputs class strings like `bg-primary text-primary-foreground`. But those are just strings. They mean nothing without CSS that defines what `bg-primary` resolves to.

The `@import "@repo/ui/styles.css"` in each app's `globals.css` does three things:

1. **Bootstraps Tailwind** — `styles.css` contains `@import "tailwindcss"`, which triggers Tailwind's utility generation
2. **Registers design tokens** — the `@theme` block declares CSS custom properties (`--color-primary: #0070f3`) so `bg-primary` has an actual value at runtime
3. **Scans UI source for classes** — `@source "."` in `styles.css` tells Tailwind to scan the UI package's source files, so it generates CSS for classes used in components like Button

Each app has its **own CSS build pipeline** (Next.js processes CSS independently per app). Without the import, the app has no Tailwind, no tokens, and component classes render as nothing.

This import belongs in `globals.css` only — **not** in individual page/component files. `globals.css` is loaded once for the entire app, so every page gets the tokens and utilities automatically.

```css
/* apps/web/app/globals.css — this is all you need */
@import "@repo/ui/styles.css";
```

## Where does `@source` belong?

In the **UI package's `styles.css`**, not in each app's `globals.css`.

```css
/* packages/ui/src/styles.css */
@import "tailwindcss";

@source ".";  /* scan this directory for class usage */

@theme { ... }
```

`@source` tells Tailwind which directories to scan for utility class names. Since `@source` paths resolve **relative to the CSS file they're in**, putting it in the UI package means it always points to the right place. Apps that `@import` this stylesheet inherit the directive automatically.

### Do apps need `@source` for their own files?

No. Tailwind v4 automatically scans the current project's source files (`app/`, `src/`, `components/`, etc.) — it only excludes directories like `node_modules` and `.git`. Classes used directly in `apps/web/app/page.tsx` or anywhere inside the app are picked up automatically. `@source` is only needed for directories Tailwind wouldn't find on its own, like the UI package (which resolves through `node_modules`).

### Pitfall: relative path resolution

Previously we had `@source` in each app's `globals.css` with a relative path back to the UI package:

```css
/* DON'T do this — fragile and error-prone */
@source "../../../../packages/ui/src";
```

This broke because the path had one too many `../`, resolving above the project root. Tailwind silently ignores invalid `@source` paths, so no error was thrown — components just rendered without their variant styles. The fix: let the UI package own its own `@source` declaration.
