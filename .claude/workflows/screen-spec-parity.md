# Screen Spec — Peer Parity Check

A screen spec is not complete until a Peer Parity Check section is written. Product-designer must run this before marking any screen spec as ready for implementation.

## Procedure

1. **Name a Parity target** at the top of the spec, directly below the title/frontmatter block. This is the canonical sibling screen the spec must align with structurally.

   If no sibling exists yet, write: `Parity target: none (canonical pattern for {category})` and document what structural decisions this spec establishes as the pattern.

2. **Diff structural decisions** against the parity target across these axes:

   | Axis | Question |
   | --- | --- |
   | Header treatment | Does the page have an `<h1>` entity title? Where do utility actions live? |
   | Container / card pattern | Are primary data rows inside a single bordered card, or naked on the page background? |
   | Tab placement | Does the tab bar sit below the header (correct), or is it the first element (wrong)? |
   | Expand behavior | Does expand/collapse live inside the card container (correct), or produce a second card below it (wrong)? |
   | Footnote / InfoNote sizing | What font-size token is used for page-bottom notes? Should match parity target. |

3. **Explicitly state same/different with rationale** for each axis. Differences must be intentional and documented — not oversights.

4. **Write a "Peer Parity Check" section** in the spec, immediately before "Design System Gaps".

## Rationale

Screens in the same category must share a visual grammar. Structural drift between siblings causes inconsistent user mental models and expensive implementation rework.
