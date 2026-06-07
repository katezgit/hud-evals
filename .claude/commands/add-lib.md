Add a new sub-library to `packages/libs/`.

Library name: $ARGUMENTS

**Deliverables (both must land in the same feature branch):**

```
packages/libs/src/<name>.ts          source — library-engineer    (step 1)
packages/libs/src/<name>.test.ts     test   — unit-test-engineer  (step 2)
```

`packages/libs/` has no adversarial reviewer (per `library-engineer.md`), so the chain is shorter than `/add-component` — tests come right after the library lands.

1. Spawn `library-engineer` with `TASK_TYPE: new-lib` and the library name. It owns implementation, types, exports, and self-review (scope gate → duplicate check → API design → implement → exports → gates) per `.claude/agents/library-engineer.md`. It does **not** author the test file.

   If the library isn't yet specified, ask the user what functions it should contain before spawning, so the agent receives a concrete `CONTRACT`.

2. After `library-engineer` returns, spawn `unit-test-engineer` with the library name and the path of the new module. It authors `<name>.test.ts` against the public API per the doctrine in [`docs/testing/unit-testing-guidelines.md`](../../docs/testing/unit-testing-guidelines.md): happy path, edge cases (empty / null / extreme inputs), every documented thrown error, type-level tests where generics are non-trivial.

3. **Verify both deliverables exist before merging:**

   ```bash
   ls packages/libs/src/<name>.{ts,test.ts}
   ```

   If the test file is missing, re-spawn `unit-test-engineer`.

4. **Apply the merge gate from [`.state/phases.md`](../../.state/phases.md).**
