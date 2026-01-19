import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './LogoutButton'

export async function AdminNav() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return (
    <nav className="bg-ijsselheem-donkerblauw text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="hover:text-ijsselheem-lichtblauw transition-colors">
                Startpagina
              </Link>
              <Link href="/admin" className="hover:text-ijsselheem-lichtblauw transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/sessies" className="hover:text-ijsselheem-lichtblauw transition-colors">
                Sessies
              </Link>
              <Link href="/admin/aanmeldingen" className="hover:text-ijsselheem-lichtblauw transition-colors">
                Aanmeldingen
              </Link>
              <Link href="/admin/colleagues" className="hover:text-ijsselheem-lichtblauw transition-colors">
                Collega's
              </Link>
              <Link href="/admin/instellingen" className="hover:text-ijsselheem-lichtblauw transition-colors">
                Instellingen
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
    )
  } catch (error) {
    console.error('Error in AdminNav:', error)
    return (
      <nav className="bg-ijsselheem-donkerblauw text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold">
                Admin Panel
              </Link>
              <div className="flex space-x-4">
                <Link href="/" className="hover:text-ijsselheem-lichtblauw transition-colors">
                  Startpagina
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Error loading user</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}
