"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EnvVarSpec } from "../_data/types";

/**
 * Client-side, in-memory store for an Environment's variable values.
 *
 * Seeded once from the env spec; lives for the lifetime of the page mount.
 * Credentials never persist — no localStorage.
 */

interface SaveResult {
  ok: true;
}

interface EnvVarsStoreValue {
  /** Current value per key (empty string = unset). */
  values: Record<string, string>;
  /** Keys saved at least once with a non-empty value. */
  savedKeys: ReadonlySet<string>;
  /** Keys currently dirty (typed since last save). */
  dirtyKeys: ReadonlySet<string>;
  /** Required-var keys that are unset or empty. Drives banner + card gating. */
  missingRequired: ReadonlyArray<string>;
  /** Update a single key in the working copy. */
  setValue: (key: string, value: string) => void;
  /** Restore a single row to its last-saved value. */
  resetKey: (key: string) => void;
  /** Restore every row to its last-saved value (footer Cancel). */
  resetAll: () => void;
  /** Persist all dirty rows; resolves after a brief simulated round-trip. */
  save: () => Promise<SaveResult>;
}

const EnvVarsStoreContext = createContext<EnvVarsStoreValue | null>(null);

export interface EnvVarsStoreProviderProps {
  vars: ReadonlyArray<EnvVarSpec>;
  children: ReactNode;
}

export function EnvVarsStoreProvider({
  vars,
  children,
}: EnvVarsStoreProviderProps) {
  const seed = useMemo(() => {
    const initial: Record<string, string> = {};
    const saved = new Set<string>();
    for (const v of vars) {
      const value = v.initialValue ?? "";
      initial[v.key] = value;
      if (value !== "") saved.add(v.key);
    }
    return { initial, saved };
  }, [vars]);

  const [values, setValues] = useState<Record<string, string>>(seed.initial);
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>(
    seed.initial,
  );
  const [savedKeys, setSavedKeys] = useState<ReadonlySet<string>>(seed.saved);

  const setValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetKey = useCallback(
    (key: string) => {
      setValues((prev) => ({ ...prev, [key]: savedSnapshot[key] ?? "" }));
    },
    [savedSnapshot],
  );

  const resetAll = useCallback(() => {
    setValues({ ...savedSnapshot });
  }, [savedSnapshot]);

  const save = useCallback(async (): Promise<SaveResult> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSavedSnapshot({ ...values });
    setSavedKeys(() => {
      const next = new Set<string>();
      for (const [k, v] of Object.entries(values)) {
        if (v.trim() !== "") next.add(k);
      }
      return next;
    });
    return { ok: true };
  }, [values]);

  const dirtyKeys = useMemo<ReadonlySet<string>>(() => {
    const next = new Set<string>();
    for (const key of Object.keys(values)) {
      if ((values[key] ?? "").trim() !== (savedSnapshot[key] ?? "").trim()) {
        next.add(key);
      }
    }
    return next;
  }, [values, savedSnapshot]);

  // Required-var keys that are unset or empty. Read by Overview banner and
  // scenario card gating. A required key is "missing" if it's not in
  // `savedKeys` (never persisted) OR its current trimmed value is empty.
  const missingRequired = useMemo<ReadonlyArray<string>>(() => {
    const out: Array<string> = [];
    for (const spec of vars) {
      if (!spec.required) continue;
      const v = (values[spec.key] ?? "").trim();
      if (!savedKeys.has(spec.key) || v === "") out.push(spec.key);
    }
    return out;
  }, [vars, values, savedKeys]);

  const ctx = useMemo<EnvVarsStoreValue>(
    () => ({
      values,
      savedKeys,
      dirtyKeys,
      missingRequired,
      setValue,
      resetKey,
      resetAll,
      save,
    }),
    [
      values,
      savedKeys,
      dirtyKeys,
      missingRequired,
      setValue,
      resetKey,
      resetAll,
      save,
    ],
  );

  return (
    <EnvVarsStoreContext.Provider value={ctx}>
      {children}
    </EnvVarsStoreContext.Provider>
  );
}

export function useEnvVarsStore(): EnvVarsStoreValue {
  const ctx = useContext(EnvVarsStoreContext);
  if (!ctx) {
    throw new Error("useEnvVarsStore must be used inside EnvVarsStoreProvider");
  }
  return ctx;
}
