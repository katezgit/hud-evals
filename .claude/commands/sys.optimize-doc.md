---
description: Optimize documentation for LLM consumption (reduce tokens, increase signal)
argument-hint: [file-path]
---

## Workflow

1. Read file at $ARGUMENTS
2. Read framework at `docs/conventions/documentation.md`
3. Check YAML frontmatter (add if missing, see Metadata Requirements below)
4. Audit → Apply framework → Output optimized version

## Metadata Requirements

All documentation files MUST include YAML frontmatter at the top:

```yaml
---
description: Brief description of what this document covers
tags: [relevant, tags, for, categorization]
applies_to: Who/what this applies to (optional)
status: Active|Draft|Deprecated (optional)
last_updated: YYYY-MM-DD (optional)
---
```

**Required fields:**

- `description`: One-line summary (helps LLMs understand purpose)
- `tags`: Array of relevant keywords (for search/categorization)

**Optional fields:**

- `applies_to`: Scope (e.g., "All team members (human and AI agents)")
- `status`: Document lifecycle state
- `last_updated`: Last modification date

**Example:**

```yaml
---
description: Project-specific git conventions and phase-based workflows
tags: [git, conventions, workflow, commits, pr, phase]
applies_to: All team members (human and AI agents)
status: Active
last_updated: 2025-12-07
---
```

## Audit Output Template

```sh
File: [name]
Current: [X] lines ([Y%] generic, [Z%] project-specific)
Target: ~[N] lines ([R%] reduction)
```

## Optimized Output Template

```sh
BEFORE: [X] lines ([Y%] generic)
AFTER: [N] lines ([Z%] generic)
Reduction: [R%]
Signal-to-noise: [before] → [after]
```

## User Choice

After showing optimized version, ask:

1. Overwrite original
2. Save to new file
3. Review changes first
