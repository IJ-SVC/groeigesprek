'use client'

import { Registration, Session } from '@/types'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatTime } from '@/lib/utils'

interface RegistrationTableProps {
  registrations: (Registration & { session?: Session & { conversation_type?: { name: string } } })[]
  sessions: Session[]
}

export function RegistrationTable({ registrations, sessions }: RegistrationTableProps) {
  const router = useRouter()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = registrations.filter((reg) => {
    const conversationTypeName = reg.session?.conversation_type?.name
    if (filterType !== 'all' && typeof conversationTypeName === 'string' && conversationTypeName !== filterType) {
      return false
    }
    if (filterStatus !== 'all' && reg.status !== filterStatus) {
      return false
    }
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze inschrijving wilt verwijderen?')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Er is een fout opgetreden bij het verwijderen')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Er is een fout opgetreden')
    } finally {
      setDeleting(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actief</Badge>
      case 'cancelled':
        return <Badge variant="danger">Geannuleerd</Badge>
      case 'no_show':
        return <Badge variant="warning">No-show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatConversationTypeName = (name: string | undefined): string => {
    if (!name || typeof name !== 'string') return 'Onbekend'
    if (name === 'individueel gesprek') return 'Individueel ontwikkelgesprek'
    if (name === 'groepsontwikkelgesprek') return 'Ontwikkelgesprek in groepsvorm'
    if (name === 'inloopgesprek') return 'Ontwikkelgesprek – spelwerkvorm (individueel)'
    return name
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
              <option value="individueel gesprek">Individueel ontwikkelgesprek</option>
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
              <option value="active">Actief</option>
              <option value="cancelled">Geannuleerd</option>
              <option value="no_show">No-show</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  Datum aanmelding
                </th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  Gesprekstype
                </th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  Sessie
                </th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  E-mail
                </th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  Naam
                </th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  Afdeling
                </th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    {new Date(reg.created_at).toLocaleString('nl-NL')}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {formatConversationTypeName(reg.session?.conversation_type?.name)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {reg.session ? (
                      <>
                        {formatDate(reg.session.date)} {formatTime(reg.session.start_time)}
                      </>
                    ) : (
                      'Onbekend'
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">{reg.email || '-'}</td>
                  <td className="py-3 px-4 text-sm">{reg.name}</td>
                  <td className="py-3 px-4 text-sm">{reg.department}</td>
                  <td className="py-3 px-4">{statusBadge(reg.status)}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="secondary"
                      className="text-xs py-1 px-2"
                      onClick={() => handleDelete(reg.id)}
                      disabled={deleting === reg.id}
                    >
                      {deleting === reg.id ? 'Verwijderen...' : 'Verwijderen'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-ijsselheem-donkerblauw py-8">
            Geen aanmeldingen gevonden.
          </p>
        )}
      </Card>
    </div>
  )
}


