import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { notFound } from 'next/navigation'
import { formatDate, formatTime } from '@/lib/utils'
import { ParticipantsTable } from '@/components/admin/ParticipantsTable'

export const dynamic = 'force-dynamic'

export default async function DeelnemersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions_groeigesprek')
    .select(`
      *,
      conversation_type:conversation_types(*)
    `)
    .eq('id', id)
    .single()

  if (!session) {
    notFound()
  }

  const { data: registrations } = await supabase
    .from('registrations_groeigesprek')
    .select('*')
    .eq('session_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const registrationCount = registrations?.length || 0
  const percentage = Math.round((registrationCount / session.max_participants) * 100)
  const status = percentage >= 100 ? 'Vol' : percentage >= 80 ? 'Bijna vol' : 'Beschikbaar'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-4">
          Deelnemers - {session.conversation_type?.name || 'Gesprek'}
        </h1>
        <div className="bg-ijsselheem-lichtblauw rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-ijsselheem-donkerblauw">
              {formatDate(session.date)} om {formatTime(session.start_time)}
            </span>
            <Badge variant={percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'success'}>
              {status}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-ijsselheem-donkerblauw">
                {registrationCount} van {session.max_participants} deelnemers ingeschreven
              </span>
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  percentage >= 100
                    ? 'bg-red-500'
                    : percentage >= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-sm text-ijsselheem-donkerblauw">{percentage}%</span>
          </div>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-ijsselheem-donkerblauw">
            Ingeschreven deelnemers
          </h2>
          <a
            href={`/api/admin/export?format=excel&sessionId=${id}`}
            download
          >
            <Button variant="secondary">Exporteer naar Excel</Button>
          </a>
        </div>
        <ParticipantsTable registrations={registrations || []} sessionId={id} />
      </Card>
    </div>
  )
}


