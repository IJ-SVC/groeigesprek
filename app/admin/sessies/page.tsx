import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { Badge } from '@/components/shared/Badge'
import { formatDate, formatTime } from '@/lib/utils'
import { SessionTable } from '@/components/admin/SessionTable'

export const dynamic = 'force-dynamic'

export default async function SessiesPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions_groeigesprek')
    .select(`
      *,
      conversation_type:conversation_types(*)
    `)
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
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw">
          Sessiebeheer
        </h1>
        <div className="flex gap-4">
          <Link href="/admin/sessies/nieuw">
            <Button>Nieuwe sessie</Button>
          </Link>
          <Link href="/admin/sessies/bulk">
            <Button variant="secondary">Bulk aanmaken</Button>
          </Link>
        </div>
      </div>

      <SessionTable sessions={sessionsWithCounts} />
    </div>
  )
}


