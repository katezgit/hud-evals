export interface Model {
  id: string;
  provider: string;
  ctx: string;
}

export const MODEL_REGISTRY: ReadonlyArray<Model> = [
  // Anthropic — 9
  { id: "claude-opus-4-5",      provider: "Anthropic", ctx: "200k" },
  { id: "claude-sonnet-4-5",    provider: "Anthropic", ctx: "200k" },
  { id: "claude-haiku-4-5",     provider: "Anthropic", ctx: "200k" },
  { id: "claude-opus-4",        provider: "Anthropic", ctx: "200k" },
  { id: "claude-sonnet-4",      provider: "Anthropic", ctx: "200k" },
  { id: "claude-haiku-4",       provider: "Anthropic", ctx: "200k" },
  { id: "claude-3-7-sonnet",    provider: "Anthropic", ctx: "200k" },
  { id: "claude-3-5-sonnet-v2", provider: "Anthropic", ctx: "200k" },
  { id: "claude-3-5-haiku",     provider: "Anthropic", ctx: "200k" },

  // OpenAI — 8
  { id: "gpt-4o-2024-11",      provider: "OpenAI", ctx: "128k" },
  { id: "gpt-4o-mini-2024-07", provider: "OpenAI", ctx: "128k" },
  { id: "gpt-4-turbo",         provider: "OpenAI", ctx: "128k" },
  { id: "gpt-4o-2024-08",      provider: "OpenAI", ctx: "128k" },
  { id: "gpt-4o-2024-05",      provider: "OpenAI", ctx: "128k" },
  { id: "o1-preview",          provider: "OpenAI", ctx: "128k" },
  { id: "o1-mini",             provider: "OpenAI", ctx: "128k" },
  { id: "o3-mini",             provider: "OpenAI", ctx: "200k" },

  // Google — 6
  { id: "gemini-2-5-pro",            provider: "Google", ctx: "2M" },
  { id: "gemini-2-5-flash",          provider: "Google", ctx: "1M" },
  { id: "gemini-2-0-flash",          provider: "Google", ctx: "1M" },
  { id: "gemini-2-0-flash-thinking", provider: "Google", ctx: "1M" },
  { id: "gemini-1-5-pro",            provider: "Google", ctx: "2M" },
  { id: "gemini-1-5-flash",          provider: "Google", ctx: "1M" },

  // Bedrock — 7
  { id: "anthropic-claude-3-5-sonnet", provider: "Bedrock", ctx: "200k" },
  { id: "anthropic-claude-3-haiku",    provider: "Bedrock", ctx: "200k" },
  { id: "meta-llama-3-1-70b",          provider: "Bedrock", ctx: "128k" },
  { id: "meta-llama-3-1-405b",         provider: "Bedrock", ctx: "128k" },
  { id: "mistral-large-2407",          provider: "Bedrock", ctx: "128k" },
  { id: "cohere-command-r-plus",       provider: "Bedrock", ctx: "128k" },
  { id: "ai21-jamba-instruct",         provider: "Bedrock", ctx: "256k" },

  // xAI — 3
  { id: "grok-2-1212",        provider: "xAI", ctx: "128k" },
  { id: "grok-2-vision-1212", provider: "xAI", ctx: "128k" },
  { id: "grok-beta",          provider: "xAI", ctx: "128k" },

  // Mistral — 4
  { id: "mistral-large-2411", provider: "Mistral", ctx: "128k" },
  { id: "mistral-small-2503", provider: "Mistral", ctx: "128k" },
  { id: "codestral-2501",     provider: "Mistral", ctx: "128k" },
  { id: "ministral-8b-2410",  provider: "Mistral", ctx: "128k" },

  // DeepSeek — 3
  { id: "deepseek-v3",        provider: "DeepSeek", ctx: "64k" },
  { id: "deepseek-r1",        provider: "DeepSeek", ctx: "64k" },
  { id: "deepseek-coder-v2",  provider: "DeepSeek", ctx: "64k" },
];

/**
 * Provider iteration order for the picker. Matches MODEL_REGISTRY listing order;
 * locked here so first-occurrence shuffling in MODEL_REGISTRY can't silently
 * reorder the dialog.
 */
export const PROVIDER_ORDER: ReadonlyArray<string> = [
  "Anthropic",
  "OpenAI",
  "Google",
  "Bedrock",
  "xAI",
  "Mistral",
  "DeepSeek",
];
