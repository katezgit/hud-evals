# Patterns

Reusable interaction recipes that compose foundations into behavior. Patterns are cross-cutting — they touch multiple components and define choreography, not just values.

| File | Contains |
|---|---|
| [animation-library.md](./animation-library.md) | Catalog of named animation primitives (fade, slide, scale, skeleton, pulse, counter, common UI patterns) with classification and reduced-motion fallbacks |
| [blockchain-patterns.md](./blockchain-patterns.md) | Domain-specific choreography: block arrival, tx status transitions, live feed, loading states, copy interaction, search, wallet connection |

## Conventions

- Every animation in `animation-library.md` is tagged **functional** or **decorative**.
- Every pattern references foundation tokens (durations, easings) by name. No hard-coded values.
- Reduced-motion fallbacks are mandatory and live in [../guidelines/accessibility.md](../guidelines/accessibility.md).
