"use client";

import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Fires when the root layout itself crashed — so there is no ThemeProvider in scope.
// Pin data-theme="light" and inline a media-query block that flips color-scheme for
// dark-mode users; every semantic token in color.css is keyed off color-scheme via
// light-dark(), so flipping color-scheme alone surfaces the dark palette.
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }`}</style>
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-display">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Try again, or reload the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-control bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
