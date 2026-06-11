import Link from "next/link";
import { Button } from "@repo/ui";
import "./globals.css";

// Renders OUTSIDE the root layout — owns its own <html>/<body>. Same color-scheme
// flip pattern as global-error.tsx so dark-mode users see the dark palette
// without a ThemeProvider in scope.
export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="light">
      <head>
        <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }`}</style>
        <title>Page not found</title>
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="flex max-w-[480px] flex-col items-center gap-6 px-6 text-center">
            <span className="inline-flex items-center rounded-md border border-border bg-muted-surface px-3 py-1.5 font-mono text-label font-medium text-muted-foreground">
              404
            </span>

            <h1 className="text-subtitle font-semibold text-foreground tracking-(--text-subtitle--letter-spacing)">
              Page not found
            </h1>

            <Button asChild variant="primary">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
