'use client'

import { Registration } from '@/types'
import { Button } from '@/components/shared/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ParticipantsTableProps {
  registrations: Registration[]
  sessionId: string
}

export function ParticipantsTable({ registrations, sessionId }: ParticipantsTableProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

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

  if (registrations.length === 0) {
    return (
      <p className="text-center text-ijsselheem-donkerblauw py-8">
        Geen deelnemers ingeschreven.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-ijsselheem-donkerblauw">
              Datum aanmelding
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
              Acties
            </th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">
                {new Date(reg.created_at).toLocaleString('nl-NL')}
              </td>
              <td className="py-3 px-4 text-sm">{reg.email}</td>
              <td className="py-3 px-4 text-sm">{reg.name}</td>
              <td className="py-3 px-4 text-sm">{reg.department}</td>
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
  )
}


