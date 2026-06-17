"use client";

import { useState } from "react";
import { Sparkles, X as XIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { IconButton } from "@repo/ui/components/icon-button";

interface AnalysisResult {
  id: string;
  label: string;
  body: string;
}

const CHIP_LABELS = [
  "Ask why",
  "Find first bad step",
  "Compare to passing trace",
  "Summarize bug",
  "Generate training example",
] as const;

type ChipLabel = (typeof CHIP_LABELS)[number];

function bodyFor(label: ChipLabel): string {
  if (label === "Ask why") {
    return "The agent never reached a state where the requested todo existed. After the typed input at step 6, the snapshot the model relied on was already stale — the textarea had cleared but the cached observation still showed the draft text. Every later action proceeded against that ghost UI, so the submit click landed on a disabled affordance and the grader saw an unchanged list.";
  }
  if (label === "Find first bad step") {
    return "Step 8 is where the trajectory first diverges. The agent attempted a recovery click after the type-action returned a stale snapshot. Subsequent retries (steps 9, 11) reuse the same coordinates without re-screenshotting, so they fail for the same reason. Earliest correctable signal: the missing re-screenshot at step 9.";
  }
  if (label === "Compare to passing trace") {
    return "Closest passing run (trace_a91…) diverges at step 7: the passing agent re-issued an observe action before the submit click and waited for the textarea to clear. This trace skipped the observe and submitted against a cached screenshot. Same model, same scenario — the single behavioral delta is the missing observation refresh after a successful type.";
  }
  if (label === "Summarize bug") {
    return "Cause: the agent treats the post-type snapshot as authoritative without re-observing. Effect: subsequent clicks target UI that no longer exists in the live DOM. Repro signal: any rollout where a type action immediately precedes a submit click on the same surface. Suggested fix: insert a forced observe step after every type, or gate submit on a fresh screenshot timestamp.";
  }
  return "Generated a synthetic example pinning steps 1–7 (the correct setup) and replacing step 8 onward with a re-observe + submit sequence drawn from the passing trace. Output reward: 1.00. The example is annotated with the failure mode and the corrective action; ready to add to your fine-tune set under tag `obs-refresh-after-type`.";
}

export function AnalyzeTracePanel() {
  const [results, setResults] = useState<ReadonlyArray<AnalysisResult>>([]);

  const handleChip = (label: ChipLabel) => {
    setResults((prev) => [
      {
        id: `${label}-${Date.now()}`,
        label,
        body: bodyFor(label),
      },
      ...prev,
    ]);
  };

  const handleDismiss = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-label text-meta-foreground">Ask AI about this trace</p>

      <div className="flex flex-wrap gap-2">
        {CHIP_LABELS.map((label) => (
          <Button
            key={label}
            variant="ghost"
            onClick={() => handleChip(label)}
          >
            <Sparkles aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <Card key={r.id} variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      aria-hidden="true"
                      className="size-4 text-primary"
                    />
                    <h3 className="text-body font-medium text-foreground">
                      {r.label}
                    </h3>
                  </div>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={`Dismiss ${r.label} result`}
                    type="button"
                    onClick={() => handleDismiss(r.id)}
                  >
                    <XIcon aria-hidden="true" />
                  </IconButton>
                </div>
                <p className="mt-2 text-body text-muted-foreground">
                  {r.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
