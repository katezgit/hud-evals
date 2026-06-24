import type { Metadata } from "next";
import { LibraryShell } from "./_components/library-shell";

export const metadata: Metadata = {
  title: "Library",
};

export default function LibraryPage() {
  // Content-height page: page-shell takes the natural height of its children
  // and the page (<main>) scrolls when content exceeds the viewport. Matches
  // the Job-detail Tool Usage reference — no max-h, no inner-scroll, no blank
  // chrome below the last row.
  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display font-semibold text-foreground">Library</h1>
        <p className="text-muted-foreground">
          Saved jobs and traces
        </p>
      </header>
      <LibraryShell />
    </div>
  );
}
