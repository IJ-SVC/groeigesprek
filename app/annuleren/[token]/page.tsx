import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { formatDate, formatTime, isWithinCutoff } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { CancelRegistrationForm } from '@/components/public/CancelRegistrationForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AnnulerenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
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
    .eq('cancellation_token', token)
    .eq('status', 'active')
    .single()

  if (!registration || !registration.session) {
    notFound()
  }

  const session = registration.session

  // Get cutoff hours from settings
  const { data: setting } = await supabase
    .from('settings_groeigesprek')
    .select('value')
    .eq('key', 'cancellation_cutoff_hours')
    .single()

  const cutoffHours = setting ? parseInt(setting.value) : 2
  const canCancel = isWithinCutoff(session.date, session.start_time, cutoffHours)

  if (!canCancel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <h1 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
                Annulering niet meer mogelijk
              </h1>
              <p className="text-ijsselheem-donkerblauw mb-6">
                Je kunt je inschrijving alleen annuleren tot {cutoffHours} uur voor aanvang van de sessie.
              </p>
              <p className="text-ijsselheem-donkerblauw mb-6">
                De sessie start op {formatDate(session.date)} om {formatTime(session.start_time)}.
              </p>
              <Link href={`/${session.conversation_type?.name || ''}`}>
                <Button>Terug naar overzicht</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <h1 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
              Inschrijving annuleren
            </h1>
            <div className="bg-ijsselheem-lichtblauw rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-ijsselheem-donkerblauw mb-2">
                Sessie details
              </h2>
              <div className="text-sm text-ijsselheem-donkerblauw space-y-1">
                <p><strong>Gesprekstype:</strong> {session.conversation_type?.name || 'Gesprek'}</p>
                <p><strong>Datum:</strong> {formatDate(session.date)}</p>
                <p><strong>Tijd:</strong> {formatTime(session.start_time)}
                  {session.end_time && ` - ${formatTime(session.end_time)}`}
                </p>
                <p><strong>Locatie:</strong> {session.is_online ? 'Online (Teams)' : session.location}</p>
              </div>
            </div>
            <CancelRegistrationForm token={token} />
          </Card>
        </div>
      </div>
    </div>
  )
}

