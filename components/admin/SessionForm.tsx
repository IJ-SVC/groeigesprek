'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { ConversationTypeRecord } from '@/types'

interface SessionFormProps {
  conversationTypes: ConversationTypeRecord[]
  session?: any
}

export function SessionForm({ conversationTypes, session }: SessionFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    conversation_type_id: session?.conversation_type_id || '',
    date: session?.date || '',
    start_time: session?.start_time || '',
    end_time: session?.end_time || '',
    location: session?.location || '',
    is_online: session?.is_online || false,
    teams_link: session?.teams_link || '',
    facilitator: session?.facilitator || '',
    facilitator_user_id: session?.facilitator_user_id || '',
    max_participants: session?.max_participants || 10,
    status: session?.status || 'draft',
    target_audience: session?.target_audience || '',
    notes: session?.notes || '',
    instructions: session?.instructions || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateTime = (time: string): boolean => {
    if (!time) return true // Empty is valid for optional fields
    const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    // Remove any non-digit and colon characters
    let cleaned = value.replace(/[^\d:]/g, '')
    
    // Auto-format as user types (HH:MM)
    if (cleaned.length <= 2) {
      setFormData({ ...formData, [field]: cleaned })
    } else if (cleaned.length <= 4) {
      // Insert colon after 2 digits
      const hours = cleaned.slice(0, 2)
      const minutes = cleaned.slice(2, 4)
      setFormData({ ...formData, [field]: `${hours}:${minutes}` })
    } else {
      // Limit to HH:MM format
      const hours = cleaned.slice(0, 2)
      const minutes = cleaned.slice(2, 4)
      setFormData({ ...formData, [field]: `${hours}:${minutes}` })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validate times
    if (!validateTime(formData.start_time)) {
      setErrors({ start_time: 'Voer een geldige tijd in (HH:MM, 24-uurs notatie)' })
      return
    }
    if (formData.end_time && !validateTime(formData.end_time)) {
      setErrors({ end_time: 'Voer een geldige tijd in (HH:MM, 24-uurs notatie)' })
      return
    }
    
    setIsSubmitting(true)

    try {
      const url = session
        ? `/api/admin/sessions/${session.id}`
        : '/api/admin/sessions'
      const method = session ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors.reduce((acc: any, err: any) => {
            acc[err.path[0]] = err.message
            return acc
          }, {}))
        } else {
          setErrors({ submit: data.error || 'Er is een fout opgetreden' })
        }
        setIsSubmitting(false)
        return
      }

      router.push('/admin/sessies')
      router.refresh()
    } catch (error) {
      setErrors({ submit: 'Er is een fout opgetreden. Probeer het opnieuw.' })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" lang="nl">
      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Gesprekstype *
        </label>
        <select
          value={formData.conversation_type_id}
          onChange={(e) => setFormData({ ...formData, conversation_type_id: e.target.value })}
          className="ijsselheem-input w-full"
          required
        >
          <option value="">Selecteer type</option>
          {conversationTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.conversation_type_id && (
          <p className="text-red-600 text-sm mt-1">{errors.conversation_type_id}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
            Datum *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="ijsselheem-input w-full"
            required
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
            Starttijd *
          </label>
          <input
            type="text"
            value={formData.start_time}
            onChange={(e) => handleTimeChange('start_time', e.target.value)}
            onBlur={(e) => {
              // Ensure format is correct on blur
              const value = e.target.value
              if (value && !validateTime(value)) {
                setErrors({ ...errors, start_time: 'Voer een geldige tijd in (HH:MM, bijv. 14:30)' })
              } else {
                const newErrors = { ...errors }
                delete newErrors.start_time
                setErrors(newErrors)
              }
            }}
            className="ijsselheem-input w-full"
            placeholder="HH:MM (bijv. 14:30)"
            pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
            required
          />
          {errors.start_time && (
            <p className="text-red-600 text-sm mt-1">{errors.start_time}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Eindtijd (optioneel)
        </label>
        <input
          type="text"
          value={formData.end_time}
          onChange={(e) => handleTimeChange('end_time', e.target.value)}
          onBlur={(e) => {
            // Ensure format is correct on blur
            const value = e.target.value
            if (value && !validateTime(value)) {
              setErrors({ ...errors, end_time: 'Voer een geldige tijd in (HH:MM, bijv. 16:00)' })
            } else {
              const newErrors = { ...errors }
              delete newErrors.end_time
              setErrors(newErrors)
            }
          }}
          className="ijsselheem-input w-full"
          placeholder="HH:MM (bijv. 16:00)"
          pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
        />
        {errors.end_time && <p className="text-red-600 text-sm mt-1">{errors.end_time}</p>}
      </div>

      <div>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={formData.is_online}
            onChange={(e) => setFormData({ ...formData, is_online: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-semibold text-ijsselheem-donkerblauw">
            Online (Teams-link)
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Locatie *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="ijsselheem-input w-full"
          required
        />
        {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
      </div>

      {formData.is_online && (
        <div>
          <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
            Teams-link *
          </label>
          <input
            type="url"
            value={formData.teams_link}
            onChange={(e) => setFormData({ ...formData, teams_link: e.target.value })}
            className="ijsselheem-input w-full"
            required={formData.is_online}
          />
          {errors.teams_link && (
            <p className="text-red-600 text-sm mt-1">{errors.teams_link}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Begeleider *
        </label>
        <input
          type="text"
          value={formData.facilitator}
          onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
          className="ijsselheem-input w-full"
          required
        />
        {errors.facilitator && (
          <p className="text-red-600 text-sm mt-1">{errors.facilitator}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Max deelnemers *
        </label>
        <input
          type="number"
          min="1"
          value={formData.max_participants}
          onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
          className="ijsselheem-input w-full"
          required
        />
        {errors.max_participants && (
          <p className="text-red-600 text-sm mt-1">{errors.max_participants}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Status *
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="ijsselheem-input w-full"
          required
        >
          <option value="draft">Concept</option>
          <option value="published">Gepubliceerd</option>
          <option value="cancelled">Geannuleerd</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Doelgroep (optioneel)
        </label>
        <textarea
          value={formData.target_audience}
          onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
          className="ijsselheem-input w-full"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Opmerkingen (optioneel)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="ijsselheem-input w-full"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Instructies voor deelnemers (optioneel)
        </label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className="ijsselheem-input w-full"
          rows={3}
        />
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig...' : session ? 'Bijwerken' : 'Aanmaken'}
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
  )
}


