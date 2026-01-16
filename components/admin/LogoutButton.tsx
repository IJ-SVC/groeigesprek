'use client'

import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm hover:text-ijsselheem-lichtblauw transition-colors"
    >
      Uitloggen
    </button>
  )
}


