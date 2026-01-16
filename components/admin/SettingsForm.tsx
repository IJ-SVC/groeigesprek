'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'

interface SettingsFormProps {
  settings: Record<string, string>
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    cancellation_cutoff_hours: settings.cancellation_cutoff_hours || '2',
    email_confirmation_enabled: settings.email_confirmation_enabled || 'false',
    email_cancellation_enabled: settings.email_cancellation_enabled || 'false',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update each setting
      const updates = Object.entries(formData).map(([key, value]) =>
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      )

      await Promise.all(updates)
      router.refresh()
      alert('Instellingen opgeslagen')
    } catch (error) {
      alert('Er is een fout opgetreden')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Cut-off tijd voor annulering (uren)
        </label>
        <input
          type="number"
          min="0"
          value={formData.cancellation_cutoff_hours}
          onChange={(e) => setFormData({ ...formData, cancellation_cutoff_hours: e.target.value })}
          className="ijsselheem-input w-full"
        />
        <p className="text-xs text-gray-600 mt-1">
          Aantal uren vooraf dat medewerkers hun inschrijving kunnen annuleren
        </p>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.email_confirmation_enabled === 'true'}
            onChange={(e) =>
              setFormData({
                ...formData,
                email_confirmation_enabled: e.target.checked ? 'true' : 'false',
              })
            }
            className="mr-2"
          />
          <span className="text-sm font-semibold text-ijsselheem-donkerblauw">
            Bevestigingsmails versturen
          </span>
        </label>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.email_cancellation_enabled === 'true'}
            onChange={(e) =>
              setFormData({
                ...formData,
                email_cancellation_enabled: e.target.checked ? 'true' : 'false',
              })
            }
            className="mr-2"
          />
          <span className="text-sm font-semibold text-ijsselheem-donkerblauw">
            Annuleringsmails versturen
          </span>
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Bezig...' : 'Opslaan'}
      </Button>
    </form>
  )
}


