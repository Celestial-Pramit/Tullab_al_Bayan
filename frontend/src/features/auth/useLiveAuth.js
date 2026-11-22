import { useCallback, useEffect, useState } from 'react'
import { loadProfile, signOutUser, supabase } from './supabaseAuth.js'

export function useLiveAuth() {
  const [session, setSession] = useState(() => (supabase ? undefined : null))
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const user = session?.user ?? null
  const userId = user?.id ?? null

  const [oauthUrlError] = useState(() => {
    const query = new URLSearchParams(window.location.search)
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    return [query, fragment].some(params =>
      params.has('error') || params.has('error_description') || params.has('error_code'))
  })
  const [hadPkceCode] = useState(() => new URLSearchParams(window.location.search).has('code'))

  useEffect(() => {
    if (!supabase) return

    let active = true
    supabase.auth.getSession().then(
      ({ data, error }) => {
        if (!active) return
        setSession(error ? null : (data?.session ?? null))
      },
      () => {
        if (active) setSession(null)
      },
    )

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) return

    let active = true
    loadProfile(user).then(
      profile => {
        if (active) setResult({ userId: user.id, attempt, profile, error: null })
      },
      () => {
        if (active) {
          setResult({
            userId: user.id,
            attempt,
            profile: null,
            error: 'Your institute access could not be checked. Please try again.',
          })
        }
      },
    )

    return () => {
      active = false
    }
  }, [user, attempt])

  const retry = useCallback(() => {
    setAttempt(value => value + 1)
  }, [])

  const signOut = useCallback(async () => {
    await signOutUser()
    setSession(null)
    setResult(null)
  }, [])

  const checked = userId && result?.userId === userId && result.attempt === attempt ? result : null
  const loading = Boolean(supabase) && (session === undefined || Boolean(userId && !checked))
  const callbackError = oauthUrlError || (!loading && !session && hadPkceCode)

  return {
    configured: Boolean(supabase),
    loading,
    session: session ?? null,
    profile: checked?.profile ?? null,
    error: checked?.error ?? null,
    callbackError,
    retry,
    signOut,
  }
}
