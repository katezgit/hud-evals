"use client";

import { useId } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { DeleteEnvironmentDialog } from "./delete-env-dialog";

interface DangerZoneSectionProps {
  envName: string;
}

export function DangerZoneSection({ envName }: DangerZoneSectionProps) {
  const warningId = useId();
  return (
    <Card
      id="danger-zone"
      aria-labelledby="danger-zone-title"
      className="scroll-mt-32"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id="danger-zone-title"
            className="text-subtitle font-semibold text-state-errored"
          >
            Danger Zone
          </h2>
        </CardTitle>
        <CardDescription id={warningId}>
          Permanently delete this environment. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DeleteEnvironmentDialog envName={envName} ariaDescribedBy={warningId} />
      </CardContent>
    </Card>
  );
}
