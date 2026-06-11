import type { ReactNode } from "react";

export function OptionalLabel({ children }: { children: ReactNode }) {
  return (
    <span>
      <span className="font-semibold text-foreground">{children}</span>
      <span className="ml-1 font-normal text-muted-foreground">— optional</span>
    </span>
  );
}
