"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import {
  FieldHelper,
  FieldLabel,
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
import { Textarea } from "@repo/ui/components/textarea";
import { agentEnvironments } from "@/lib/mock/agent-environments";
import { createUserAgent } from "@/lib/mock/agents";
import { MODEL_REGISTRY } from "@/lib/mock/model-registry";
import { FormFooter } from "./form-footer";
import { OptionalLabel } from "./optional-label";

const DEFAULT_MODEL = "claude-sonnet-4-5";

const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  environmentId: z.string().min(1, "Pick an environment"),
  modelId: z.string().min(1),
  systemPrompt: z.string().max(4000, "System prompt is too long").optional(),
});

type Values = z.infer<typeof schema>;

interface ChatAgentFormProps {
  onBack: () => void;
  onCancel: () => void;
  onCreated: () => void;
}

export function ChatAgentForm({
  onBack,
  onCancel,
  onCreated,
}: ChatAgentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      environmentId: "",
      modelId: DEFAULT_MODEL,
      systemPrompt: "",
    },
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    await createUserAgent({
      kind: "chat",
      name: values.name.trim(),
      environmentId: values.environmentId,
      model: modelLabel(values.modelId),
      systemPrompt: values.systemPrompt?.trim() || undefined,
    });
    toast.success(`Agent ${values.name.trim()} — added to My Agents`);
    onCreated();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-6">
        <FormField id="chat-name" label="Name" required>
          <Input
            type="text"
            placeholder="e.g. Browser debug assistant"
            autoComplete="off"
            spellCheck={false}
            {...register("name")}
          />
        </FormField>

        <Controller
          control={control}
          name="environmentId"
          render={({ field }) => (
            <FormField id="chat-env" label="Environment">
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
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
          name="modelId"
          render={({ field }) => (
            <FormField id="chat-model" label="Model">
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
              <FieldHelper>Defaults to Claude Sonnet 4.5.</FieldHelper>
            </FormField>
          )}
        />

        <div data-slot="form-field" className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="chat-system-prompt">
            <OptionalLabel>System Prompt</OptionalLabel>
          </FieldLabel>
          <Textarea
            id="chat-system-prompt"
            rows={4}
            placeholder="System instructions…"
            {...register("systemPrompt")}
          />
          <FieldHelper>
            Prepended to every turn.
          </FieldHelper>
        </div>
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
