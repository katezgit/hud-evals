"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { IconButton } from "@repo/ui/components/icon-button";
import type { Model } from "../_data/types";
import { ForkModelDialog } from "./fork-model-dialog";

// The forked-model target is a synthetic redirect to `my-model-v2` — the only
// user-trained fixture that resolves through `getModelById`. Mock-data demo;
// real fork would return the new model id from the server.
const FORK_TARGET_ID = "my-model-v2";

export function HeaderActions({
  model,
  isResearcher,
}: {
  model: Model;
  isResearcher: boolean;
}) {
  const router = useRouter();
  const [forkOpen, setForkOpen] = useState(false);
  const [forking, setForking] = useState(false);

  const handleForkConfirm = async () => {
    setForking(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`Forked ${model.displayName}`);
    setForking(false);
    setForkOpen(false);
    router.push(`/models/${FORK_TARGET_ID}`);
  };

  const handleTrainClick = () => {
    router.push("/training/new");
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {model.trainable && (
          <>
            <IconButton
              variant="secondary"
              size="sm"
              aria-label="Fork"
              className="md:hidden"
              onClick={() => setForkOpen(true)}
            >
              <GitFork aria-hidden="true" />
            </IconButton>
            <Button
              variant="secondary"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => setForkOpen(true)}
            >
              <GitFork aria-hidden="true" />
              Fork
            </Button>
          </>
        )}
        {isResearcher && model.trainable && (
          <>
            <IconButton
              variant="primary"
              size="sm"
              aria-label="Train Model"
              className="md:hidden"
              onClick={handleTrainClick}
            >
              <GraduationCap aria-hidden="true" />
            </IconButton>
            <Button
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
              onClick={handleTrainClick}
            >
              <GraduationCap aria-hidden="true" />
              Train Model
            </Button>
          </>
        )}
      </div>
      <ForkModelDialog
        open={forkOpen}
        onOpenChange={setForkOpen}
        modelName={model.displayName}
        onConfirm={handleForkConfirm}
        loading={forking}
      />
    </>
  );
}
