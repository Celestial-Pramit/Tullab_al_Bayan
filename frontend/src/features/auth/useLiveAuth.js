import { useEffect, useState } from 'react'
import { loadProfile, supabase } from './supabaseAuth.js'

export function useLiveAuth() {
  const [session, setSession] = useState(undefined)
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const user = session?.user
  const [callbackError] = useState(() => {
    const query = new URLSearchParams(window.location.search)
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    return [query, fragment].some(params => params.has('error') || params.has('error_description') || params.has('error_code') || params.has('code'))
  })

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    let active = true
    loadProfile(user).then(
      profile => { if (active) setResult({ user, attempt, profile }) },
      () => { if (active) setResult({ user, attempt, error: 'Your institute access could not be checked. Please try again.' }) },
    )
    return () => { active = false }
  }, [user, attempt])

  const checked = user && result?.user === user && result.attempt === attempt ? result : null
  return {
    loading: Boolean(supabase) && (session === undefined || Boolean(user && !checked)),
    profile: checked?.profile,
    error: checked?.error,
    callbackError,
    retry: () => setAttempt(value => value + 1),
  }
}
