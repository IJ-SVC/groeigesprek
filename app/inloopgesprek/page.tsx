import { createClient } from '@/lib/supabase/server'
import { SessionList } from '@/components/public/SessionList'
import { Card } from '@/components/shared/Card'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'

export const dynamic = 'force-dynamic'

export default async function InloopgesprekPage() {
  const supabase = await createClient()

  // Get conversation type
  const { data: conversationType } = await supabase
    .from('conversation_types')
    .select('*')
    .eq('name', 'inloopgesprek')
    .single()

  if (!conversationType) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-ijsselheem-donkerblauw">
          Gesprekstype niet gevonden.
        </p>
      </div>
    )
  }

  // Get published sessions for this type
  const { data: sessions } = await supabase
    .from('sessions_groeigesprek')
    .select(`
      *,
      conversation_type:conversation_types(*)
    `)
    .eq('conversation_type_id', conversationType.id)
    .eq('status', 'published')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  // Get registration counts
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

  const sessionsWithCounts = (sessions || []).map(session => ({
    ...session,
    registrationCount: registrationCounts[session.id] || 0,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="secondary">← Terug</Button>
            </Link>
          </div>

          <Card className="mb-8">
            <h1 className="text-4xl font-extrabold text-ijsselheem-donkerblauw mb-4">
              Inloopgesprek
            </h1>
            <p className="text-lg text-ijsselheem-donkerblauw">
              Kies een sessie om je aan te melden
            </p>
          </Card>

          <SessionList
            sessions={sessionsWithCounts}
            conversationTypeName="Inloopgesprek"
          />
        </div>
      </div>
    </div>
  )
}


