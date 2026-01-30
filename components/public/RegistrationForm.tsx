'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from '@/types'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { formatDate, formatTime } from '@/lib/utils'

interface RegistrationFormProps {
  session: Session & { conversation_type?: { name: string } }
}

export function RegistrationForm({ session }: RegistrationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    department: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionId: session.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ submit: data.error || 'Er is een fout opgetreden' })
        }
        setIsSubmitting(false)
        return
      }

      router.push(`/bevestiging?sessionId=${session.id}&registrationId=${data.id}`)
    } catch (error) {
      setErrors({ submit: 'Er is een fout opgetreden. Probeer het opnieuw.' })
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
        Inschrijven voor {session.conversation_type?.name || 'gesprek'}
      </h2>

      <div className="mb-6 p-4 bg-ijsselheem-lichtblauw rounded-lg">
        <h3 className="font-semibold text-ijsselheem-donkerblauw mb-2">Sessie details</h3>
        <p className="text-sm text-ijsselheem-donkerblauw">
          <strong>Datum:</strong> {formatDate(session.date)}
        </p>
        <p className="text-sm text-ijsselheem-donkerblauw">
          <strong>Tijd:</strong> {formatTime(session.start_time)}
          {session.end_time && ` - ${formatTime(session.end_time)}`}
        </p>
        <p className="text-sm text-ijsselheem-donkerblauw">
          <strong>Locatie:</strong> {session.is_online ? 'Online (Teams)' : session.location}
        </p>
        <p className="text-sm text-ijsselheem-donkerblauw">
          <strong>Begeleider:</strong> {session.facilitator}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
            E-mailadres *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jouw.naam@ijsselheem.nl"
            className="ijsselheem-input w-full"
            required
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
            Naam *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Volledige naam"
            className="ijsselheem-input w-full"
            required
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
            Locatie *
          </label>
          <input
            type="text"
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="bijv. Locatie of afdeling"
            className="ijsselheem-input w-full"
            required
          />
          {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Bezig...' : 'Inschrijven'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annuleren
          </Button>
        </div>
      </form>
    </Card>
  )
}


