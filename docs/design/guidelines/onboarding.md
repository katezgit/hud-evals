# Design: Onboarding

## Rules

1. **Optimize for TTFHW under 5 minutes.** Time to First Hello World is the north-star metric. Instrument everything around it.
2. **Try before signup.** No email gate before the playground. No credit card required for the test tier.
3. **Docs are the onboarding.** Most developers go to docs before the dashboard. The docs page is the quickstart, tutorial, and activation flow in one.
4. **Three-layer flow — do not merge them:**
   - Public quickstart with copy-pasteable code that works
   - Sandbox with pre-issued test keys
   - Production keys + billing only after commitment
5. **Write docs for AI agents.** Ship `llms.txt` and `llms-full.txt`. Every reference page must be self-contained with complete, runnable code examples. Every error response documented with status codes and schemas.
6. **Personalize by use case, not persona theatre.** A 2–3 question intake ("which language?", "which use case?") that actually changes the code samples and tutorial shown. Skip welcome surveys that change nothing.
7. **Instrument five funnel events:** Landing → Signup → API key issued → First successful call → First call from their own deployed code. Drop-off between any two is a fixable bug.

## Checklist

**Phase 1 — Pre-signup (the docs)**
- [ ] Public quickstart on a single page, copy-pasteable, works as-is with a placeholder key
- [ ] Public API reference — every endpoint has a complete example request and complete example response
- [ ] Code samples in at least 3 languages relevant to your audience
- [ ] `llms.txt` and `llms-full.txt` published at root
- [ ] No login wall on any of the above

**Phase 2 — Signup to first call**
- [ ] Signup takes email + password only — collect the rest later
- [ ] Test API key issued immediately, visible on the next screen
- [ ] Quickstart code on that same screen has the developer's actual test key already substituted in
- [ ] Sandbox accepts calls immediately, no manual approval
- [ ] No credit card required for the test tier

**Phase 3 — Hello world to production**
- [ ] Clear distinction between test and live keys; switching is one toggle
- [ ] Webhook setup has a local-testing tool (CLI like `stripe listen`)
- [ ] Error responses documented in full; common-error pages with fixes
- [ ] Usage dashboard readable in 5 seconds

**Phase 4 — Instrumentation**
- [ ] Track funnel: landing → signup → key issued → first successful sandbox call → first call from a deployed app → first paid call
- [ ] Cohort each step by signup source, language, use case
- [ ] Alert on funnel regressions weekly

## Don't

- Long product tours — make the docs good instead
- Gamification, badges, streaks
- Email drip sequences as primary onboarding — if activation depends on email, the in-product flow is broken
- Founder-led onboarding calls for self-serve tiers — reserve for enterprise
