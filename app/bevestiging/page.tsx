import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BevestigingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; registrationId?: string }>
}) {
  const params = await searchParams
  const { sessionId, registrationId } = params

  if (!sessionId || !registrationId) {
    notFound()
  }

  const supabase = await createClient()

  const { data: registration } = await supabase
    .from('registrations_groeigesprek')
    .select(`
      *,
      session:sessions_groeigesprek(
        *,
        conversation_type:conversation_types(*)
      )
    `)
    .eq('id', registrationId)
    .eq('session_id', sessionId)
    .single()

  if (!registration || !registration.session) {
    notFound()
  }

  const session = registration.session
  const cutoffHours = 2 // Default, could be fetched from settings
  const canCancel = new Date(`${session.date}T${session.start_time}`) > new Date(Date.now() + cutoffHours * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-ijsselheem-donkerblauw mb-2">
                Inschrijving gelukt!
              </h1>
              <p className="text-ijsselheem-donkerblauw">
                Je inschrijving is bevestigd
              </p>
            </div>

            <div className="bg-ijsselheem-lichtblauw rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold text-ijsselheem-donkerblauw mb-4">
                Sessie details
              </h2>
              <div className="space-y-2 text-sm text-ijsselheem-donkerblauw">
                <p><strong>Gesprekstype:</strong> {session.conversation_type?.name || 'Gesprek'}</p>
                <p><strong>Datum:</strong> {formatDate(session.date)}</p>
                <p><strong>Tijd:</strong> {formatTime(session.start_time)}
                  {session.end_time && ` - ${formatTime(session.end_time)}`}
                </p>
                <p><strong>Locatie:</strong> {session.is_online ? 'Online (Teams)' : session.location}</p>
                {session.is_online && session.teams_link && (
                  <p>
                    <strong>Teams-link:</strong>{' '}
                    <a href={session.teams_link} target="_blank" rel="noopener noreferrer" className="text-ijsselheem-accentblauw underline">
                      {session.teams_link}
                    </a>
                  </p>
                )}
                <p><strong>Begeleider:</strong> {session.facilitator}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${session.conversation_type?.name || ''}`}>
                <Button variant="secondary">Terug naar overzicht</Button>
              </Link>
              {canCancel && registration.cancellation_token && (
                <Link href={`/annuleren/${registration.cancellation_token}`}>
                  <Button variant="secondary">Annuleer inschrijving</Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


