import { useEffect, useState } from 'react'
import { getContext } from '@microsoft/power-apps/app'

export type CurrentUser = { state: 'loading' } | { state: 'ready'; name: string } | { state: 'unavailable' }

const TIMEOUT_MS = 10_000

/**
 * The signed-in user's display name from the Power Apps host, for the page header only.
 * The sign-in address is deliberately not read: no query and no saved record uses it.
 * If the host does not answer (for example plain `vite dev`), the app works without the name.
 */
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>({ state: 'loading' })

  useEffect(() => {
    let cancelled = false
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS))
    Promise.race([getContext(), timeout])
      .then((ctx) => {
        if (!cancelled) setUser(ctx.user.fullName ? { state: 'ready', name: ctx.user.fullName } : { state: 'unavailable' })
      })
      .catch(() => {
        if (!cancelled) setUser({ state: 'unavailable' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return user
}
