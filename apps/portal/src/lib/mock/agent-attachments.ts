/**
 * Mock in-memory attachment store for agents (preset + user).
 *
 * Seeded from `presetAgents[*].initialAttachedTasksetIds` or
 * `userAgents[*].initialAttachedTasksetIds`. Mutations live in a module-level
 * Map keyed by agent id. No persistence — the demo runs client-side and
 * resets on hard reload, which is acceptable for a mocked surface. A
 * subscribe/notify API lets the drawer re-read the latest state without
 * coordinating React context across the catalog tree.
 */

import { getUserAgents, presetAgents } from "./agents";

type Listener = () => void;

const store = new Map<string, Set<string>>();
// Cached frozen snapshot per agent id. useSyncExternalStore requires
// `getSnapshot()` to return the same reference between calls when state has
// not changed — otherwise React loops re-render forever. We rebuild the
// snapshot only when a mutation runs.
const snapshots = new Map<string, ReadonlyArray<string>>();
const listeners = new Set<Listener>();

function lookupInitialAttachments(agentId: string): ReadonlyArray<string> {
  const preset = presetAgents.find((a) => a.id === agentId);
  if (preset) return preset.initialAttachedTasksetIds;
  const userAgent = getUserAgents().find((a) => a.id === agentId);
  if (userAgent) return userAgent.initialAttachedTasksetIds;
  return [];
}

function ensureSeeded(agentId: string): Set<string> {
  const existing = store.get(agentId);
  if (existing) return existing;
  const seed = new Set<string>(lookupInitialAttachments(agentId));
  store.set(agentId, seed);
  return seed;
}

function rebuildSnapshot(agentId: string): ReadonlyArray<string> {
  const next = Object.freeze(Array.from(ensureSeeded(agentId)));
  snapshots.set(agentId, next);
  return next;
}

export function getAgentAttachments(agentId: string): ReadonlyArray<string> {
  const cached = snapshots.get(agentId);
  if (cached) return cached;
  return rebuildSnapshot(agentId);
}

export function subscribeAgentAttachments(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface SaveAgentAttachmentsInput {
  adds: ReadonlyArray<string>;
  removes: ReadonlyArray<string>;
}

/**
 * Apply a batch edit. Resolves after a short delay to simulate a network
 * round-trip — the drawer renders a saving spinner during this window.
 */
export async function saveAgentAttachments(
  agentId: string,
  { adds, removes }: SaveAgentAttachmentsInput,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const set = ensureSeeded(agentId);
  for (const id of removes) set.delete(id);
  for (const id of adds) set.add(id);
  rebuildSnapshot(agentId);
  for (const listener of listeners) listener();
}
