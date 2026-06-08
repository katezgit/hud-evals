# @repo/libs — FAQ

## Does unused code from @repo/libs end up in the web app bundle?

**No.** Tree-shaking eliminates unused exports in production builds. This works because:

1. **ESM** — the package uses `"type": "module"`, which enables static analysis
2. **`"sideEffects": false`** — declared in `package.json`, telling bundlers it's safe to drop unused exports without analyzing the code
3. **Pure functions** — all utilities are pure (no global state, no side effects), so bundlers can confidently eliminate them
4. **Next.js / webpack 5** — supports tree-shaking of both named and namespace (`import *`) imports via inner graph analysis

Sub-library imports (`@repo/libs/math`) further narrow the scope — only the specific module is pulled in, not the entire package.
