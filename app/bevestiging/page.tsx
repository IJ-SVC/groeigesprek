import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { formatDate, formatTime, formatConversationTypeName, supportsICSDownload } from '@/lib/utils'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BevestigingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; registrationId?: string; cancelled?: string }>
}) {
  const params = await searchParams
  const { sessionId, registrationId, cancelled } = params

  // Annuleringsbevestiging: geen sessionId/registrationId nodig
  if (cancelled === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-ijsselheem-lichtblauw rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-ijsselheem-donkerblauw" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-ijsselheem-donkerblauw mb-2">
                  Inschrijving geannuleerd
                </h1>
                <p className="text-ijsselheem-donkerblauw">
                  Je inschrijving is succesvol geannuleerd.
                </p>
              </div>
              <div className="flex justify-center">
                <Link href="/">
                  <Button>Terug naar overzicht</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

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
  const canDownloadICS = supportsICSDownload(session.conversation_type?.name)

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
                <p><strong>Gesprekstype:</strong> {formatConversationTypeName(session.conversation_type?.name) || 'Gesprek'}</p>
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
              {canDownloadICS && (
                <a 
                  href={`/api/ics/${session.id}`}
                  download
                  className="font-semibold py-2 px-4 rounded-lg transition-opacity hover:opacity-90 bg-ijsselheem-lichtblauw text-ijsselheem-donkerblauw inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Download agenda bestand
                </a>
              )}
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


