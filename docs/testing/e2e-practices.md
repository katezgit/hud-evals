# E2E Practices

Patterns and tradeoffs learned while building E2E tests.

## Test Isolation: Create-in-Test Pattern

**Pattern:** Tests that modify data (edit, delete) create their own data first.

```ts
test("Delete employee", async ({ page }) => {
  // Setup: create data to delete
  const fullName = await createEmployee(page, {...});

  // Act: delete it
  await page.getByRole("button", { name: `Delete ${fullName}` }).click();
  // ...
});
```

**Why not use shared/seeded data?**

| Approach                      | Problem                                                |
| ----------------------------- | ------------------------------------------------------ |
| Shared seed data              | Parallel tests conflict (both try to edit same record) |
| Test depends on previous test | Can't run tests individually, order-dependent          |
| Create in test                | ✅ Isolated, parallelizable, self-contained            |

**Tradeoff:** If create breaks, edit/delete tests fail too — but the isolation benefits outweigh this.

**When to use what:**

| Data type                      | Approach            |
| ------------------------------ | ------------------- |
| Mutable (edit, delete)         | Create in test      |
| Read-only (view, list, search) | Seeded data is fine |

## Arrange-Act-Assert

Every test follows this structure:

```ts
test("Edit employee", async ({ page }) => {
  // Arrange — get to starting state
  await login(page);
  const fullName = await createEmployee(page, {...});

  // Act — the one action being tested
  await page.getByRole("button", { name: `Edit ${fullName}` }).click();
  // ... perform edit ...

  // Assert — verify outcome
  await expect(page.getByRole("status")).toContainText("updated");
});
```

**"One story per test"** means one Act section, not one line of code. Setup (Arrange) doesn't count as a separate story.

## Helper Functions vs Page Objects

**Helper functions** (current approach):

- Extract repeated setup logic (`createEmployee`, `login`)
- Keep selectors inline in tests
- Simple, no abstraction layer

**Page Objects:**

- Extract selectors into classes
- Useful when: many tests share complex selectors, selectors change frequently
- Risk: over-engineering for small test suites

**Rule of thumb:** Start with helpers. Add page objects only when selector duplication becomes painful across 10+ tests.
