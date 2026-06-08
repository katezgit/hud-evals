# @repo/ui FAQ

## Does `import { Button } from "@repo/ui"` bundle all unused components into the app?

**No.** Tree-shaking removes unused exports from the final bundle.

When the web app imports only `Button`, the bundler (Turbopack/webpack 5) traces the dependency graph from `Button` only. `Card`, `CardHeader`, and other unused exports are eliminated as dead code — along with their dependencies like `cva` variants.

### Why does this work?

Three conditions must be met:

1. **ES Modules** — `"type": "module"` in `package.json`. ES module `import`/`export` are statically analyzable, unlike CommonJS `require()`.
2. **No side effects** — `"sideEffects": ["**/*.css"]` in `package.json` tells bundlers every non-CSS file is safe to drop when unused. Without this, bundlers must be conservative.
3. **Bundler support** — Turbopack (Next.js 16) and webpack 5 both perform tree-shaking on ES modules.

### Do we need per-component imports like `@repo/ui/button`?

Not needed for bundle size at this scale. Tree-shaking through the barrel file (`index.ts`) works fine.

Some large design systems (e.g., MUI) use per-component entrypoints (`@repo/ui/button`) when the barrel file gets so large that tree-shaking analysis itself becomes a build performance bottleneck. That's an optimization for hundreds of components — not something this project needs now.

### What's the built-in mechanism that removes unused files?

This is **tree-shaking** — a bundler feature, not a Turborepo feature. Turborepo handles task orchestration and caching across packages. Tree-shaking is done by the app's bundler (Turbopack/webpack) at build time.

The `@repo/ui` barrel file (`src/index.ts`) uses named re-exports with no side effects:

```ts
export { Button, buttonVariants, type ButtonProps } from "./components/button";
export { Card, CardHeader, ... } from "./components/card";
export { cn } from "./lib/cn";
```

The bundler sees which named exports are actually imported by the consuming app and drops the rest.

## What do `sideEffects`, `imports`, and `exports` do in the UI package.json?

```jsonc
{
  "sideEffects": ["**/*.css"],
  "imports": {
    "#lib/*": "./src/lib/*.ts",
  },
  "exports": {
    ".": "./src/index.ts",
    "./styles.css": "./src/styles.css",
  },
}
```

These three fields serve different purposes:

### `exports` — what consumers can import from this package

Defines the public API. Only these entry points are accessible from outside:

- `import { Button } from "@repo/ui"` resolves to `./src/index.ts`
- `import "@repo/ui/styles.css"` resolves to `./src/styles.css`

Anything not listed here is private. Consumers can't reach into `@repo/ui/src/lib/cn` directly.

### `imports` — internal path aliases within this package

The `#` prefix is the [Node.js subpath imports](https://nodejs.org/api/packages.html#subpath-imports) standard. It remaps internal paths so components don't need ugly relative imports:

```ts
// Before: counting ../../../ gets worse as nesting deepens
import { cn } from "../../lib/cn";

// After: consistent regardless of file location
import { cn } from "#lib/cn";
```

Why `#` instead of `@/`? TypeScript `paths` (like `@/*`) only work at the TypeScript level — the bundler doesn't honor them. When Next.js compiles `@repo/ui` source via `transpilePackages`, Turbopack resolves modules using Node.js rules, not the UI package's tsconfig. The `imports` field in `package.json` is part of the Node.js module spec, so both TypeScript (`moduleResolution: "Bundler"`) and Turbopack resolve it natively.

### `sideEffects` — tells bundlers what's safe to tree-shake

A file has "side effects" if importing it changes global state (e.g., CSS injected into the page, polyfills). Bundlers can't safely drop these even if nothing is imported from them by name.

`"sideEffects": ["**/*.css"]` means:

- CSS files — **keep always** (they style the page as a side effect of being imported)
- Everything else (components, utilities) — **safe to drop** if no named export is used

## Why use Storybook at all?

`packages/ui` is a shared design system consumed by multiple apps (`web`, `portal`). Storybook solves four problems:

1. **Develop without an app** — without Storybook, you'd spin up a full Next.js app just to see a button. Storybook lets you build and iterate on components in isolation
2. **See all states at once** — Button has 3 variants x 3 sizes x disabled. In an app you'd wire up a test page; in Storybook, one story shows them all
3. **Living documentation** — as the design system grows, Storybook becomes the component catalog. Browse what exists instead of reading source code
4. **CI pipeline integration** — `build-storybook` produces a static site for deployment or visual regression testing

For a solo app with 2 components, Storybook would be overkill. For a shared design system in a monorepo, it's standard practice.

## Why does Storybook use Vite (`@storybook/react-vite`) when the apps use Next.js?

Storybook needs its own bundler to serve the component development environment. The options are:

| Framework                   | Builder           | Use when                             |
| --------------------------- | ----------------- | ------------------------------------ |
| `@storybook/react-vite`     | Vite              | Standalone component libraries       |
| `@storybook/react-webpack5` | Webpack 5         | Legacy or webpack-dependent setups   |
| `@storybook/nextjs`         | Webpack (Next.js) | Storybook lives inside a Next.js app |

`packages/ui` is a standalone component library, not a Next.js app — `@storybook/nextjs` doesn't apply. Between Vite and Webpack:

1. **Faster dev experience** — Vite's native ESM dev server gives faster HMR and startup than webpack
2. **Tailwind CSS v4 support** — Tailwind v4 has first-class Vite integration via `@tailwindcss/vite`
3. **Storybook's default** — Storybook recommends Vite for new projects
4. **No conflict** — Vite is a Storybook-only dev dependency. It doesn't affect how Next.js apps build or consume `@repo/ui`
