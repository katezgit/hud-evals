# Frontend Solutions

## Evaluation Principles

**Core principle: Independence/control.** Optimize for minimal external dependencies, maximum
modification freedom, lowest switching cost.

| Priority | Metric                           | Definition                                             |
| -------- | -------------------------------- | ------------------------------------------------------ |
| 1        | Customizable                     | Ability to modify component behavior/appearance        |
| 2        | Small                            | Bundle size / minimal footprint                        |
| 3        | Flexibility                      | Escape hatches when defaults don't fit                 |
| 4        | No theme lock-in                 | Not coupled to opinionated design system               |
| 5        | Composability over configuration | Small composable pieces > large configurable monoliths |
| 6        | Feature completeness             | Covers required use cases out of the box               |

**Explicitly excluded:**

- Time-to-implement — irrelevant with LLM-assisted coding
- Ecosystem/community size — smaller focused libs often better
- Documentation quality — LLMs can parse source code directly

## Preferred Solutions

| Category        | Solution                                            | Size   | Use                                     | Don't use                    |
| --------------- | --------------------------------------------------- | ------ | --------------------------------------- | ---------------------------- |
| Table           | [TanStack Table](https://tanstack.com/table/latest) | ~15KB  | Complex tables, sorting, filtering      | Simple static tables         |
| Primitive UI    | Radix UI                                            | varies | Accessible interactive components       | Static elements              |
| Data fetching   | [TanStack Query](https://tanstack.com/query/latest) | ~13KB  | Client-side interactive data, mutations | Static/SSR content (use RSC) |
| Forms           | react-hook-form + Zod                               | ~24KB  | Any forms with validation               | —                            |
| Date picker     | react-day-picker                                    | ~12KB  | Date selection UI                       | —                            |
| Date formatting | date-fns + date-fns-tz                              | ~13KB  | Date math, formatting, timezone display | Simple `toLocaleDateString`  |

## Reference

### TanStack Query Decision Matrix

| Scenario                            | Solution       |
| ----------------------------------- | -------------- |
| Blog, docs, marketing pages         | RSC + fetch    |
| Dashboard with static data          | RSC + fetch    |
| Interactive filters/search          | TanStack Query |
| Form submissions with optimistic UI | TanStack Query |
| Real-time updates                   | TanStack Query |
| Infinite scroll                     | TanStack Query |

### Date/Time Timezone Handling

**Problem:** Calendar events "float" to wrong date when UTC midnight converts to user's timezone.

**Solution:** Store with timezone info, convert at display time.

```typescript
import { formatInTimeZone } from 'date-fns-tz'

// UTC midnight displays correctly as previous day in US
formatInTimeZone('2026-03-27T00:00:00Z', 'America/New_York', 'yyyy-MM-dd HH:mm')
// → "2026-03-26 20:00"
```

**Alternatives considered:**

| Library  | Size   | Why not                                      |
| -------- | ------ | -------------------------------------------- |
| Day.js   | ~2KB   | Less mature timezone plugin                  |
| Luxon    | ~23KB  | Larger, more opinionated                     |
| Temporal | ~100KB | Polyfill too large; wait for browser support |
