# Testing Glossary

Shared vocabulary for testing terms used across this manual. When teams use different definitions for the same word, bugs slip through the gaps.

## Test Types

| Test Type            | What It Means                                                                                                                                                             | Mocking Level                                                                                                                                                | Owned by            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **Unit test**        | Tests one unit (function, component, module) in isolation from the rest of the system. Validates expected behavior of isolated source code.                               | Heavy — mock all external dependencies (APIs, services, sibling modules, 3rd party libs with side effects). Only pure utility functions are called directly. | Frontend or Backend |
| **Integration test** | Tests multiple units working together. On frontend: composed components, or UI + mocked API (e.g., `page.route()`, MSW). On backend: API + database, service + service.   | Moderate — real interactions between units under test, mock external boundaries.                                                                             | Frontend or Backend |
| **Contract test**    | Verifies API shape agreement between consumer (frontend) and provider (backend). Does not test runtime behavior — only checks that both sides agree on the data contract. | N/A — tests schema/contract, not runtime behavior.                                                                                                           | Shared              |
| **E2E test**         | Full stack test. Real browser + real backend + real database. Minimal mocking — only external third-party services are stubbed.                                           | Minimal                                                                                                                                                      | Shared              |
| **Smoke test**       | Quick, shallow tests verifying core functionality works at all. Fast gate before deeper testing — if smoke fails, skip the rest.                                          | Varies                                                                                                                                                       | Either              |
| **Visual test**      | Screenshot comparison against a baseline image. Catches rendering regressions that behavioral tests cannot see (layout, color, spacing).                                  | Depends on layer — component-level has none, page-level may mock API data.                                                                                   | Frontend            |

## Common Misconceptions

**"Our Playwright tests with `page.route()` are E2E tests"**
No. If the API is mocked, it's an integration test. E2E means the full stack is running. This matters because integration tests can't catch mock drift, auth flow failures, or backend validation bugs.

**"Unit tests should test implementation details to be thorough"**
No. Test behavior (what the user sees and does), not implementation (internal state, CSS classes, lifecycle methods). Implementation-coupled tests break on every refactor without catching real bugs.

**"More E2E tests = better coverage"**
No. E2E tests are slow, flaky, and expensive. The industry standard is a layered approach: many unit tests, moderate integration tests, few E2E tests (critical paths only). Google's testing guidance explicitly recommends fewer E2E tests.

**"Contract tests replace API design"**
No. Teams agree on API spec upfront (OpenAPI/Swagger). Contract tests are the automated, ongoing verification that both sides stayed aligned after weeks of independent development.

## Key Concepts

### Critical paths

User flows where a bug causes the most damage — flows that **must work or the product breaks**. True E2E tests are reserved for these:

- **Auth** — login, signup, sessions
- **Payments / checkout** — money involved
- **Data mutations** — create/update/delete where frontend + backend validation + DB constraints all need to agree

### Mock drift

Backend evolves, frontend mocks go stale. Tests pass against outdated mocks, but real integration is broken. Contract tests exist to catch this.

### Test determinism

A test that sometimes passes and sometimes fails (flaky) is worse than no test — it erodes trust in the entire test suite. Common causes: timing/race conditions, shared state between tests, dynamic content (timestamps, random IDs), environment differences.

## References

- [Kent C. Dodds - The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Kent C. Dodds - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Martin Fowler - The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Martin Fowler - Integration Test](https://martinfowler.com/bliki/IntegrationTest.html)
- [Google Testing Blog - Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
- [Pact - What is Contract Testing](https://docs.pact.io/#what-is-contract-testing)
