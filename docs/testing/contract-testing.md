# Contract Testing

Verifies that frontend and backend agree on API shape. Catches mock drift before it reaches E2E or production.

## When You Need This

Contract testing solves a **team coordination problem**. Whether you need it depends on your team structure:

| Situation                                                |    Contract testing?    | Pragmatic alternative                                                                                                       |
| -------------------------------------------------------- | :---------------------: | --------------------------------------------------------------------------------------------------------------------------- |
| Same team owns frontend + backend                        |           No            | Shared TypeScript types or OpenAPI-generated types. Type-check catches shape mismatches at build time. E2E covers the rest. |
| Separate frontend/backend teams, same repo               |          Maybe          | Generated types from a shared schema may suffice. Add Pact if API changes keep breaking integration.                        |
| Separate teams, separate repos, different release cycles |           Yes           | Consumer-driven contracts (Pact) — this is what they were built for.                                                        |
| Third-party APIs you don't control                       | Yes (schema validation) | Validate responses against OpenAPI spec or JSON Schema. Not Pact — you can't ask the provider to verify.                    |

**For startups and small teams:** shared types + E2E is the pragmatic path. Add contract testing when team separation makes "just talk to each other" unreliable.

## What Contract Tests Do

Contract tests answer one question: **does the real API still return what the frontend mocks assume?**

They do **not** test runtime behavior — only that both sides agree on the data shape (fields, types, status codes).

## Consumer-Driven Contracts

The most common approach is **consumer-driven** (e.g., [Pact](https://docs.pact.io/)):

1. **Frontend (consumer) writes the contract** — defines expectations: "I expect `GET /users` to return `{ id, name, role }`"
2. **Backend (provider) verifies against it** — runs the real API locally and checks: "do I satisfy this contract?"

Frontend defines what it needs, backend proves it delivers.

## Contract Tests vs API Design

Contract tests do **not** replace upfront API design. The timeline:

```sh
1. Both teams agree on API spec (OpenAPI/Swagger, or a shared doc)
   "GET /users returns { id, name, role }"
        │
        ▼
2. Teams go build independently
   - Backend builds the real API to match the spec
   - Frontend builds UI + mocks based on the spec
        │
        ▼
3. Contract tests verify they didn't drift apart
   (the spec said one thing — did both sides actually follow it?)
```

API design is a conversation that happens before coding. Contract tests are the **automated, ongoing verification** that both sides stay aligned after weeks of independent development.

## How They Run in CI

Consumer and provider sides run independently — no shared environment or staging needed:

```sh
Frontend CI (consumer side):
├── Unit tests
├── Contract tests                ← generates pact file from mock expectations
│   "Are my mocks still valid    (fast, no backend needed)
│    against the contract?"
└── Publishes pact to broker

Backend CI (provider side):
├── Unit + integration tests
├── Contract tests                ← runs real API locally, verifies against pact
│   "Does my API satisfy the
│    consumer's expectations?"
└── Deploy
```

- **Consumer side** runs in the quality gate (fast, pre-build) — it only checks expectations against a contract file
- **Provider side** runs after backend tests pass — it needs a running API, but locally in CI, not a staging deployment

## What Happens Without Contract Tests

```sh
Backend tests pass  (API works correctly)
Frontend tests pass (UI works against mocks)
Deploy together → breaks  (mocks were stale)
```

The gap between "mocks work" and "real API works" is invisible until E2E or production. Contract tests make that gap visible early.

## References

- [Pact - What is Contract Testing](https://docs.pact.io/#what-is-contract-testing)
- [Pact - How Pact Works](https://docs.pact.io/how_pact_works)
- [Martin Fowler - Contract Test](https://martinfowler.com/bliki/ContractTest.html)
