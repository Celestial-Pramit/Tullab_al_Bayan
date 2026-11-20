import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key
  ? createClient(url, key, { auth: { flowType: 'pkce' } })
  : null

export async function startGoogleSignIn() {
  if (!supabase) throw new Error('Google sign-in is unavailable in this demo. Use a sample account below.')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: new URL('/sign-in', window.location.origin).href },
  })
  if (error) throw new Error('Google sign-in could not start. Please try again.')
}

export async function loadProfile(user) {
  const metadata = user.user_metadata ?? {}
  const basic = {
    name: metadata.full_name || metadata.name || user.email || 'Google account',
    email: user.email,
    photo: metadata.avatar_url || metadata.picture,
  }

  const { data: staff, error: staffError } = await supabase.from('bayan_staff_access')
    .select('role').eq('user_id', user.id).maybeSingle()
  if (staffError) throw staffError
  if (staff) return { ...basic, role: staff.role }

  const { data: student, error: studentError } = await supabase.from('bayan_student_profiles')
    .select('student_id, full_name, batch').eq('user_id', user.id).maybeSingle()
  if (studentError) throw studentError
  return student
    ? { ...basic, name: student.full_name, role: 'student', id: student.student_id, batch: student.batch }
    : { ...basic, role: 'pending' }
}
