// shadcn-source: from-scratch-approved:design-system-architect-2026-06-07 (n/a, 2026-06-07)
// No shadcn primitive; no Radix primitive. Authored from scratch per canonical.html.
//
// API decisions
// ─────────────────────────────────────────────────────────────────────────────
// Layout shell / className target:
//   `className` and `ref` attach to the OUTER centering wrapper (the full-bleed
//   flex container), not to the 360px inner column. Rationale: this is a
//   layout-shell component — its outermost element is the layout boundary.
//   Callers that need to adjust the centering container (e.g. override padding,
//   set a custom min-height) receive the right target. Callers that want to
//   adjust the 360px column's internals should use children/action slots.
//
// Centering wrapper:
//   Outer element: `flex items-center justify-center w-full h-full p-8`.
//   `h-full` assumes the parent content slot has a defined height (typical for
//   route-level content areas). If a caller's slot uses `min-h` without a fixed
//   `h`, the centering still works for content-overflow cases; vertical centering
//   degrades gracefully to top-alignment when the container has no height. This
//   is the correct default — callers can override via `className`.
//   `p-8` = 8 × 0.25rem = 2rem = 32px — maps directly to the canonical
//   `.content { padding: 32px }` from canonical.html. Token-generated utility,
//   no arbitrary value.
//
// heading: Composed from `label` by the component ("This {label} isn't
//   available." / "This {label} is in a different workspace.") — guarantees
//   HUD vocabulary discipline. Prop gives flexibility; composition prevents
//   drift. Wrong-workspace copy differs structurally (not just a token swap),
//   so a discriminated union on `variant` handles both cleanly.
//
// headingLevel: Configurable h1–h6. Default h2 — the component renders
//   INLINE inside a route whose page-header already owns the page <h1>
//   (e.g. JobHeader, TasksetHeader render h1 with the resource name). Nested
//   h1 is an outline defect (WCAG 1.3.1). Callers that genuinely replace
//   the whole content area (route-level not-found boundary with no page
//   header) may opt-in to "h1".
//
// action slot: ReactNode — matches ErrorState's `action` prop. Caller passes
//   a Next.js <Link> (or any element) styled like a Button; packages/ui has
//   no Next.js routing knowledge, so an {href, label} pair would require a
//   native <a> render here, which callers may need to override anyway.
//
// resourceId: Component-owned rendering (mono font, muted-foreground).
//   Accepted as a `string` prop and rendered as a styled <p>. The canonical
//   originally pinned text-meta-foreground (GLANCE/SCAFFOLDING tier, ink-700)
//   but that token measures 4.11:1 against --color-background in light mode
//   — fails WCAG 2.1 AA (1.4.3) for normal text (4.5:1 floor). The resource
//   ID is also too small (12px) to qualify as "large text" (3:1 floor needs
//   ≥18pt or ≥14pt bold). Upgraded to text-muted-foreground (ink-800 / READ
//   tier) which measures 7.56:1 light / 10.22:1 dark vs background — passes
//   AA + AAA. Semantic justification: the ID is a value the user reads to
//   cross-reference with logs/CLI (§5 of resource-not-found guideline), not
//   scaffolding that recedes — so READ tier is the correct semantic tier
//   regardless of contrast.
//
// root role/landmark: NO role on the root <div>. The component renders
//   INSIDE the route's existing <main> landmark (AppShell line 128); a
//   nested role="main" violates the single-landmark-per-document rule
//   (HTML AAM, WCAG 1.3.1). role="status" / "alert" are also wrong:
//   ResourceNotFound is static content the user lands ON, not a dynamic
//   status update or assertive interruption. The <h1>/<h2> heading is what
//   the screen reader announces; no live-region needed.
//
// wrong-workspace variant: second variant shape is wired but ships disabled
//   on day 1 (see ResourceNotFoundWrongWorkspaceProps below). Callers opt in
//   via variant="wrong-workspace" + workspaceName prop. Architecture is the
//   same discriminated union — adding the variant later is additive, not breaking.
// ─────────────────────────────────────────────────────────────────────────────
import * as React from "react"
import type { HTMLAttributes } from "react"

import { cn } from "@repo/ui/lib/cn"

// ── Types ─────────────────────────────────────────────────────────────────────

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

interface ResourceNotFoundBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * HUD primitive label — the canonical resource type noun.
   * Use exact HUD vocabulary: "Job", "Trace", "Taskset", "Environment".
   * Never "page", "resource", "item".
   */
  label: string
  /**
   * Resource ID as it appears in the URL (e.g. "job_9f3x").
   * Rendered in mono, muted-foreground — the user already has it in their
   * address bar; showing it lets them cross-reference logs and CLI output.
   */
  resourceId: string
  /**
   * Primary recovery CTA. Caller passes a Next.js <Link> (or any element)
   * visually styled as a primary Button. packages/ui has no routing knowledge.
   * Example:
   *   <Link href="/jobs" className={buttonVariants({ variant: "primary" })}>
   *     Go to Jobs
   *   </Link>
   */
  action: React.ReactNode
  /**
   * Heading element for the composed message.
   * @default "h2" — component renders inline; the route's page header
   *   typically owns the document <h1>. Pass "h1" only when the surface
   *   replaces the entire content area and no other h1 is rendered.
   */
  headingLevel?: HeadingLevel
  className?: string
}

interface ResourceNotFoundUnavailableProps extends ResourceNotFoundBaseProps {
  variant?: "unavailable"
}

interface ResourceNotFoundWrongWorkspaceProps extends ResourceNotFoundBaseProps {
  variant: "wrong-workspace"
  /**
   * Name of the workspace where the resource lives.
   * Shown in the sub-copy: "Switch to {workspaceName} to view it."
   * Required only for variant="wrong-workspace".
   */
  workspaceName: string
}

export type ResourceNotFoundProps =
  | ResourceNotFoundUnavailableProps
  | ResourceNotFoundWrongWorkspaceProps

// ── Helpers ───────────────────────────────────────────────────────────────────

function composeHeading(
  label: string,
  variant: ResourceNotFoundProps["variant"]
): string {
  if (variant === "wrong-workspace") {
    return `This ${label} is in a different workspace.`
  }
  return `This ${label} isn't available.`
}

function composeSubCopy(
  variant: ResourceNotFoundProps["variant"],
  workspaceName?: string
): string | null {
  if (variant === "wrong-workspace") {
    return `Switch to ${workspaceName ?? ""} to view it.`
  }
  // default/unavailable: sub-label is the resource ID only (rendered separately)
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

const ResourceNotFound = React.forwardRef<
  HTMLDivElement,
  ResourceNotFoundProps
>(({ className, label, resourceId, action, variant = "unavailable", headingLevel = "h2", ...rest }, ref) => {
  // Peel workspaceName from rest before spreading to the DOM.
  // The discriminated union types it on ResourceNotFoundWrongWorkspaceProps;
  // casting rest to extract it is safe because workspaceName is never an HTML
  // attribute, and the public discriminated-union API is unchanged.
  const { workspaceName, ...props } = rest as { workspaceName?: string } & HTMLAttributes<HTMLDivElement>
  const heading = composeHeading(label, variant)
  const subCopy = composeSubCopy(variant, workspaceName)
  const Heading = headingLevel

  return (
    // Outer centering shell — ref + className live here (layout-shell target).
    // w-full h-full: fills whatever the route's content slot provides.
    // p-8: 32px padding (--spacing × 8 = 2rem), matching canonical .content.
    // h-full assumes parent has a defined height; see header docblock.
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center",
        "w-full h-full p-8",
        className
      )}
      {...props}
    >
      {/* Inner 360px column — left-aligned content block */}
      <div className="flex flex-col gap-1 w-full max-w-[360px]">
        {/* Heading — text-subtitle, semibold, foreground, tight tracking.
            Element is configurable (default h2 — see header docblock).
            Visual styling is fixed; semantic level varies per route context. */}
        <Heading
          className={cn(
            "text-subtitle font-semibold text-foreground",
            "tracking-[-.01em] leading-[1.375rem]"
          )}
        >
          {heading}
        </Heading>

        {/* Resource ID — mono, code size, muted-foreground (READ tier).
            See header docblock: meta-foreground (4.11:1 light) fails WCAG AA;
            muted-foreground (7.56:1 light / 10.22:1 dark) passes AA + AAA and
            matches the semantic role (value the user reads to cross-reference). */}
        <p
          className={cn(
            "font-mono text-code font-regular text-muted-foreground",
            "leading-[1.25rem]",
            "mt-0.5"
          )}
        >
          {resourceId}
        </p>

        {/* Wrong-workspace sub-copy — shown only when variant="wrong-workspace" */}
        {subCopy != null && (
          <p className="text-body text-muted-foreground leading-[1.375rem]">
            {subCopy}
          </p>
        )}

        {/* Action slot — primary CTA; caller owns styling and routing.
            No wrapper-level tabindex / focusability concerns: the wrapper is
            a plain <div> with no role, no tabindex, no event handlers; the
            slotted element's focus behaviour is fully preserved. */}
        {action != null && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  )
})
ResourceNotFound.displayName = "ResourceNotFound"

export { ResourceNotFound }
