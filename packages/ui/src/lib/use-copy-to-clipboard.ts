import { useCallback, useEffect, useRef, useState } from "react"

interface UseCopyToClipboardOptions {
  /** Milliseconds before copied state reverts to idle. Defaults to 1500. */
  revertMs?: number
}

interface UseCopyToClipboardResult {
  copied: boolean
  copy: () => Promise<void>
}

/**
 * Clipboard write hook with timed revert.
 *
 * State machine:
 *   idle  --copy()-success-->  copied  --revertMs timeout-->  idle
 *   idle  --copy()-failure-->  idle   (silent no-op)
 *   copied --copy()--------->  copied  (timer resets; extends confirmation window)
 *
 * Pending timer is cleared on unmount.
 */
export function useCopyToClipboard(
  value: string,
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardResult {
  const { revertMs = 1500 } = options
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copy = useCallback(async () => {
    const snapshot = value
    try {
      await navigator.clipboard.writeText(snapshot)
    } catch {
      return
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), revertMs)
  }, [value, revertMs])

  return { copied, copy }
}
