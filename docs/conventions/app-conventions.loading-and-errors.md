# Loading & Error Handling

Route-level loading states, error boundaries, and skeleton patterns for Next.js App Router.

## Error Handling

### One root `app/error.tsx`

Catches most runtime errors while preserving the app shell (nav, sidebar). This is sufficient for most apps — don't create per-route error boundaries by default.

### `global-error.tsx`

Catch-all for fatal errors in the root layout. Must define its own `<html>` and `<body>` since the root layout itself may have crashed.

### Per-route `error.tsx` only when recovery UX differs

Add a route-level `error.tsx` only when the error recovery action is unique to that route. Examples:

- A list route needs a "retry loading items" button
- A detail route needs a "go back to list" link

If the recovery UX is identical to the root error page, don't duplicate it.

### Expected errors are NOT for error boundaries

API 404s, permission denied, validation failures — these are expected application states. Handle them in-component with try/catch or conditional rendering. Error boundaries are for **unexpected runtime crashes** only.

```tsx
// ✓ Correct — expected error handled in-component
if (error?.status === 404) return <EmptyState message="Not found" />;

// ✗ Wrong — throwing to let error.tsx catch a 404
if (!item) throw new Error("Not found");
```

## Loading States

### Two complementary mechanisms

| Mechanism | When it fires | What it covers |
| --- | --- | --- |
| `loading.tsx` (route-level) | Route navigation (server streaming) | Instant skeleton while server renders. Prevents blank screens. Navigation is interruptible. |
| In-component skeleton (`isLoading` from TanStack Query) | Client-side data operations | Refetches, stale revalidation, cache misses. Granular control over specific sections. |

These are complementary, not either/or. A page typically has `loading.tsx` for navigation transitions AND in-component loading states for client-side operations.

### Every page must handle all UI states

**Default, loading, error, empty.** No state may render a blank screen.

### Skeleton best practices

- Match exact dimensions and layout of real content (prevents CLS)
- Use `role="status"` and `aria-label` for accessibility
- Use the `Skeleton` primitive from `@repo/ui`

```tsx
<div role="status" aria-label="Loading">
  <Skeleton className="h-8 w-48" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>
```

## When to add per-route files

| Scenario | Add `error.tsx`? | Add `loading.tsx`? |
| --- | --- | --- |
| Standard resource page | No (root catches it) | Yes (navigation skeleton) |
| Page with unique error recovery | Yes | Yes |
| Static page (no data fetching) | No | No |
