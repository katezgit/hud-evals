"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Play } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { CodeBlock } from "@repo/ui/components/code-block";

interface PerformanceEmptyProps {
  tasksetId: string;
}

export default function PerformanceEmpty({ tasksetId }: PerformanceEmptyProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRun = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("run", "1");
    router.replace(`/tasksets/${tasksetId}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col items-start gap-4 py-8">
      <p className="text-body text-foreground">
        Performance requires at least one Job run on this Taskset.
      </p>
      <div className="w-full max-w-xl">
        <CodeBlock
          variant="block"
          language="bash"
          code={`hud eval ${tasksetId} -m <model>`}
        />
      </div>
      <Button
        type="button"
        variant="primary"
        onClick={handleRun}
      >
        <Play aria-hidden="true" />
        Run Taskset
      </Button>
    </div>
  );
}
