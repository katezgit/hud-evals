# Naming Conventions

## General Naming

- **Files**: kebab-case (`user-profile.ts`, `job-card.tsx`)
- **Components**: PascalCase (`UserProfile`, `JobCard`)
- **Functions/Variables**: camelCase (`calculateScore`, `userProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RESULTS`, `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfileData`, `JobMatchResult`)

## Dialog Naming

Use **"dialog"** (not "modal") in file and component names — aligned with Radix UI and the
`@repo/ui` design system.

Every dialog file must include the **entity** it operates on:

| Pattern                        | Example file                 | Example component      |
| ------------------------------ | ---------------------------- | ---------------------- |
| `<entity>-<action>-dialog.tsx` | `employee-delete-dialog.tsx` | `EmployeeDeleteDialog` |
| `<entity>-form-dialog.tsx`     | `employee-form-dialog.tsx`   | `EmployeeFormDialog`   |

Bad: `delete-dialog.tsx` (delete what?), `form-modal.tsx` (wrong term + no entity).
