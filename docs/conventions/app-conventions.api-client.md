# API Client Organization

OOP-style API client pattern for organizing backend API calls.

## Structure

One resource per file. File name = kebab-case resource. Export name = `{resource}Api`.
A file must only contain endpoints for its own resource — not a related one.

```
_api/
├── post.ts           # postApi           → /posts
├── post-comment.ts   # postCommentApi    → /post-comments
├── event.ts          # eventApi          → /events
└── user.ts           # userApi           → /users
```

### Sub-resources get their own file

Separate URL path root = separate file. `/post-comments` is distinct from `/posts`, so it
lives in `post-comment.ts` with its own `postCommentApi` — never bundled under `postApi`.

## Pattern

Each resource file exports a namespaced API object:

```ts
// _api/post.ts
export const postApi = {
  list: async () => { ... },
  get: async (id: string) => { ... },
  create: async (input: CreatePostInput) => { ... },
  update: async (id: string, patch: UpdatePostInput) => { ... },
  remove: async (id: string) => { ... },
}
```

## Types — declared once, imported everywhere

Each interface/type is declared in exactly one file: the file that owns the resource.
Other files import it — never redeclare. Duplicate type declarations drift silently.

```ts
// ✗ Wrong — PostComment redeclared in post.ts
// _api/post.ts
export interface PostComment { ... } // duplicate of the one in post-comment.ts

// ✓ Correct — single source of truth
// _api/post-comment.ts
export interface PostComment { ... }

// _api/post.ts
import type { PostComment } from '@/_api/post-comment'
```

## Method naming

Methods map to HTTP verb + path suffix. Don't invent verb synonyms (`getAll` vs `list`,
`addComment` vs `setComment` — pick one and use it everywhere).

| Method          | HTTP + Path              |
| --------------- | ------------------------ |
| `list()`        | `GET    /xs`             |
| `get(id)`       | `GET    /xs/:id`         |
| `create(input)` | `POST   /xs`             |
| `update(id, p)` | `PATCH  /xs/:id`         |
| `remove(id)`    | `DELETE /xs/:id`         |

Sub-actions name after the URL segment:

- `POST /xs/:id/increment` → `increment(id)`
- `PUT  /xs/:id/publish`   → `publish(id, ...)`
- `GET  /xs/recent`        → `recent()`

## Error handling

List-style reads that power UI surfaces may `try/catch → return []` so the UI degrades
gracefully when the API is down. Everything else throws — callers decide how to handle it.
Don't sprinkle `try/catch` arbitrarily.

```ts
// ✓ List read for a UI surface — degrade to empty
list: async () => {
  try {
    return await http.get<Post[]>('/posts')
  } catch {
    return []
  }
},

// ✓ Mutations throw — caller handles
create: async (input: CreatePostInput) => {
  return http.post<Post>('/posts', input)
},
```

## Usage

Deep-import from the resource file:

```ts
import { postApi } from '@/_api/post'
import { postCommentApi } from '@/_api/post-comment'

const posts = await postApi.list()
const post = await postApi.get('123')
const comments = await postCommentApi.list({ days: 7 })
```

There is no `_api/index.ts` barrel — deep imports keep the dependency graph explicit and
make it obvious which resource a caller touches.

## Benefits

- **Discoverable**: `postApi.` triggers autocomplete for all post operations
- **Grouped**: Related operations stay together; unrelated ones stay apart
- **Testable**: Easy to mock an entire API object
- **Consistent**: Same method names, same verbs, same file layout across all resources
