"use client";

import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";

export function ForkAndTrainButton({ modelId }: { modelId: string }) {
  const router = useRouter();
  const onClick = () =>
    router.push(`/jobs/new?type=training&modelId=${modelId}`);

  return (
    <>
      <IconButton
        variant="primary"
        size="sm"
        aria-label="Fork and train this model"
        className="md:hidden"
        onClick={onClick}
      >
        <GraduationCap aria-hidden="true" />
      </IconButton>
      <Button
        variant="primary"
        className="hidden md:inline-flex"
        aria-label="Fork and train this model"
        onClick={onClick}
      >
        <GraduationCap aria-hidden="true" />
        Fork & Train
      </Button>
    </>
  );
}
