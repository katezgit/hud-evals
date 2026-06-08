"use client";

import { ErrorState } from "@repo/ui/components/error-state";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Segment error boundary — fires for unexpected runtime crashes under (app).
// Expected errors (404, validation, permission) are handled inline by their
// callers, NOT thrown to this boundary. See app-conventions.loading-and-errors.md.
export default function AppError({ reset }: AppErrorProps) {
  return (
    <ErrorState
      title="Something went wrong"
      subtitle="An unexpected error occurred. Try again, or reload the page."
      action={
        <button
          type="button"
          onClick={reset}
          className="rounded-control bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
        >
          Try again
        </button>
      }
    />
  );
}
