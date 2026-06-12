"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CodeBlock,
} from "@repo/ui";

type ErrorCategory = "generic" | "network" | "permission";

type Copy = {
  badge: string;
  headline: string;
  status: string;
};

// Detection heuristics live in the app layer (per error-page/spec.md §3).
// Card renders the category; this function picks it.
function categorize(error: Error & { status?: number }): ErrorCategory {
  const msg = error.message ?? "";
  const status = error.status;

  if (status === 403 || msg.startsWith("Forbidden:") || /\b403\b/.test(msg)) {
    return "permission";
  }
  if (/fetch|network|ECONN|ETIMEDOUT|unreachable/i.test(msg)) {
    return "network";
  }
  return "generic";
}

function copyFor(category: ErrorCategory): Copy {
  if (category === "network") {
    return {
      badge: "NETWORK ERROR",
      headline: "Server unreachable",
      status: "503  Service Unavailable",
    };
  }
  if (category === "permission") {
    return {
      badge: "ACCESS DENIED",
      headline: "Access denied",
      status: "403  Forbidden",
    };
  }
  return {
    badge: "ERROR",
    headline: "Route failed to load",
    status: "500  Internal Server Error",
  };
}

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  const [timestamp] = useState(() => new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const category = categorize(error);
  const { badge, headline, status } = copyFor(category);

  const copyDetails = useCallback(async () => {
    const payload = JSON.stringify(
      {
        timestamp: timestamp.toISOString(),
        digest: error.digest ?? null,
        category,
        message: error.message ?? null,
        type: error.name ?? null,
      },
      null,
      2,
    );
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [timestamp, error, category]);

  const truncatedMessage =
    error.message && error.message.length > 160
      ? `${error.message.slice(0, 160)}…`
      : error.message;

  return (
    <div className="flex min-h-full w-full items-center justify-center py-12">
      <div className="flex w-full max-w-[560px] flex-col items-center gap-3 px-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Badge variant="destructive">{badge}</Badge>
                <h2 className="text-subtitle font-semibold text-foreground tracking-(--text-subtitle--letter-spacing)">
                  {headline}
                </h2>
              </div>
              <time
                dateTime={timestamp.toISOString()}
                className="shrink-0 font-mono text-caption text-muted-foreground"
              >
                {timestamp.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZoneName: "short",
                })}
              </time>
            </div>
          </CardHeader>

          <CardContent>
            <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2">
              <dt className="text-label font-medium text-muted-foreground">
                status
              </dt>
              <dd className="font-mono text-code text-foreground">{status}</dd>

              {error.name && error.name !== "Error" && (
                <>
                  <dt className="text-label font-medium text-muted-foreground">
                    type
                  </dt>
                  <dd className="font-mono text-code text-foreground">
                    {error.name}
                  </dd>
                </>
              )}

              {truncatedMessage && (
                <>
                  <dt className="text-label font-medium text-muted-foreground">
                    message
                  </dt>
                  <dd className="min-w-0">
                    <CodeBlock
                      variant="inline"
                      code={truncatedMessage}
                      className="max-w-full text-wrap"
                    />
                  </dd>
                </>
              )}

              <dt className="text-label font-medium text-muted-foreground">
                incident
              </dt>
              <dd className="min-w-0">
                {error.digest ? (
                  <CodeBlock variant="inline" code={error.digest} />
                ) : (
                  <span className="font-mono text-code text-muted-foreground">
                    —
                  </span>
                )}
              </dd>
            </dl>
          </CardContent>

          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={copyDetails}>
              {copied ? "Copied" : "Copy error details"}
            </Button>

            <div className="flex gap-2">
              <Button variant="primary" onClick={reset}>
                Try again
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-caption text-muted-foreground">
          Platform status:{" "}
          <a
            href="https://status.hud.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            status.hud.ai
          </a>
        </p>
      </div>
    </div>
  );
}
