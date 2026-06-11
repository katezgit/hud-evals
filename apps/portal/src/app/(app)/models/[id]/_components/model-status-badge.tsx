import { Badge } from "@repo/ui/components/badge";
import type { ModelStatus } from "../_data/types";

const STATUS_LABEL: Record<ModelStatus, string> = {
  ready: "Ready",
  pending: "Pending",
  failed: "Failed",
};

const STATUS_VARIANT: Record<ModelStatus, "success" | "warning" | "destructive"> = {
  ready: "success",
  pending: "warning",
  failed: "destructive",
};

export function ModelStatusBadge({ status }: { status: ModelStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} showDot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
