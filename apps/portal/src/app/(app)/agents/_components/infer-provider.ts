import type { ModelProvider } from "@/lib/mock/explore-models";

/**
 * Maps an agent's display-model string (e.g. "Claude Sonnet 4.5", "GPT-4o")
 * to the canonical ProviderIcon key. The catalog mock keeps `model` as a
 * free-form string; this is a thin lookup until the eventual API returns a
 * structured `{ provider, modelId }` shape.
 */
export function inferProviderFromModel(model: string): ModelProvider {
  const m = model.toLowerCase();
  if (m.startsWith("claude")) return "Anthropic";
  if (m.startsWith("gpt") || m.startsWith("o1") || m.startsWith("o3")) return "OpenAI";
  if (m.startsWith("gemini")) return "Gemini";
  if (m.startsWith("grok")) return "xAI";
  return "OpenRouter";
}
