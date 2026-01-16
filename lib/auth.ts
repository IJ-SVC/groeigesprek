import { createClient } from '@/lib/supabase/server'

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function isAdmin() {
  try {
    const user = await getUser()
    // Any authenticated user is considered an admin
    return !!user
  } catch (error) {
    // If there's an error (e.g., Supabase not configured), return false
    console.error('Error checking admin status:', error)
    return false
  }
}


