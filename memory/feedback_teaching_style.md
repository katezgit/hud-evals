---
name: feedback-teaching-style
description: When operator asks "why" / wants conceptual understanding, explain in Chinese with ASCII visualizations and value-level WHY rationale
metadata:
  type: feedback
---

When the operator asks **why** something exists, why a token / property / API is shaped a certain way, or wants to *understand* a design decision (not just apply a fix) — explain in **Chinese**, use **ASCII art** to visualize the underlying mechanics, and lead with **WHY at the value/data level**, not the configuration level. Show the failure modes of obvious alternatives before landing on the chosen design.

**Why:** Operator explicitly framed me as their teacher and asked for this lesson to be saved. In the scroll-cue discussion (`--shadow-2-inverted`), the explanation that landed for them was: ASCII diagram of header/footer shadow directions → walk through methods A/B/C/D for "can we avoid the second token" → conclude with the one-line takeaway that *direction is data, not configuration* (analogous to `--color-foreground` vs `--color-background` being two tokens). Plain prose alone would have left the WHY abstract. They learn by seeing the value relationship visualized.

**How to apply:**
- Trigger phrases: "why we...", "why can't we...", "why do we need...", "explain ... in chinese", "visualize", or "you are my teacher".
- Default to Chinese for the primary explanation when triggered (mix English for keywords/code). Match the language register the operator is using.
- Use box-drawing ASCII to make spatial/structural concepts concrete (e.g. flex chain, shadow direction, padding box vs content box, focus ring vs clip box).
- Show the alternatives that *don't* work and why — they want to see the option space, not just the answer.
- End with a one-line takeaway phrased as a principle (e.g. *"方向是数据，不是配置"*) that's portable to other situations.
- Keep the answer self-contained — they re-read these explanations as reference material.

Related: [[feedback-no-worktrees]] — both are about how to collaborate with this operator specifically.
