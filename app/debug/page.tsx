import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const checks: Array<{ name: string; status: 'ok' | 'error'; message: string }> = []

  // Check environment variables
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  checks.push({
    name: 'Environment Variables',
    status: hasUrl && hasKey ? 'ok' : 'error',
    message: hasUrl && hasKey 
      ? 'Environment variables zijn ingesteld'
      : `URL: ${hasUrl ? 'OK' : 'MISSING'}, Key: ${hasKey ? 'OK' : 'MISSING'}`
  })

  // Check Supabase connection
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('conversation_types').select('count').limit(1)
    
    if (error) {
      checks.push({
        name: 'Database Connectie',
        status: 'error',
        message: `Error: ${error.message} (Code: ${error.code || 'N/A'})`
      })
    } else {
      checks.push({
        name: 'Database Connectie',
        status: 'ok',
        message: 'Database connectie werkt'
      })
    }
  } catch (error: any) {
    checks.push({
      name: 'Database Connectie',
      status: 'error',
      message: `Error: ${error.message || 'Unknown error'}`
    })
  }

  // Check authentication
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      if (error.message.includes('session') || error.message.includes('missing')) {
        checks.push({
          name: 'Authenticatie',
          status: 'error',
                  message: 'Niet ingelogd - Log in via /login om admin functionaliteit te gebruiken'
        })
      } else {
        checks.push({
          name: 'Authenticatie',
          status: 'error',
          message: `Error: ${error.message}`
        })
      }
    } else if (user) {
      const isAdmin = user.user_metadata?.role === 'admin' || user.user_metadata?.is_admin === true
      checks.push({
        name: 'Authenticatie',
        status: 'ok',
        message: `Ingelogd als: ${user.email} (Admin: ${isAdmin ? 'Ja' : 'Nee'}${!isAdmin ? ' - Geen admin rechten!' : ''})`
      })
    } else {
      checks.push({
        name: 'Authenticatie',
        status: 'error',
                  message: 'Niet ingelogd - Log in via /login om admin functionaliteit te gebruiken'
      })
    }
  } catch (error: any) {
    if (error.message?.includes('session') || error.message?.includes('missing')) {
      checks.push({
        name: 'Authenticatie',
        status: 'error',
                  message: 'Niet ingelogd - Log in via /login om admin functionaliteit te gebruiken'
      })
    } else {
      checks.push({
        name: 'Authenticatie',
        status: 'error',
        message: `Error: ${error.message || 'Unknown error'}`
      })
    }
  }

  // Check tables
  const tables = ['conversation_types', 'sessions_groeigesprek', 'registrations_groeigesprek', 'headers_groeigesprek', 'settings_groeigesprek']
  for (const table of tables) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from(table).select('count').limit(1)
      
      if (error) {
        if (error.code === '42P01') {
          checks.push({
            name: `Tabel: ${table}`,
            status: 'error',
            message: 'Tabel bestaat niet - voer schema.sql uit'
          })
        } else {
          checks.push({
            name: `Tabel: ${table}`,
            status: 'error',
            message: `Error: ${error.message}`
          })
        }
      } else {
        checks.push({
          name: `Tabel: ${table}`,
          status: 'ok',
          message: 'Tabel bestaat en is toegankelijk'
        })
      }
    } catch (error: any) {
      checks.push({
        name: `Tabel: ${table}`,
        status: 'error',
        message: `Error: ${error.message || 'Unknown error'}`
      })
    }
  }

  const hasErrors = checks.some(c => c.status === 'error')

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="secondary">← Terug naar start</Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
            Debug Informatie
          </h1>

          <Card className="mb-6">
            <h2 className="text-2xl font-semibold text-ijsselheem-donkerblauw mb-4">
              Status Overzicht
            </h2>
            <div className="space-y-3">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    check.status === 'ok'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-ijsselheem-donkerblauw">
                      {check.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        check.status === 'ok'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {check.status === 'ok' ? 'OK' : 'ERROR'}
                    </span>
                  </div>
                  <p className="text-sm text-ijsselheem-donkerblauw">
                    {check.message}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {hasErrors && (
            <Card className="bg-yellow-50 border-yellow-200">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                Oplossingen
              </h2>
              <ul className="list-disc list-inside text-yellow-700 space-y-2">
                {!hasUrl || !hasKey ? (
                  <li>
                    Voeg NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY toe aan .env.local
                  </li>
                ) : null}
                {checks.some(c => c.name.includes('Tabel') && c.status === 'error') ? (
                  <li>
                    Voer supabase/schema.sql uit in Supabase SQL Editor
                  </li>
                ) : null}
            {checks.some(c => c.name === 'Authenticatie' && (c.status === 'error' || c.message.includes('Niet ingelogd'))) ? (
              <>
                <li>
                  <a href="/login" className="underline text-yellow-800 font-semibold">
                    Log in via /login
                  </a>
                </li>
                <li>
                  Zorg dat je een Supabase gebruiker hebt aangemaakt met admin rechten (role: &apos;admin&apos; of is_admin: true in user metadata)
                </li>
              </>
            ) : null}
              </ul>
            </Card>
          )}

          {!hasErrors && (
            <Card className="bg-green-50 border-green-200">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                ✅ Alles werkt correct!
              </h2>
              <p className="text-green-700">
                Alle checks zijn geslaagd. Het admin panel zou moeten werken.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
