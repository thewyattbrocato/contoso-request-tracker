import { useCallback, useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

type Settled<T> = { key: string; result: Exclude<AsyncState<T>, { status: 'loading' }> }

/**
 * Runs a loader when its inputs change and exposes loading, error and ready states plus a retry.
 * Inputs must be plain values (strings, numbers). Loading is derived: a result that belongs to an
 * older key is treated as still loading, so the effect only sets state when a request finishes.
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly (string | number)[]): [AsyncState<T>, () => void] {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const key = JSON.stringify([...deps, attempt])

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => {
        if (!cancelled) setSettled({ key, result: { status: 'ready', data } })
      },
      (e: unknown) => {
        if (!cancelled)
          setSettled({ key, result: { status: 'error', message: e instanceof Error ? e.message : 'Something went wrong.' } })
      },
    )
    return () => {
      cancelled = true
    }
    // `load` is recreated every render; `key` already captures the inputs that matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const state: AsyncState<T> = settled && settled.key === key ? settled.result : { status: 'loading' }
  return [state, retry]
}
