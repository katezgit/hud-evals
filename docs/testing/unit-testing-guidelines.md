# Unit Testing Guidelines

Unit tests verify that individual components and functions behave correctly in isolation. They are the fastest, cheapest, and most numerous tests in the stack.

> **Definition:** Tests one unit (function, component, module) in isolation. Mock all external dependencies (APIs, services, sibling modules, 3rd party libs with side effects). Only pure utility functions are called directly.

## Core thesis

> **"The more your tests resemble the way your software is used, the more confidence they can give you."** — Kent C. Dodds

A test is valuable in proportion to how closely it mirrors what a real user perceives and does. A test that asserts on internal class names, DOM structure, or framework wiring is not valuable — it locks in implementation and breaks on refactors that change nothing the user sees.

This single principle is the source of everything below.

## File Conventions

```sh
packages/ui/src/components/button/
├── button.tsx
├── button.test.tsx     ← co-located, same directory
└── index.ts

packages/libs/src/math/
├── math.ts
├── math.test.ts        ← co-located
└── index.ts
```

- Test file lives next to the source file: `foo.test.tsx`
- One `describe` block per exported unit
- Test descriptions start with a verb: `"renders children"`, `"calls onClick when clicked"`, `"throws on division by zero"`
- One behavior per `it`. Don't pile unrelated assertions into one test.

## What to Test vs What Not to Test

| Test                                              | Don't Test                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| User-visible behavior                             | Implementation details                                            |
| Interactions (click, type, submit)                | Internal state                                                    |
| Keyboard interaction (Esc closes, Arrow navigates)| Component lifecycle                                               |
| Focus management                                  | Prop drilling / spread-through                                    |
| Accessible name / role wiring                     | Third-party library internals (React, Radix, Testing Library)     |
| Controlled vs uncontrolled state contract         | CSS class names — **no exception**                                |
| Error states and validation messages              | `data-slot` lookups for class assertions                          |
| Loading states                                    | Ref forwarding mechanics (assert behavior the ref enables instead)|
| Edge cases and boundaries                         | Exact DOM structure                                               |

### No class-name assertions — including for design system variants

**Do not assert on Tailwind class names.** This applies to design system primitives too. `expect(button.className).toContain("bg-destructive")` does not prove the destructive variant produces a red button — it only proves a string appears in the class attribute. A token rename or refactor breaks the test without any visual defect; a regression that ships a wrong color but keeps the class name passes.

Variant-to-style verification belongs in **visual regression (Chromatic)**, which compares actual pixels against approved baselines. Unit tests verify behavior; Chromatic verifies appearance. Don't conflate the two layers.

What a design-system unit test *should* assert about variants:

- The variant prop is reflected as a `data-*` attribute on the element (`data-variant="destructive"`) — this is the public data contract that CSS selectors hang off, and breaking it breaks consumers.
- The variant changes accessible behavior, if any (e.g. `loading` variant disables the button and renders a spinner with an accessible label).

Everything else about the variant — its color, its padding, its border — is verified visually.

### Don't test the library

A `<Button>` that wraps a native `<button>` does not need `it("renders a button")`. That tests React's rendering machinery, not the component's contract. Common anti-patterns to skip:

- "Renders the underlying element by default."
- "Forwards ref to the underlying element." (Test what behavior the ref enables, if any.)
- "Spreads HTML attributes to the underlying element."
- "Exports the expected named exports."
- "Renders children." (Unless children rendering has non-trivial logic — e.g. compound components.)

These pass for any working React component and survive any behavioral regression. They cost lines and review attention without adding signal.

## Query Priority

Follow RTL's [query priority](https://testing-library.com/docs/queries/about#priority):

1. `getByRole` (with `name`) — accessible to everyone (screen readers, mouse, keyboard)
2. `getByLabelText` — form fields
3. `getByPlaceholderText` — when label isn't available
4. `getByText` — non-interactive elements
5. `getByDisplayValue` — form fields by current value
6. `getByAltText` — images
7. `getByTitle` — last-resort accessible identifier
8. `getByTestId` — escape hatch when nothing above works

`document.querySelector("[data-slot='...']")` is **below** `getByTestId` — it's reaching into framework internals to make assertions about structure. Use it only when verifying a `data-*` attribute contract is itself the goal (rare), and never to grab an element so you can assert on its `className`.

## User Interactions: `userEvent` over `fireEvent`

Always use `userEvent.setup()` — it simulates real browser behavior (focus, pointer events, keyboard) instead of firing synthetic events.

```tsx
// Bad — synthetic event, doesn't reflect real user behavior
fireEvent.click(button);

// Good — simulates full browser interaction chain
const user = userEvent.setup();
await user.click(button);
```

`userEvent.setup()` is called once per test, before `render`:

```tsx
it("calls onClick when clicked", async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);

  await user.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

`fireEvent` is acceptable **only** when `userEvent` cannot model the interaction — e.g. firing `change` on a hidden file input, or dispatching a custom event a component listens for. If you reach for it, leave a one-line comment explaining why.

## Async Patterns

- **`findBy*` for elements that appear asynchronously.** Don't wrap `getBy*` in `waitFor`.

  ```tsx
  // Bad
  await waitFor(() => expect(screen.getByText("Email required")).toBeInTheDocument());

  // Good
  expect(await screen.findByText("Email required")).toBeInTheDocument();
  ```

- **`waitFor` only for assertions that aren't a query** — e.g. waiting for a mock to be called.

  ```tsx
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  ```

- **No manual `act()`.** `userEvent` and async queries handle it. If you find yourself reaching for `act()`, almost certainly something else is wrong (synchronous state update fired outside an event handler, fake timers not advanced, etc.). The narrow legitimate use is advancing fake timers after an awaited state transition — leave a comment if you do it.

## Mocking Strategy

| Mock                                                    | Don't Mock                                       |
| ------------------------------------------------------- | ------------------------------------------------ |
| API calls (fetch, axios)                                | Pure utility functions — call them directly      |
| Browser APIs (localStorage, IntersectionObserver)       | The component under test                         |
| Third-party libs with side effects (analytics, logging) | React, Radix, Testing Library                    |
| Timers (`jest.useFakeTimers()`)                         | Simple child components — render them            |
| Router/navigation                                       | The DOM (`jsdom` is the system under test)       |

```tsx
// Mock an API module
jest.mock("@/services/api", () => ({
  fetchUsers: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/dashboard",
}));
```

## Test Helpers for Complex Components

When a component requires providers or setup (forms, context, router), create a focused test helper in the same test file:

```tsx
function TestForm({
  onSubmit = () => {},
  defaultValues = { email: "" },
  required = false,
}: {
  onSubmit?: (data: { email: string }) => void;
  defaultValues?: { email: string };
  required?: boolean;
}) {
  const form = useForm({ defaultValues });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          rules={required ? { required: "Email is required" } : undefined}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}
```

Keep helpers minimal — only the props you need to control in tests.

## Test Structure

### `describe` and `it` — BDD naming

These names come from BDD (Behavior-Driven Development). Tests read as English sentences:

- **`describe("Button", ...)`** — names the subject
- **`it("renders children", ...)`** — describes one behavior

Read together: **"Button — it renders children"**. That's why test descriptions start with a verb (`"renders children"`) not `"should render children"` — the `it` already implies the expectation.

`describe` blocks can nest for sub-categories:

```tsx
describe("Button", () => {
  describe("when disabled", () => {
    // "Button when disabled..."
    it("does not call onClick", () => {}); // "...it does not call onClick"
  });
});
```

`test()` is an alias for `it()` in Jest — same function, different readability style. We use `it()` for consistency.

### Organizing by concern

```tsx
describe("Button", () => {
  it("renders the children as the accessible name", () => { ... });
  it("calls onClick when clicked", async () => { ... });
  it("calls onClick when Enter is pressed while focused", async () => { ... });
  it("does not call onClick when disabled", async () => { ... });
  it("exposes data-variant and data-size for CSS targeting", () => { ... });
  it("renders the child element when asChild is set", () => { ... });
});
```

Each test is self-contained — no shared mutable state between tests. If you need setup, prefer a helper function over `beforeEach` with shared variables.

## Snapshot Tests

**Don't use snapshot tests for UI components.** Use them only for specific cases.

### When Snapshots Are Useful

- **Serialized data structures** — API responses, config objects, generated schemas
- **Regression detection** — stable, rarely-changed outputs
- **Error messages** — ensuring user-facing error text doesn't change

### Why Not for UI Components

1. **Test implementation, not behavior** — a passing snapshot doesn't mean the component works
2. **Noise** — break on every minor change (className, wrapper div, formatting)
3. **Blind updates** — developers update snapshots without reviewing diffs
4. **Unreadable diffs** — large snapshot files obscure real changes in PRs
5. **False confidence** — green tests with broken interactions

| Instead of                  | Use                                                         |
| --------------------------- | ----------------------------------------------------------- |
| Snapshot of rendered output | RTL queries (`getByRole`, `getByText`)                      |
| Snapshot of component tree  | Behavioral assertions (`userEvent.click`, form submissions) |
| Visual regression snapshots | Chromatic (already in CI)                                   |

## Test Determinism

A flaky test is worse than no test — it erodes trust in the entire suite. Common causes and fixes:

| Cause                         | Fix                                                             |
| ----------------------------- | --------------------------------------------------------------- |
| Timers / `setTimeout`         | `jest.useFakeTimers()` + `jest.advanceTimersByTime()`           |
| Random IDs / timestamps       | Mock `Date.now()` or `crypto.randomUUID()`                      |
| Shared state between tests    | Each test renders its own component, no shared `let` variables  |
| Animation / transition timing | Disable animations in test setup or use `waitFor`               |
| Test order dependency         | Tests must pass in any order — never depend on prior test state |

## Coverage Targets

- **Shared packages (`ui`, `libs`):** Behavioral coverage of the public API — every exported unit has at least one test covering its contract. Line coverage is a side-effect, not a target.
- **App components (`apps/`):** Test user-facing behavior at the screen / flow level. Most coverage comes from integration tests and Playwright.
- **Pure utility functions:** 100% line + branch coverage — they're cheap to test and have clear contracts.

Coverage is a floor, not a goal. High coverage with bad tests is worse than moderate coverage with meaningful behavioral tests. A class-name assertion counts toward coverage and adds zero confidence.

## Anti-patterns reference

Quick reference for the violations most commonly found in this codebase, with concrete before/after.

### 1. Asserting Tailwind class names

```tsx
// Bad
it("trigger has h-8.5 class for default size", () => {
  render(<TestSelect />);
  expect(screen.getByRole("combobox").className).toContain("h-8.5");
});

// Good — delete it. Verify the rendered size in Chromatic.
// If you need to assert behavioral coupling to a size, assert on data-size:
it("exposes the size prop as data-size", () => {
  render(<Select size="sm" />);
  expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm");
});
```

### 2. `document.querySelector("[data-slot='x']")` to grab internal DOM

```tsx
// Bad
const content = document.querySelector("[data-slot=select-content]");
expect(content.className).toContain("shadow-popover");

// Good — query by role, assert behavior
const listbox = await screen.findByRole("listbox");
expect(within(listbox).getByRole("option", { name: "Alpha" })).toBeInTheDocument();
```

### 3. `fireEvent` instead of `userEvent`

```tsx
// Bad
fireEvent.click(trigger);

// Good
const user = userEvent.setup();
await user.click(trigger);
```

### 4. Re-proving React / Radix works

```tsx
// Bad — these test React, not Button
it("renders a <button> by default", () => { ... });
it("forwards ref to the underlying button element", () => { ... });
it("buttonVariants returns a className string", () => { ... });

// Good — test Button's own contract
it("does not call onClick when disabled", async () => { ... });
it("calls onClick when Enter is pressed", async () => { ... });
it("renders the child element when asChild is set", () => { ... });
```

### 5. `waitFor(() => expect(getBy…))` instead of `findBy…`

```tsx
// Bad
await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());

// Good
expect(await screen.findByText("Saved")).toBeInTheDocument();
```

### 6. Multiple unrelated assertions in one `it`

```tsx
// Bad
it("works", async () => {
  const user = userEvent.setup();
  render(<Form />);
  expect(screen.getByLabelText("Email")).toBeInTheDocument();
  await user.type(screen.getByLabelText("Email"), "x@y.z");
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(screen.getByText("Thanks")).toBeInTheDocument();
});

// Good — one behavior per test
it("renders the email field", () => { ... });
it("submits the typed value", async () => { ... });
it("shows confirmation after submit", async () => { ... });
```

## References

- [Testing Library — Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Testing Library — Query Priority](https://testing-library.com/docs/queries/about#priority)
- [Kent C. Dodds — Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Kent C. Dodds — Avoid the Test User](https://kentcdodds.com/blog/avoid-the-test-user)
- [Kent C. Dodds — Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
