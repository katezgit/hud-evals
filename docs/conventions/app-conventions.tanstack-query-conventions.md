# Query Keys

Tanstack Query key conventions for cache management and invalidation.

## Principle

Resource-domain-first. The first segment is always the resource type. Invalidating a root key cascades to all sub-queries under it.

## Key Structure

```
[resource]                        — root (invalidate = cascades to all below)
[resource, filter]                — filtered list (e.g. inbox, today)
[resource, id]                    — single entity
[resource, id, sub-resource]      — nested resource
```

## Examples

```ts
// Tasks
['tasks']                         // all task queries
['tasks', 'inbox']                // inbox-filtered tasks
['tasks', 'today']                // today-filtered tasks

// Projects
['projects']                      // project list
['projects', id]                  // project detail
['projects', id, 'tasks']         // tasks belonging to a project
['projects', id, 'materials']     // materials belonging to a project
```

## Key Factory Pattern

Each resource domain exports a `___Keys` object:

```ts
export const taskKeys = {
  all: ['tasks'] as const,
  inbox: () => [...taskKeys.all, 'inbox'] as const,
  today: () => [...taskKeys.all, 'today'] as const,
}
```

- Factory functions build on `all` so prefix invalidation always works.
- No intermediate grouping segments (`list`, `detail`, `details`). The `id` itself distinguishes a detail from a list.

## File Naming

One file per resource domain: `_hooks/queries/{resource}.ts`

The file name matches the root key segment:

| Root key      | File                          |
| ------------- | ----------------------------- |
| `tasks`       | `_hooks/queries/tasks.ts`     |
| `projects`    | `_hooks/queries/projects.ts`  |
| `today`       | `_hooks/queries/today.ts`     |

A query lives in the file that owns its **root key segment**, not the page that renders it. `useTodayTasks` uses key `['tasks', 'today']` → lives in `tasks.ts`, not `today.ts`.

## Hook Naming

Pattern: `use[Action][ResourceName]`

| Hook | Explanation |
| --- | --- |
| `useFetchInboxTasks` | fetch + inbox tasks |
| `useCaptureTask` | capture + task |
| `useCompleteTask` | complete + task |
| `useUpdateProjectStatus` | update + project status |
| `useDeleteTask` | delete + task |
| `useRouteTask` | route + task |

Action comes first, resource follows. No ambiguous names like `useTasks` or `useInbox` — the action makes the intent clear.

## Invalidation

1. **Cascade by default.** Invalidate `taskKeys.all` to hit inbox, today, and any future task sub-query.
2. **Surgical when you have the id.** If the mutation response includes `projectId`, invalidate `projectKeys.tasks(projectId)` instead of `projectKeys.all`.
3. **No hardcoded keys.** Always use the key factory. Never write `['tasks', 'inbox']` inline.
4. **No cross-domain imports for cascade.** If tasks live under `['tasks']`, you don't need to separately invalidate `['today', 'tasks']` — that key doesn't exist.
