"use client";

// https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error

import { useEffect } from "react";
import { Button } from "@repo/ui";
import "./globals.css";

function diagnosticFor(error: Error & { digest?: string }): string | null {
  const raw = error.message?.trim() || error.name?.trim() || "";
  if (!raw) return null;
  return raw.length > 120 ? `${raw.slice(0, 120)}…` : raw;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const diagnostic = diagnosticFor(error);
  const digest = error.digest;
  const hasDiagnosticBlock = diagnostic !== null || Boolean(digest);

  return (
    // `data-theme="light"` pins the light palette without ThemeProvider.
    // The `<style>` below opts users with prefers-color-scheme: dark into the dark palette
    // (every semantic color uses light-dark() keyed on color-scheme, so flipping color-scheme
    // is sufficient — no per-token swap needed).
    <html lang="en" data-theme="light">
      <head>
        <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }`}</style>
      </head>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="flex max-w-[480px] flex-col items-center gap-4 px-6 text-center">
            <span className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 font-mono text-label font-medium text-muted-foreground">
              FATAL
            </span>

            <h1 className="text-subtitle font-semibold text-foreground">
              Platform failed to initialize
            </h1>

            {hasDiagnosticBlock && (
              <div className="flex max-w-[440px] flex-col gap-1">
                {diagnostic &&(
                  <p className="line-clamp-2 font-mono text-code text-muted-foreground">
                    {diagnostic}
                  </p>
                )}
                {digest && (
                  <p className="font-mono text-code text-muted-foreground/60">
                    digest: {digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-row gap-2">
              <Button type="button" variant="primary" onClick={reset}>
                Reload page
              </Button>
              <Button asChild variant="ghost">
                <a href="mailto:support@example.com?subject=Platform%20failed%20to%20initialize">
                  Contact us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
