import Link from "next/link";
import "./globals.css";

// Renders OUTSIDE the root layout — owns its own <html>/<body>. Same color-scheme
// flip pattern as global-error.tsx so dark-mode users see the dark palette
// without a ThemeProvider in scope.
export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="light">
      <head>
        <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }`}</style>
        <title>Not found</title>
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-display">404</h1>
          <p className="text-muted-foreground">This page doesn’t exist.</p>
          <Link
            href="/"
            className="rounded-control bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
          >
            Go home
          </Link>
        </main>
      </body>
    </html>
  );
}
