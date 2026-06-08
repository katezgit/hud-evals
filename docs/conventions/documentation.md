# LLM-Optimized Documentation Framework

**Purpose:** Methodology for creating minimal, high-signal documentation optimized for LLM consumption.

**Core Principle:** **Keep only what the LLM doesn't already know from training. Remove everything else.**

---

## Optimization Methodology

### The Knowledge Test (Primary Filter)

For every section, ask: **"Does the LLM already know this from training data?"**

| Content Type                                        | LLM Knows? | Action      | Reason                    |
| --------------------------------------------------- | ---------- | ----------- | ------------------------- |
| React hooks (useState, useEffect)                   | ✅ Yes     | ❌ Remove   | Covered in training data  |
| Next.js App Router fundamentals                     | ✅ Yes     | ❌ Remove   | Official docs in training |
| Generic best practices                              | ✅ Yes     | ❌ Remove   | Universal knowledge       |
| Zod validation basics                               | ✅ Yes     | ❌ Remove   | Library docs in training  |
| **Your Supabase setup**                             | ❌ No      | ✅ **Keep** | Project-specific          |
| **Your auth pattern** (`getUser` not `getSession`)  | ❌ No      | ✅ **Keep** | Project convention        |
| **Your return type** (`{ success, error?, data? }`) | ❌ No      | ✅ **Keep** | Project convention        |
| **Your file organization** (`app/actions/*.ts`)     | ❌ No      | ✅ **Keep** | Project-specific          |
| **iOS Safari gotchas** (button types)               | ❌ No      | ✅ **Keep** | Rare edge case            |

### Evaluation Framework

```sh
┌─ Read section
│
├─ Q1: Is this explaining what a framework/library does?
│  └─ YES → Remove (LLM knows React, Next.js, Zod, etc.)
│  └─ NO → Continue
│
├─ Q2: Is this a generic best practice?
│  └─ YES → Remove (LLM knows "validate user input", "handle errors", etc.)
│  └─ NO → Continue
│
├─ Q3: Are there multiple examples of the same pattern?
│  └─ YES → Keep 1 best example, remove others
│  └─ NO → Continue
│
├─ Q4: Is this YOUR project's specific implementation?
│  └─ YES → Keep (conventions, setup, gotchas)
│  └─ NO → Remove
│
└─ Q5: Can you reduce this further without losing critical info?
   └─ YES → Repeat process
   └─ NO → Done ✅
```

---

## Reduction Metrics

### Target Reductions by Doc Type

| Doc Type           | Target Reduction | Length Target | What to Keep                 |
| ------------------ | ---------------- | ------------- | ---------------------------- |
| Pattern/Guide docs | 60-80%           | 100-250 lines | Project patterns only        |
| Reference docs     | 40-60%           | 100-250 lines | Code templates + conventions |
| Architecture docs  | 20-40%           | 150-250 lines | Trees + decisions            |
| Troubleshooting    | 50-70%           | 80-150 lines  | Project gotchas only         |

### Signal-to-Noise Calculation

```
Signal = Project-specific knowledge (conventions, gotchas, decisions)
Noise = Generic explanations, redundant examples, verbose prose

Baseline (typical docs): 30% signal, 70% noise
Target (optimized): 90% signal, 10% noise
```

**How to measure:**

1. Count lines of project-specific content
2. Count lines of generic explanations
3. Calculate: `Signal % = (project lines / total lines) * 100`
4. Iterate until Signal % ≥ 90%

---

## Optimization Process (6 Steps)

### Step 1: Audit Current State

For each file, record:

```markdown
File: [name.md]

- Current lines: [X]
- Estimated generic content: [Y%]
- Estimated project-specific: [Z%]
- Redundant examples: [count]
- Verbose explanations: [count sections]
- **Verdict**: Can reduce to ~[N] lines ([R%] reduction)
```

### Step 2: Extract Unique Knowledge

Create a "Keep List" of project-specific knowledge:

```markdown
✅ KEEP (Project-Specific):

- Your specific setup/config
- Your conventions/patterns
- Your gotchas/edge cases
- Your decisions (why this vs that)

❌ REMOVE (Generic/LLM Knows):

- Framework/library explanations
- Generic best practices
- Multiple examples of same pattern (keep 1)
```

### Step 3: Create Minimal Reference

**Rules:**

- 70%+ code, 30% prose
- Max 1 example per pattern
- No framework explanations
- Project conventions only

### Step 4: Create Troubleshooting (If Needed)

Only include **project-specific gotchas**.

### Step 5: Create Index/Router

Decision tree routing users to the right file.

### Step 6: Archive & Update

1. Archive old files to `archived/` subfolder
2. Update cross-references
3. Measure improvement (before/after metrics)

---

## Quality Checklist

### ✅ Content Quality

- [ ] Zero generic framework/library explanations
- [ ] Every pattern is YOUR project's specific implementation
- [ ] No redundant examples (max 1 per pattern)
- [ ] Code-heavy (70%+ code, 30% prose)
- [ ] Decision trees replace "when to use" essays
- [ ] No sections that can be reduced further

### ✅ Structure Quality

- [ ] YAML frontmatter with `type` and `use_cases`
- [ ] "For LLMs:" directive at top
- [ ] Clear sections (Template → Patterns → Conventions → Decision Tree)
- [ ] Cross-references (no duplicate content)
- [ ] Glob-friendly naming (`reference.*`, `troubleshooting.*`)

### ✅ Length Quality

- [ ] Reference files: 100-250 lines
- [ ] Troubleshooting: 80-150 lines
- [ ] Index: 80-120 lines
- [ ] Each file is "irreducible" (can't cut without losing critical info)

---

## Common Mistakes

### ❌ Don't Do This

**1. Keeping Generic Examples**

```markdown
❌ BAD: "useState is a React hook that allows you to add state..."
✅ GOOD: [Just show YOUR usage in code]
```

**2. Multiple Examples of Same Concept**

```markdown
❌ BAD: 5 useActionState examples for different forms
✅ GOOD: One example showing YOUR standard pattern
```

**3. Verbose Explanations**

```markdown
❌ BAD: "Server Actions are a new feature introduced in Next.js 13 that enable..."
✅ GOOD: [Jump straight to code pattern]
```

**4. Duplicate Content**

```markdown
❌ BAD: Same auth pattern in 3 different files
✅ GOOD: Show once, cross-reference elsewhere
```

**5. Generic Best Practices**

```markdown
❌ BAD: "Always validate user input" / "Handle errors gracefully"
✅ GOOD: "Auth: Always getUser() not getSession() (security - RLS bypass risk)"
```

---

## Maintenance Strategy

| Trigger               | Action                                    |
| --------------------- | ----------------------------------------- |
| New project pattern   | Add to reference (if ≠ existing patterns) |
| New gotcha discovered | Add to troubleshooting                    |
| Convention changes    | Update ALL affected references            |
| Framework updates     | ONLY update if YOUR usage changes         |

### Growth Rules

- **Add new doc:** New major feature with ≥3 unique patterns, or existing doc would exceed 300 lines
- **Update existing:** Small pattern variation, additional convention/gotcha, under 300 lines after update
- **Split existing:** File exceeds 400 lines, covers 5+ unrelated topics

---

## Success Metrics

| Metric          | Target     | Measurement                                        |
| --------------- | ---------- | -------------------------------------------------- |
| Line reduction  | 50-80%     | (Before - After) / Before × 100                    |
| Signal-to-noise | 90:10      | Project-specific lines / Total lines               |
| Generic content | <10%       | Generic explanation lines / Total lines            |
| File length     | <250 lines | Line count per reference file                      |
| Redundancy      | 0          | Duplicate patterns across files                    |
| Irreducibility  | 100%       | Can't remove anything without losing critical info |

---

## Remember

> **If the LLM already knows it from training, you don't need to document it.**
> **Only document what makes YOUR project unique.**

1. ✅ Your setup/configuration
2. ✅ Your conventions/patterns
3. ✅ Your gotchas/edge cases
4. ✅ Your decisions (why this vs that)
5. ❌ NOT: Framework basics
6. ❌ NOT: Generic best practices
7. ❌ NOT: "How X works" explanations

**The goal:** Every line in your docs should answer "How do WE do this?" not "What is this?"
