# App Conventions

Conventions for building features in Next.js applications under `apps/`.

## Conventions

| Topic                                                   | What it covers                          |
| ------------------------------------------------------- | --------------------------------------- |
| [Naming](app-conventions.naming.md)                     | File, component, variable, dialog names |
| [Folder Structure](app-conventions.folder-structure.md) | Route groups, layout layering, auth gating, error hierarchy, per-segment mechanics |
| [API Client](app-conventions.api-client.md)             | OOP-style API client patterns           |
| [Tanstack Query](app-conventions.tanstack-query-conventions.md) | Query key hierarchy, invalidation & hook naming |
| [Loading & Errors](app-conventions.loading-and-errors.md) | Route-level loading.tsx, error boundaries, skeleton patterns |

## Contributing

These conventions are living documents. If you encounter a pattern that should be standardized:

1. Discuss with the team first
2. Document the convention in the appropriate file (or create a new `app-conventions.<topic>.md`)
3. Update this index
