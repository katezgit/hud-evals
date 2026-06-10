# `packages/ui/src/components/`

Flat layout. One component per `<name>`, all siblings in this folder.

## Files for one component (`button` as example)

```
button.tsx          implementation. Line 1 is the provenance marker.
button.test.tsx     Jest + RTL: render, variants, interaction, disabled, ref, className merge.
button.stories.tsx  Storybook stories. Written by storybook-documenter after the architect returns.
```

Optional sibling when `cva` config is non-trivial:

```
button.variants.ts  exported cva config + types. Imported by button.tsx.
```

No sub-folders. No `index.tsx`. shadcn writes the flat file directly via the CLI.

## Provenance marker (`button.tsx` line 1)

Every component file's first non-empty line:

```tsx
// shadcn-source: https://ui.shadcn.com/docs/components/button (cli, 2026-05-26)
```

For Radix wraps or operator-approved from-scratch, use:

```tsx
// shadcn-source: radix-wrap:Tabs (no shadcn equivalent for sub-tab nesting) (n/a, 2026-05-26)
// shadcn-source: from-scratch-approved:kate-2026-05-26 (n/a, 2026-05-26)
```

Greppable: `rg '^// shadcn-source:' packages/ui/src/components/`.

## Styling

Tailwind v4 utility classes referencing tokens. No component-level CSS files in this directory unless the DOM node is unreachable from JSX (rare — e.g., third-party-injected nodes).
