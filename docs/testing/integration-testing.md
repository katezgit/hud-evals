# Integration Testing: Mock API vs Real API

## Key Takeaway

In this project, we classify tests with mocked APIs as **integration tests**, not E2E tests. This is a deliberate convention — Playwright's own docs call everything "end-to-end" and Kent C. Dodds uses "integration" for RTL/jsdom-level tests. What matters is the layered approach, not the label: mock-based browser tests and real-backend browser tests catch different bugs and both have a place.

> For definitions of all test types, see the [Glossary](glossary.md).

## What Playwright Actually Recommends

- **Don't test what you don't control** — avoid testing external sites/third-party servers
- **Use `page.route()`** to intercept requests to **external dependencies** you don't control, fulfilling with controlled test data
- **Test against your own backend** when possible — Playwright recommends real server interaction for your own APIs
- **For databases** — use isolated test data (ephemeral databases, Docker containers, or fixture-based setup/teardown). Staging environments are a pragmatic fallback but are shared and can be flaky

Source: [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## The Industry Standard: Layered Testing

1. **Frontend integration tests** (mocked API) — fast, deterministic, every PR
2. **Contract tests** (e.g., schema validation, generated types) — prevent mock drift
3. **True E2E tests** (real backend) — critical paths only

### What Are Critical Paths?

User flows where a bug causes the most damage — flows that **must work or the product breaks**. True E2E tests are slow, flaky, and expensive to maintain, so you only run them against a real backend for flows where mock drift would hurt the most:

- **Auth** — login, signup, sessions (cookies, tokens, redirects across frontend + backend + auth provider — mocks can't catch real integration failures)
- **Payments / checkout** — money involved, a missed bug is costly
- **Data mutations** — create/update/delete where frontend + backend validation + DB constraints all need to agree

Everything else (table renders, form validation UI, state transitions) is fine with mocked APIs — the cost of a mock-related miss is lower.

## Downsides of Pure Mocking (Easy to Overlook)

- **Mock drift** — backend evolves, mocks go stale, tests pass but real integration is broken
- **False confidence** — testing assumptions about the API, not the API itself
- **Missed bugs** — auth flows, CORS, serialization mismatches, race conditions, backend validation
- **Maintenance cost** — every API change requires updating mocks manually
- **SSR blind spot** — `page.route()` only intercepts browser-side requests, not server-side fetches (relevant for Next.js Server Components). Mitigations: use MSW with server-side integration (`server.listen()`), point the app at a mock server via environment variables during test runs, or structure Server Components to delegate data fetching to injectable services that can be swapped in tests

## What This Means for This Project

The Playwright tests in `apps/{web,portal}/e2e/` should be clear about what they are:

- Tests using `page.route()` to mock API calls = **integration tests** (valuable, keep them)
- If critical flows (auth, data mutations) are only tested against mocks = **coverage gap**
- Consider adding contract tests or a thin real-backend E2E layer for high-stakes paths

## References

- [Playwright - Mock APIs](https://playwright.dev/docs/mock)
- [Playwright - Best Practices](https://playwright.dev/docs/best-practices)
- [Kent C. Dodds - The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Kent C. Dodds - Write Tests. Not Too Many. Mostly Integration.](https://kentcdodds.com/blog/write-tests)
- [Martin Fowler - The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Martin Fowler - Integration Test](https://martinfowler.com/bliki/IntegrationTest.html)
- [Google Testing Blog - Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
