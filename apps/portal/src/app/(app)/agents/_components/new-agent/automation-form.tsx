"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import {
  FieldHelper,
  FormField,
} from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { agentEnvironments } from "@/lib/mock/agent-environments";
import { createUserAgent } from "@/lib/mock/agents";
import { MODEL_REGISTRY } from "@/lib/mock/model-registry";
import { FormFooter } from "./form-footer";

const DEFAULT_MODEL = "claude-sonnet-4-5";

const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  environmentId: z.string().min(1, "Pick an environment"),
  scenarioId: z.string().min(1, "Pick a scenario"),
  modelId: z.string().min(1),
});

type Values = z.infer<typeof schema>;

interface AutomationFormProps {
  onBack: () => void;
  onCancel: () => void;
  onCreated: () => void;
}

export function AutomationForm({
  onBack,
  onCancel,
  onCreated,
}: AutomationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { isValid, isSubmitting },
    watch,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      environmentId: "",
      scenarioId: "",
      modelId: DEFAULT_MODEL,
    },
    mode: "onChange",
  });

  const watchedEnvId = watch("environmentId");

  const selectedEnv = useMemo(
    () => agentEnvironments.find((e) => e.id === watchedEnvId),
    [watchedEnvId],
  );

  const onSubmit = handleSubmit(async (values) => {
    await createUserAgent({
      kind: "automation",
      name: values.name.trim(),
      environmentId: values.environmentId,
      scenarioId: values.scenarioId,
      model: modelLabel(values.modelId),
    });
    toast.success(`Agent ${values.name.trim()} — added to My Agents`);
    onCreated();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-6">
        <FormField id="automation-name" label="Name" required>
          <Input
            type="text"
            size="md"
            placeholder="My automation…"
            autoComplete="off"
            spellCheck={false}
            {...register("name")}
          />
        </FormField>

        <Controller
          control={control}
          name="environmentId"
          render={({ field }) => (
            <FormField id="automation-env" label="Environment">
              <Select
                value={field.value || undefined}
                onValueChange={(v) => {
                  field.onChange(v);
                  // Reset scenario whenever env changes — the previous scenario
                  // may not belong to the new env.
                  setValue("scenarioId", "", { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full">
                  <span className="flex min-w-0 items-center gap-2">
                    <Globe
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <SelectValue placeholder="Choose an environment…" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {agentEnvironments.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      <span className="font-mono text-body">{env.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="scenarioId"
          render={({ field }) => (
            <FormField id="automation-scenario" label="Scenario">
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={!selectedEnv}
              >
                <SelectTrigger className="w-full" aria-label="Select scenario">
                  <SelectValue
                    placeholder={
                      selectedEnv ? "Choose a scenario…" : "Select an environment first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(selectedEnv?.scenarios ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-mono text-body">{s.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedEnv ? (
                <FieldHelper>Select an environment first.</FieldHelper>
              ) : null}
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="modelId"
          render={({ field }) => (
            <FormField id="automation-model" label="Model">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_REGISTRY.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="font-mono text-body">{m.id}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldHelper>Defaults to Claude Sonnet 4.5. Per-run cost varies by model.</FieldHelper>
            </FormField>
          )}
        />
      </div>

      <FormFooter
        onBack={onBack}
        onCancel={onCancel}
        canSubmit={isValid && !isSubmitting}
        submitting={isSubmitting}
      />
    </form>
  );
}

function modelLabel(modelId: string): string {
  return MODEL_REGISTRY.find((m) => m.id === modelId)?.id ?? modelId;
}
