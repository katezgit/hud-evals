import type { Metadata } from "next";
import { LibraryShell } from "./_components/library-shell";

export const metadata: Metadata = {
  title: "Library",
};

export default function LibraryPage() {
  // h-full + min-h-0 turn page-shell into a bounded flex column that fills
  // <main>'s content area. Header is shrink-0; LibraryShell takes flex-1 and
  // owns the inner scroll. Removes the brittle max-h-[calc(100vh-Xrem)] guess
  // — the scroll region is always exactly the remaining space.
  return (
    <div className="page-shell h-full min-h-0">
      <header className="shrink-0 page-header">
        <h1 className="text-display font-semibold text-foreground">Library</h1>
        <p className="text-muted-foreground">
          Saved jobs and traces
        </p>
      </header>
      <LibraryShell />
    </div>
  );
}
