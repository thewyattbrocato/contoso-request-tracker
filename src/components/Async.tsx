import type { ReactNode } from 'react'
import type { AsyncState } from '../lib/useAsync'

interface Props<T> {
  state: AsyncState<T>
  onRetry: () => void
  isEmpty?: (data: T) => boolean
  emptyMessage: string
  children: (data: T) => ReactNode
}

/** One place for the loading, error and empty states so every view behaves the same. */
export function Async<T>({ state, onRetry, isEmpty, emptyMessage, children }: Props<T>) {
  if (state.status === 'loading') {
    return (
      <p role="status" className="note">
        Loading…
      </p>
    )
  }
  if (state.status === 'error') {
    return (
      <div role="alert" className="banner banner-error">
        <p>{state.message}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }
  if (isEmpty?.(state.data)) return <p className="note empty">{emptyMessage}</p>
  return <>{children(state.data)}</>
}
