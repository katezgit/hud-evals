// https://nextjs.org/docs/app/api-reference/file-conventions/not-found#global-not-found
// Renders outside the root layout — must define its own <html> and <body>.

import Link from "next/link";
import { Home } from "lucide-react";
import { Button, BrandMarkSquare } from "@repo/ui";
import "./globals.css";

export default function GlobalNotFound() {
  return (
    // `data-theme="light"` pins the light palette without ThemeProvider.
    // The `<style>` below opts users with prefers-color-scheme: dark into the dark palette.
    <html lang="en" data-theme="light">
      <head>
        <title>404 - Not Found</title>
        <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }`}</style>
      </head>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="flex max-w-[480px] flex-col items-center gap-6 px-6 text-center">
            <BrandMarkSquare />

            <div className="flex flex-col items-center gap-1">
              <h1 className="text-subtitle font-semibold text-foreground">
                404 - Not Found
              </h1>
              <p className="text-body text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist.
              </p>
            </div>

            <Button asChild variant="secondary">
              <Link href="/">
                <Home />
                Home
              </Link>
            </Button>

            <p className="text-body text-muted-foreground">
              Need help?{" "}
              <a
                href="mailto:support@example.com?subject=Page%20not%20found"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
