import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/Nav'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check Supabase connection first
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // If there's a real connection error (not just missing session), show error
  if (userError && !userError.message.includes('session') && !userError.message.includes('missing')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-800 mb-4">
                Supabase Connectie Fout
              </h1>
              <p className="text-red-700 mb-2">
                Kan niet verbinden met Supabase. Error:
              </p>
              <p className="text-sm text-red-600 mb-4 font-mono bg-red-100 p-2 rounded">
                {userError.message}
              </p>
              <p className="text-red-700 mb-2">
                Mogelijke oplossingen:
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                <li>Check of NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY correct zijn ingesteld in .env.local</li>
                <li>Check of de Supabase project actief is</li>
                <li>Check je internet verbinding</li>
              </ul>
              <div className="mt-4">
                <a
                  href="/login"
                  className="inline-block px-4 py-2 bg-ijsselheem-accentblauw text-ijsselheem-donkerblauw rounded-lg font-semibold hover:opacity-90"
                >
                  Probeer opnieuw in te loggen
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no user (missing session is normal when not logged in), redirect to login
  // Note: redirect() throws an exception in Next.js, so it must be outside try-catch
  if (!user) {
    redirect('/login')
  }

  // User is already checked above, if we get here they are authenticated
  // No need to check for admin role - any authenticated user can access admin
  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}


