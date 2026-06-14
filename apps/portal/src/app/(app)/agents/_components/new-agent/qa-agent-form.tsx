"use client";

import {
  useCallback,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { cn } from "@repo/ui/lib/cn";
import { createUserAgent } from "@/lib/mock/agents";
import { qaWorkflowScenarios } from "@/lib/mock/agent-scenarios";
import { MODEL_REGISTRY } from "@/lib/mock/model-registry";
import { FormFooter } from "./form-footer";

const DEFAULT_MODEL = "claude-sonnet-4-5";

const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  scenarioId: z.string().min(1, "Pick a workflow scenario"),
  modelId: z.string().min(1),
});

type Values = z.infer<typeof schema>;

interface QaAgentFormProps {
  onBack: () => void;
  onCancel: () => void;
  onCreated: () => void;
}

export function QaAgentForm({
  onBack,
  onCancel,
  onCreated,
}: QaAgentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", scenarioId: "", modelId: DEFAULT_MODEL },
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    await createUserAgent({
      kind: "qa",
      name: values.name.trim(),
      scenarioId: values.scenarioId,
      model: modelLabel(values.modelId),
    });
    toast.success(`Agent ${values.name.trim()} — added to My Agents`);
    onCreated();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-6">
        <FormField id="qa-agent-name" label="Name" required>
          <Input
            type="text"
            placeholder="My QA agent…"
            autoComplete="off"
            spellCheck={false}
            {...register("name")}
          />
        </FormField>

        <Controller
          control={control}
          name="scenarioId"
          render={({ field }) => (
            <ScenarioRadioGroup
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="modelId"
          render={({ field }) => (
            <FormField id="qa-model" label="Model">
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
              <FieldHelper>
                Defaults to Claude Sonnet 4.5. Per-run cost varies by model.
              </FieldHelper>
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

function PerTraceBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-border bg-muted-surface px-1.5 py-0.5 text-meta font-semibold uppercase tracking-wide text-muted-foreground">
      Per Trace
    </span>
  );
}

// Roving-tabindex radio group: one item is in the tab sequence at a time
// (the selected one, or the first when nothing is selected). Arrow keys
// move focus + selection; Home/End jump to ends; Tab leaves the group.
function ScenarioRadioGroup({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const scenarios = qaWorkflowScenarios;
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = useMemo(() => {
    const idx = scenarios.findIndex((s) => s.id === value);
    return idx === -1 ? 0 : idx;
  }, [scenarios, value]);

  const focusIndex = useCallback(
    (next: number) => {
      const wrapped = (next + scenarios.length) % scenarios.length;
      const target = scenarios[wrapped];
      if (!target) return;
      onChange(target.id);
      // Defer focus to the next paint so React has re-rendered tabIndex.
      requestAnimationFrame(() => {
        itemRefs.current[wrapped]?.focus();
      });
    },
    [onChange, scenarios],
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          focusIndex(index + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          focusIndex(index - 1);
          break;
        case "Home":
          e.preventDefault();
          focusIndex(0);
          break;
        case "End":
          e.preventDefault();
          focusIndex(scenarios.length - 1);
          break;
      }
    },
    [focusIndex, scenarios.length],
  );

  return (
    <section
      aria-labelledby="qa-scenario-heading"
      className="flex flex-col gap-3"
    >
      <h3
        id="qa-scenario-heading"
        className="select-none font-sans text-label font-medium leading-none text-muted-foreground"
      >
        Select Workflow Scenario
      </h3>
      <div
        role="radiogroup"
        aria-labelledby="qa-scenario-heading"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {scenarios.map((s, index) => {
          const selected = value === s.id;
          const isRovingTarget = index === activeIndex;
          return (
            <button
              key={s.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={isRovingTarget ? 0 : -1}
              onClick={() => onChange(s.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border bg-panel p-3 text-left",
                "cursor-pointer transition-colors duration-fast",
                selected
                  ? "border-foreground bg-hover-surface"
                  : "border-border hover:border-border-strong",
                "focus-visible:shadow-focus-ring outline-hidden",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-body font-semibold text-foreground">
                  {s.name}
                </span>
                <PerTraceBadge />
              </div>
              <span className="font-mono text-meta text-muted-foreground">
                {s.namespace}
              </span>
              <p className="line-clamp-2 text-label text-muted-foreground">
                {s.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function modelLabel(modelId: string): string {
  return MODEL_REGISTRY.find((m) => m.id === modelId)?.id ?? modelId;
}
