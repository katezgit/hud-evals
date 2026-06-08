# Lighthouse Performance Improvements

Baseline: `/employees` page — Feb 15, 2026

## Current Scores

| Category       | Score | Target |
| -------------- | ----- | ------ |
| Performance    | 91    | ≥90 ✅ |
| Accessibility  | 98    | ≥95 ✅ |
| Best Practices | 100   | ≥90 ✅ |
| SEO            | 100   | ≥90 ✅ |

## Key Metrics

| Metric | Current | Good   | Status |
| ------ | ------- | ------ | ------ |
| FCP    | 0.8s    | ≤1.8s  | ✅     |
| LCP    | 3.4s    | ≤2.5s  | ⚠️     |
| TBT    | 150ms   | ≤200ms | ✅     |
| CLS    | 0       | ≤0.1   | ✅     |
| SI     | 0.8s    | ≤3.4s  | ✅     |

## Issues to Fix

### 1. LCP 3.4s (High Priority)

**Problem:** 2.6s gap between FCP (0.8s) and LCP (3.4s)

**Root cause:** Page shell renders immediately, but employee table waits for API data fetch.

**Fix options:**

- [ ] Add loading skeleton that qualifies as LCP element (quick win)
- [ ] Server-side render employee data (bigger change)
- [ ] Optimize API response time if slow

**Expected impact:** LCP drops to ~1s

### 2. Render-blocking CSS (Medium Priority)

**Problem:** `c0e1089a25ac1b8a.css` (8.6 KiB) blocks render for 160ms

**Fix options:**

- [ ] Inline critical CSS in `<head>`
- [ ] Use `media="print"` onload trick for non-critical CSS
- [ ] Split CSS chunks

**Expected impact:** -160ms FCP

### 3. Legacy JavaScript (Low Priority)

**Problem:** 11 KiB of legacy JS for modern browsers

**Fix options:**

- [ ] Check Babel/SWC config for unnecessary polyfills
- [ ] Use module/nomodule pattern
- [ ] Review browserslist config

**Expected impact:** -11 KiB bundle size

### 4. Unused JavaScript (Low Priority)

**Problem:** 21 KiB unused JS

**Fix options:**

- [ ] Dynamic imports for heavy components
- [ ] Review tree-shaking effectiveness
- [ ] Analyze with `@next/bundle-analyzer`

**Expected impact:** -21 KiB bundle size

### 5. Heading Order (Quick Fix)

**Problem:** `<h3>` used for employee names without preceding `<h1>`/`<h2>`

**Location:** Employee card component

**Fix:**

- [ ] Change employee name from `<h3>` to `<p>` or `<span>`
- [ ] Or add proper heading hierarchy to page

**Expected impact:** Accessibility 98 → 100

## Priority Order

1. **Heading order** — 5 min fix, +2 accessibility
2. **LCP skeleton** — 30 min, biggest perf win
3. **Render-blocking CSS** — 1 hr, minor improvement
4. **JS optimizations** — Low ROI, defer
