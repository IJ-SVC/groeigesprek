import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get total sessions
  const { count: totalSessions, error: sessionsError } = await supabase
    .from('sessions_groeigesprek')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'cancelled')

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError)
  }

  // Get total registrations
  const { count: totalRegistrations, error: registrationsError } = await supabase
    .from('registrations_groeigesprek')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  if (registrationsError) {
    console.error('Error fetching registrations:', registrationsError)
  }

  // Get registrations per type
  const { data: registrationsByType, error: registrationsByTypeError } = await supabase
    .from('registrations_groeigesprek')
    .select(`
      *,
      session:sessions_groeigesprek(
        conversation_type_id,
        conversation_type:conversation_types(name)
      )
    `)
    .eq('status', 'active')

  if (registrationsByTypeError) {
    console.error('Error fetching registrations by type:', registrationsByTypeError)
  }

  const typeCounts = (registrationsByType || []).reduce((acc, reg) => {
    const typeName = reg.session?.conversation_type?.name || 'unknown'
    acc[typeName] = (acc[typeName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get sessions with high occupancy (>80%)
  const { data: sessions, error: sessionsListError } = await supabase
    .from('sessions_groeigesprek')
    .select(`
      *,
      conversation_type:conversation_types(name)
    `)
    .eq('status', 'published')
    .gte('date', new Date().toISOString().split('T')[0])

  if (sessionsListError) {
    console.error('Error fetching sessions list:', sessionsListError)
  }

  const sessionIds = sessions?.map(s => s.id) || []
  let registrationCounts: Record<string, number> = {}

  if (sessionIds.length > 0) {
    const { data: registrations } = await supabase
      .from('registrations_groeigesprek')
      .select('session_id')
      .in('session_id', sessionIds)
      .eq('status', 'active')

    registrationCounts = (registrations || []).reduce((acc, reg) => {
      acc[reg.session_id] = (acc[reg.session_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const highOccupancySessions = (sessions || []).filter(session => {
    const count = registrationCounts[session.id] || 0
    const percentage = (count / session.max_participants) * 100
    return percentage > 80
  })

  // Check for database errors
  const hasError = sessionsError || registrationsError || registrationsByTypeError || sessionsListError
  
  if (hasError) {
    const errorMessage = sessionsError?.message || registrationsError?.message || registrationsByTypeError?.message || sessionsListError?.message
    
    // Check if it's a schema error
    if (sessionsError?.code === '42P01' || registrationsError?.code === '42P01') {
      return (
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
            Dashboard
          </h1>
          <Card className="bg-red-50 border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              Database Schema Niet Gevonden
            </h2>
            <p className="text-red-700 mb-4">
              De database tabellen bestaan nog niet. Voer eerst het database schema uit:
            </p>
            <ol className="list-decimal list-inside text-red-700 space-y-2 mb-4">
              <li>Ga naar je Supabase Dashboard</li>
              <li>Open de SQL Editor</li>
              <li>Kopieer de inhoud van <code className="bg-red-100 px-2 py-1 rounded">supabase/schema.sql</code></li>
              <li>Voer het script uit</li>
            </ol>
            <p className="text-sm text-red-600">
              Error: {errorMessage}
            </p>
          </Card>
        </div>
      )
    }
    
    // Other errors
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
          Dashboard
        </h1>
        <Card className="bg-yellow-50 border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">
            Fout bij het laden van data
          </h2>
          <p className="text-yellow-700 mb-2">
            Er is een fout opgetreden bij het ophalen van de dashboard gegevens.
          </p>
          <p className="text-sm text-yellow-600">
            Error: {errorMessage}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
        Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold text-ijsselheem-donkerblauw mb-2">
            Totaal Sessies
          </h2>
          <p className="text-3xl font-bold text-ijsselheem-accentblauw">
            {totalSessions || 0}
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ijsselheem-donkerblauw mb-2">
            Totaal Aanmeldingen
          </h2>
          <p className="text-3xl font-bold text-ijsselheem-accentblauw">
            {totalRegistrations || 0}
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ijsselheem-donkerblauw mb-2">
            Sessies bijna vol
          </h2>
          <p className="text-3xl font-bold text-ijsselheem-olijfgroen">
            {highOccupancySessions.length}
          </p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold text-ijsselheem-donkerblauw mb-4">
            Aanmeldingen per type
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ontwikkelgesprek in groepsvorm:</span>
              <span className="font-bold">{typeCounts['groepsontwikkelgesprek'] || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Ontwikkelgesprek – spelwerkvorm (individueel):</span>
              <span className="font-bold">{typeCounts['inloopgesprek'] || 0}</span>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ijsselheem-donkerblauw mb-4">
            Quick Links
          </h2>
          <div className="space-y-2">
            <Link href="/admin/sessies/nieuw">
              <Button variant="secondary" className="w-full mb-2">
                Nieuwe sessie aanmaken
              </Button>
            </Link>
            <Link href="/admin/colleagues/nieuw">
              <Button variant="secondary" className="w-full mb-2">
                Nieuwe collega aanmaken
              </Button>
            </Link>
            <Link href="/admin/sessies">
              <Button variant="secondary" className="w-full mb-2">
                Alle sessies bekijken
              </Button>
            </Link>
            <Link href="/admin/aanmeldingen">
              <Button variant="secondary" className="w-full">
                Aanmeldingen exporteren
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {highOccupancySessions.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-ijsselheem-donkerblauw mb-4">
            Sessies met hoge bezetting (&gt;80%)
          </h2>
          <div className="space-y-2">
            {highOccupancySessions.map((session) => {
              const count = registrationCounts[session.id] || 0
              const percentage = Math.round((count / session.max_participants) * 100)
              return (
                <div key={session.id} className="flex justify-between items-center p-2 bg-ijsselheem-lichtblauw rounded">
                  <span>
                    {session.conversation_type?.name} - {new Date(session.date).toLocaleDateString('nl-NL')} om {session.start_time.substring(0, 5)}
                  </span>
                  <span className="font-bold">
                    {count}/{session.max_participants} ({percentage}%)
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}


