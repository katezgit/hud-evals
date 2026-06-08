"use client";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Segment error boundary — fires for unexpected runtime crashes under (app).
// Expected errors (404, validation, permission) are handled inline by their
// callers, NOT thrown to this boundary. See app-conventions.loading-and-errors.md.
export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 p-8 text-center">
      <h2 className="text-foreground">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-control bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}
