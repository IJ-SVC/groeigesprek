'use client'

import { Session } from '@/types'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate, formatTime } from '@/lib/utils'
import { useState } from 'react'

interface SessionTableProps {
  sessions: (Session & { registrationCount?: number })[]
}

export function SessionTable({ sessions }: SessionTableProps) {
  const router = useRouter()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Weet je zeker dat je deze sessie wilt verwijderen? Alle bijbehorende inschrijvingen worden ook verwijderd.')) {
      return
    }
    setDeletingId(sessionId)
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Verwijderen mislukt. Probeer het opnieuw.')
        return
      }
      router.refresh()
    } catch {
      alert('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = sessions.filter((session) => {
    // Exclude individual conversations
    const conversationTypeName = session.conversation_type?.name
    // Type assertion needed because 'individueel gesprek' is not in ConversationType union
    if (conversationTypeName != null && (conversationTypeName as string) === 'individueel gesprek') {
      return false
    }
    if (filterType !== 'all' && conversationTypeName != null && conversationTypeName !== filterType) {
      return false
    }
    if (filterStatus !== 'all' && session.status !== filterStatus) {
      return false
    }
    return true
  })

  const statusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Gepubliceerd</Badge>
      case 'draft':
        return <Badge variant="default">Concept</Badge>
      case 'cancelled':
        return <Badge variant="danger">Geannuleerd</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatConversationTypeName = (name: string | undefined): string => {
    if (!name) return 'Onbekend'
    if (name === 'individueel gesprek') return 'Individueel ontwikkelgesprek'
    if (name === 'groepsontwikkelgesprek') return 'Ontwikkelgesprek in groepsvorm'
    if (name === 'inloopgesprek') return 'Ontwikkelgesprek – spelwerkvorm (individueel)'
    return name
  }

  const formatDateShort = (date: string) =>
    new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: '2-digit' })
  const formatTimeRange = (start: string, end: string | null) =>
    end ? `${formatTime(start)}–${formatTime(end)}` : formatTime(start)

  if (sessions.length === 0) {
    return (
      <Card>
        <p className="text-center text-ijsselheem-donkerblauw py-8">
          Geen sessies gevonden.
        </p>
      </Card>
    )
  }

  return (
    <div>
      <Card className="mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
              Filter op type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="ijsselheem-input w-full"
            >
              <option value="all">Alle types</option>
              <option value="groepsontwikkelgesprek">Ontwikkelgesprek in groepsvorm</option>
              <option value="inloopgesprek">Ontwikkelgesprek – spelwerkvorm (individueel)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
              Filter op status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="ijsselheem-input w-full"
            >
              <option value="all">Alle statussen</option>
              <option value="draft">Concept</option>
              <option value="published">Gepubliceerd</option>
              <option value="cancelled">Geannuleerd</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '170px' }} />
              <col style={{ width: '105px' }} />
              <col style={{ width: '105px' }} />
              <col style={{ width: '105px' }} />
              <col style={{ width: '82px' }} />
              <col style={{ width: '112px' }} />
              <col />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">Datum/Tijd</th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">Locatie</th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">Begeleider</th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">Capaciteit</th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">Acties</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((session) => (
                <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Badge variant="info">
                      {formatConversationTypeName(session.conversation_type?.name)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm align-top" title={`${formatDate(session.date)} ${formatTime(session.start_time)}${session.end_time ? ` - ${formatTime(session.end_time)}` : ''}`}>
                    <span className="block">{formatDateShort(session.date)}</span>
                    <span className="text-gray-600 text-xs">{formatTimeRange(session.start_time, session.end_time)}</span>
                  </td>
                  <td className="py-3 px-4 text-sm truncate" title={session.is_online ? 'Online (Teams)' : session.location || ''}>
                    {session.is_online ? 'Online (Teams)' : session.location}
                  </td>
                  <td className="py-3 px-4 text-sm truncate" title={session.facilitator || ''}>
                    {session.facilitator}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {session.registrationCount || 0} / {session.max_participants}
                  </td>
                  <td className="py-3 px-4">{statusBadge(session.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 flex-wrap">
                      <Link href={`/admin/sessies/${session.id}`}>
                        <Button variant="secondary" className="text-xs py-1 px-2">
                          Bewerken
                        </Button>
                      </Link>
                      <Link href={`/admin/sessies/${session.id}/deelnemers`}>
                        <Button variant="secondary" className="text-xs py-1 px-2">
                          Deelnemers
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        className="text-xs py-1 px-2 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(session.id)}
                        disabled={deletingId === session.id}
                      >
                        {deletingId === session.id ? 'Bezig…' : 'Verwijderen'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}


