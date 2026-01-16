import { createClient } from '@/lib/supabase/server'
import { RegistrationForm } from '@/components/public/RegistrationForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'

export const dynamic = 'force-dynamic'

export default async function InschrijvenPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions_groeigesprek')
    .select(`
      *,
      conversation_type:conversation_types(*)
    `)
    .eq('id', sessionId)
    .eq('status', 'published')
    .single()

  if (!session) {
    notFound()
  }

  // Check capacity
  const { count } = await supabase
    .from('registrations_groeigesprek')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('status', 'active')

  const availableSpots = session.max_participants - (count || 0)
  const isFull = availableSpots <= 0

  if (isFull) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
                Deze sessie is vol
              </h1>
              <p className="text-ijsselheem-donkerblauw mb-6">
                Helaas zijn er geen plekken meer beschikbaar voor deze sessie.
              </p>
              <Link href={`/${session.conversation_type?.name || ''}`}>
                <Button>Terug naar overzicht</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href={`/${session.conversation_type?.name || ''}`}>
              <Button variant="secondary">← Terug</Button>
            </Link>
          </div>
          <RegistrationForm session={session} />
        </div>
      </div>
    </div>
  )
}


