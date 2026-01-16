'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { Header } from '@/types'

interface HeadersFormProps {
  headers: Header[]
}

export function HeadersForm({ headers }: HeadersFormProps) {
  const router = useRouter()
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    is_active: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/headers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        alert('Er is een fout opgetreden')
        return
      }

      router.refresh()
      setShowNewForm(false)
      setFormData({ title: '', subtitle: '', is_active: false })
    } catch (error) {
      alert('Er is een fout opgetreden')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleActivate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/headers/${id}/activate`, {
        method: 'PUT',
      })

      if (!response.ok) {
        alert('Er is een fout opgetreden')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Er is een fout opgetreden')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze header wilt verwijderen?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/headers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Er is een fout opgetreden')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Er is een fout opgetreden')
    }
  }

  return (
    <div>
      <div className="mb-6">
        {!showNewForm ? (
          <Button onClick={() => setShowNewForm(true)}>Nieuwe header toevoegen</Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-ijsselheem-lichtblauw rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="ijsselheem-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
                Subtitle *
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="ijsselheem-input w-full"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-semibold text-ijsselheem-donkerblauw">
                  Direct activeren
                </span>
              </label>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Bezig...' : 'Toevoegen'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowNewForm(false)
                  setFormData({ title: '', subtitle: '', is_active: false })
                }}
              >
                Annuleren
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {headers.map((header) => (
          <div
            key={header.id}
            className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-ijsselheem-donkerblauw">{header.title}</h3>
                {header.is_active && <Badge variant="success">Actief</Badge>}
              </div>
              <p className="text-sm text-ijsselheem-donkerblauw whitespace-pre-line">
                {header.subtitle}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              {!header.is_active && (
                <Button
                  variant="secondary"
                  className="text-xs py-1 px-2"
                  onClick={() => handleActivate(header.id)}
                >
                  Activeren
                </Button>
              )}
              <Button
                variant="secondary"
                className="text-xs py-1 px-2"
                onClick={() => handleDelete(header.id)}
              >
                Verwijderen
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


