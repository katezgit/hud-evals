# Tech Stack

## Core

| Layer                | Tool                               |
| -------------------- | ---------------------------------- |
| Monorepo             | Turborepo + pnpm workspaces        |
| Framework            | React 19.2                         |
| Language             | TypeScript 5.9                     |
| Apps                 | Next.js 16.5.11 (App Router)       |
| Bundler              | Vite 7.3                           |
| UI Primitives        | Radix UI                           |
| Styling              | Tailwind CSS 4.1.18                |
| Variants             | class-variance-authority (cva)     |
| Component Dev        | Storybook 10.2                     |
| Unit/Component Tests | Jest 30 + React Testing Library 16 |
| E2E Tests            | Playwright                         |
| CI/CD                | GitHub Actions                     |
| Deployment           | Vercel (staging + production)      |
| Package Manager      | pnpm                               |
| Animation            | Framer Motion                      |

## Architecture Decisions

- `@repo/` scope for internal packages (`@repo/ui`, `@repo/libs`)
- `packages/ui` = shared design system components consumed by all apps in `apps/` (single source of truth)
- Tailwind v4 CSS-first config (`@theme`), no `tailwind.config.js`
- Radix UI primitives styled with Tailwind
- `cn` utility (clsx + tailwind-merge) for class merging
- Jest 30 ESM-native with `ts-jest`

## Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 111+            |
| Firefox | 128+            |
| Safari  | 16.4+           |
