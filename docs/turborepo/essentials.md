# Turborepo Essentials & References

> Current version: **2.8.1** (Jan 2026). We use Turborepo + pnpm workspaces.

## What Turborepo Does (30-second version)

Turborepo is a **build system for JavaScript/TypeScript monorepos**. It runs tasks (build, test, lint) across multiple packages and:

- **Caches results** — if inputs haven't changed, skip the work
- **Parallelizes** — runs independent tasks simultaneously
- **Respects dependency order** — builds packages before the apps that use them

You define tasks in `turbo.json`. You define packages in `pnpm-workspace.yaml`. Turborepo figures out the rest.

---

## Core Concepts

### Workspaces

A monorepo has multiple **packages** (each with its own `package.json`). Two kinds:

| Folder      | Contains                         | Example                        |
| ----------- | -------------------------------- | ------------------------------ |
| `apps/`     | Deployable applications          | `apps/web`, `apps/portal`      |
| `packages/` | Shared libraries, configs, tools | `packages/ui`, `packages/libs` |

Defined in `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Internal Packages

Packages reference each other with `workspace:*`:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

- `@repo/` is the namespace convention (unclaimable on npm, safe for internal use)
- Never use `../` relative imports across packages — use the package name
- Every package must have a unique `name` in its `package.json`

### Task Graph

When you run `turbo run build`, Turborepo:

1. Reads `turbo.json` to understand task definitions
2. Reads the lockfile to understand package dependencies
3. Builds a task graph (what runs, in what order)
4. Executes with max parallelism, caching results

### Caching

- First run: executes task, stores output in `.turbo/cache`
- Second run (same inputs): restores from cache instantly — shows `FULL TURBO`
- Cache key = hash of: source files, dependencies, env vars, task config
- `outputs` in turbo.json tells Turbo what files to cache (e.g., `.next/**`, `dist/**`)

---

## turbo.json (v2 Syntax)

**Critical:** v2 uses `tasks`, not `pipeline`. The old `pipeline` key will error.

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
    },
    "lint": {
      "dependsOn": ["^lint"],
    },
    "test": {
      "dependsOn": ["^build"],
    },
    "dev": {
      "cache": false,
      "persistent": true,
    },
  },
}
```

### Task Keys

| Key          | What it does                    | Example                             |
| ------------ | ------------------------------- | ----------------------------------- |
| `dependsOn`  | Run these first                 | `["^build"]`                        |
| `outputs`    | Files to cache                  | `[".next/**", "dist/**"]`           |
| `inputs`     | Files that affect the cache key | `["src/**"]`                        |
| `cache`      | Enable/disable caching          | `false` for dev servers             |
| `persistent` | Long-running (never exits)      | `true` for dev servers              |
| `env`        | Env vars that affect cache key  | `["API_URL"]`                       |
| `outputLogs` | Log verbosity                   | `"full"`, `"errors-only"`, `"none"` |

### The `^` Prefix

- `"dependsOn": ["^build"]` — run `build` in **dependency packages first**, then this package
- `"dependsOn": ["build"]` — run `build` in **this same package first** (same-package dependency)
- `"dependsOn": ["^build", "lint"]` — dependency packages build first AND this package's lint first

### Root Tasks

Tasks that only run at the repo root use `//#` prefix:

```json
{ "tasks": { "//#lint:root": {} } }
```

### Top-Level Config Keys

| Key                  | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `$schema`            | Schema validation URL                                    |
| `globalDependencies` | Files that invalidate ALL caches when changed            |
| `globalEnv`          | Env vars that invalidate ALL caches                      |
| `ui`                 | `"tui"` (interactive terminal) or `"stream"`             |
| `envMode`            | `"strict"` (default, must declare env vars) or `"loose"` |

---

## Package Setup Pattern

Every internal package follows this pattern:

**package.json:**

```json
{
  "name": "@repo/ui",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "...",
    "lint": "...",
    "test": "..."
  }
}
```

- `exports` defines what other packages can import
- `private: true` prevents accidental npm publish
- Scripts must match task names in `turbo.json`

**tsconfig.json:**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

---

## Root package.json

```json
{
  "name": "cicd-portfolio",
  "private": true,
  "packageManager": "pnpm@9.x.x",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.8.1"
  }
}
```

- `packageManager` field is **required** in v2
- Root scripts just delegate to `turbo run`
- Keep root minimal — root changes invalidate all caches

---

## CLI Commands

```bash
# Run tasks
turbo run build                    # Build everything
turbo run build --filter=web       # Build only the web app
turbo run build --filter=ui        # Build only the ui package
turbo run test --filter=ui...      # Test ui and everything it depends on

# Filtering
--filter=<package>                 # Exact package
--filter=<package>...              # Package + its dependencies
--filter=...<package>              # Package + its dependents
--filter=./apps/*                  # By directory

# Cache
turbo run build --force            # Ignore cache, run everything
turbo run build --dry-run          # Show what would run without running
turbo run build --summarize        # Show run summary after completion

# Other
turbo run dev                      # Start all dev servers
turbo prune --scope=web            # Create minimal subset for one app (useful for Docker)
```

---

## v2 Breaking Changes (from v1)

If you see old tutorials or code, watch for these:

| Old (v1)                       | New (v2)                 | Notes                    |
| ------------------------------ | ------------------------ | ------------------------ |
| `pipeline`                     | `tasks`                  | Config key in turbo.json |
| `outputMode`                   | `outputLogs`             | Matches CLI flag name    |
| `globalDotEnv`                 | use `globalDependencies` | Removed                  |
| `dotEnv`                       | use `inputs`             | Removed                  |
| `--scope`                      | `--filter`               | CLI flag                 |
| Loose env mode default         | Strict env mode default  | Must declare env vars    |
| Cache in `node_modules/.cache` | Cache in `.turbo/cache`  | Location changed         |

**Migration:** `npx @turbo/codemod migrate` handles most of these automatically.

---

## Common Gotchas

- **No lockfile = broken dependency graph.** Turborepo reads the lockfile to understand package relationships. Always commit `pnpm-lock.yaml`.
- **Root changes invalidate everything.** The root `package.json` is an implicit dependency of all packages. Keep root minimal.
- **Strict env mode.** If a task uses an env var, declare it in `env` in turbo.json or it won't be available (and won't affect cache key).
- **`workspace:*` not `*`.** Internal dependencies must use the `workspace:` protocol or pnpm will try to fetch from npm.
- **No nested packages.** `apps/a` and `apps/a/b` as separate packages will error.
- **Every package needs scripts.** If turbo.json defines a `build` task but a package has no `build` script, Turbo skips it silently. Make sure consuming packages have matching scripts.

---

## References

### Official Docs

- [Turborepo Documentation](https://turbo.build/repo/docs) — start here
- [turbo.json Configuration Reference](https://turborepo.dev/docs/reference/configuration) — all config options
- [Structuring a Repository](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository) — workspace layout
- [Configuring Tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks) — task graph, dependsOn, caching
- [create-turbo Reference](https://turborepo.dev/docs/reference/create-turbo) — CLI scaffolding tool
- [Upgrading to v2](https://turborepo.dev/docs/crafting-your-repository/upgrading) — migration guide

### Release Notes

- [Turborepo 2.0](https://turborepo.dev/blog/turbo-2-0) — breaking changes, `pipeline` → `tasks`
- [Turborepo 2.7](https://turborepo.dev/blog/turbo-2-7) — devtools, composable config
- [Turborepo 2.8](https://turborepo.dev/blog/2-8) — git worktrees, agent skill, `description` field
- [GitHub Releases](https://github.com/vercel/turborepo/releases) — all versions

### Guides

- [Turborepo + pnpm setup](https://nhost.io/blog/how-we-configured-pnpm-and-turborepo-for-our-monorepo) — practical walkthrough
- [Turborepo Examples](https://github.com/vercel/turborepo/tree/main/examples) — official example repos
