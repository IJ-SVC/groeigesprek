'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Colleague } from '@/types'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import Link from 'next/link'

interface ColleaguesTableProps {
  colleagues: Colleague[]
}

export function ColleaguesTable({ colleagues }: ColleaguesTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze collega wilt verwijderen?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/colleagues?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Fout bij verwijderen')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Er is een fout opgetreden')
    } finally {
      setDeletingId(null)
    }
  }

  if (colleagues.length === 0) {
    return (
      <Card>
        <p className="text-center text-ijsselheem-donkerblauw py-8">
          Nog geen collega&apos;s toegevoegd.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left text-sm font-semibold text-ijsselheem-donkerblauw">
                Foto
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ijsselheem-donkerblauw">
                Naam
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ijsselheem-donkerblauw">
                Email
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ijsselheem-donkerblauw">
                Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ijsselheem-donkerblauw">
                Acties
              </th>
            </tr>
          </thead>
          <tbody>
            {colleagues.map((colleague) => (
              <tr key={colleague.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  {colleague.photo_url ? (
                    <img
                      src={colleague.photo_url}
                      alt={colleague.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-ijsselheem-lichtblauw flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-ijsselheem-donkerblauw"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-ijsselheem-donkerblauw">
                  {colleague.name}
                </td>
                <td className="py-3 px-4 text-sm text-ijsselheem-donkerblauw">
                  {colleague.email}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={colleague.is_active ? 'info' : 'danger'}>
                    {colleague.is_active ? 'Actief' : 'Inactief'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/colleagues/${colleague.id}`}>
                      <Button variant="secondary" className="text-xs py-1 px-2">
                        Bewerken
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="text-xs py-1 px-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(colleague.id)}
                      disabled={deletingId === colleague.id}
                    >
                      {deletingId === colleague.id ? 'Verwijderen...' : 'Verwijderen'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

