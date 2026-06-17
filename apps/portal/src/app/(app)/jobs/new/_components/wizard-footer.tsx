import type { ReactNode } from "react";

export function WizardFooter({ children }: { children: ReactNode }) {
  // Sticky inside the wizard's scrollable body. Short content → footer sits
  // right after content; long content → pins to scroll container's bottom edge.
  return (
    <div className="sticky bottom-0 z-page-chrome page-shell block py-0">
      <div className="mx-auto w-full max-w-[1100px] border-t border-border bg-elevated-surface">
        <div className="flex h-14 w-full items-center justify-between gap-2 px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
