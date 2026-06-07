# Auto-Reload

After any major codebase change that affects app runtime (layout, providers, routes, shared `packages/ui/` components, tokens/CSS), automatically restart the dev server. Skip for doc-only or memory-only changes.

```bash
lsof -ti:{{DEV_PORT}} | xargs kill -9 2>/dev/null
pnpm dev   # run in background
```

Verify `Ready in …` appears in the log, then report the URL.
