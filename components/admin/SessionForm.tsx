'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import { nl } from 'date-fns/locale'
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

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  )

  // Generate minutes (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45']

  // Parse time string to hours and minutes
  const parseTime = (time: string) => {
    if (!time) return { hours: '', minutes: '' }
    const parts = time.split(':')
    return {
      hours: parts[0] || '',
      minutes: parts[1] || '',
    }
  }

  // Normalize time to HH:MM (API expects this; DB may return HH:MM:SS)
  const toHHMM = (t: string | undefined): string | undefined => {
    if (!t || !String(t).trim()) return undefined
    const parts = String(t).trim().split(':')
    if (parts.length >= 2) {
      const h = (parts[0] ?? '00').padStart(2, '0')
      const m = (parts[1] ?? '00').padStart(2, '0')
      return `${h}:${m}`
    }
    return undefined
  }

  // Convert date string (YYYY-MM-DD) to Date object
  const parseDateString = (dateString: string): Date | null => {
    if (!dateString) return null
    const date = new Date(dateString + 'T00:00:00')
    return isNaN(date.getTime()) ? null : date
  }

  // Format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return ''
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Handle date change from date picker
  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format as YYYY-MM-DD for storage
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      setFormData({ ...formData, date: dateString })
      // Clear any errors for this field
      const newErrors = { ...errors }
      delete newErrors.date
      setErrors(newErrors)
    } else {
      setFormData({ ...formData, date: '' })
    }
  }

  // Handle time change from dropdowns
  const handleTimeSelect = (field: 'start_time' | 'end_time', hours: string, minutes: string) => {
    if (hours && minutes) {
      const time = `${hours}:${minutes}`
      setFormData({ ...formData, [field]: time })
      // Clear any errors for this field
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    } else {
      setFormData({ ...formData, [field]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validate date (should always be valid with date picker, but check anyway)
    if (!formData.date || !formData.date.includes('-')) {
      setErrors({ date: 'Selecteer een datum' })
      return
    }
    
    // Validate times (should always be valid with dropdowns, but check anyway)
    if (!formData.start_time || !formData.start_time.includes(':')) {
      setErrors({ start_time: 'Selecteer een starttijd' })
      return
    }
    if (formData.end_time && !formData.end_time.includes(':')) {
      setErrors({ end_time: 'Selecteer een geldige eindtijd' })
      return
    }
    
    // Validate required fields
    if (!formData.conversation_type_id) {
      setErrors({ conversation_type_id: 'Selecteer een gesprekstype' })
      return
    }
    if (!formData.location || formData.location.trim().length < 2) {
      setErrors({ location: 'Locatie moet minimaal 2 tekens bevatten' })
      return
    }
    if (!formData.facilitator || formData.facilitator.trim().length < 2) {
      setErrors({ facilitator: 'Begeleider moet minimaal 2 tekens bevatten' })
      return
    }
    
    setIsSubmitting(true)

    try {
      const url = session
        ? `/api/admin/sessions/${session.id}`
        : '/api/admin/sessions'
      const method = session ? 'PUT' : 'POST'

      // Prepare data for submission - ensure date is in YYYY-MM-DD and times in HH:MM
      // (DB may return HH:MM:SS; API expects HH:MM)
      const submitData = {
        ...formData,
        date: formData.date,
        start_time: toHHMM(formData.start_time) ?? formData.start_time,
        end_time: formData.end_time?.trim() ? toHHMM(formData.end_time.trim()) : undefined,
        max_participants: Number(formData.max_participants) || 10,
        is_online: Boolean(formData.is_online),
        teams_link: formData.teams_link?.trim() || undefined,
        facilitator_user_id: formData.facilitator_user_id?.trim() || undefined,
        target_audience: formData.target_audience?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        instructions: formData.instructions?.trim() || undefined,
      }

      console.log('Submitting form data:', submitData)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        const text = await response.text()
        console.error('Response text:', text)
        setErrors({ submit: 'Er is een fout opgetreden bij het verwerken van de response' })
        setIsSubmitting(false)
        return
      }

      console.log('Response status:', response.status)
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('Error response:', data)
        if (data.errors && Array.isArray(data.errors)) {
          const errorMap = data.errors.reduce((acc: any, err: any) => {
            const field = err.path?.[0] || err.field || 'submit'
            acc[field] = err.message || err.msg || 'Ongeldige waarde'
            return acc
          }, {})
          console.log('Validation errors:', errorMap)
          setErrors(errorMap)
        } else if (data.error) {
          setErrors({ submit: data.error })
        } else {
          setErrors({ submit: 'Er is een fout opgetreden' })
        }
        setIsSubmitting(false)
        return
      }

      console.log('Session created successfully:', data)
      router.push('/admin/sessies')
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)
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
              {type.description ?? type.name}
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
          <DatePicker
            selected={parseDateString(formData.date)}
            onChange={handleDateChange}
            dateFormat="dd-MM-yyyy"
            locale={nl}
            className="ijsselheem-input w-full"
            required
            minDate={new Date()}
            showPopperArrow={false}
            calendarStartDay={1}
            todayButton="Vandaag"
            clearButtonTitle="Wissen"
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
            Starttijd *
          </label>
          <div className="flex gap-2">
            <select
              value={parseTime(formData.start_time).hours}
              onChange={(e) => {
                const currentMinutes = parseTime(formData.start_time).minutes || '00'
                handleTimeSelect('start_time', e.target.value, currentMinutes)
              }}
              className="ijsselheem-input flex-1"
              required
            >
              <option value="">Uur</option>
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
            <select
              value={parseTime(formData.start_time).minutes}
              onChange={(e) => {
                const currentHours = parseTime(formData.start_time).hours || '00'
                handleTimeSelect('start_time', currentHours, e.target.value)
              }}
              className="ijsselheem-input flex-1"
              required
            >
              <option value="">Min</option>
              {minutes.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>
          {errors.start_time && (
            <p className="text-red-600 text-sm mt-1">{errors.start_time}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Eindtijd (optioneel)
        </label>
        <div className="flex gap-2">
          <select
            value={parseTime(formData.end_time).hours}
            onChange={(e) => {
              const currentMinutes = parseTime(formData.end_time).minutes || '00'
              handleTimeSelect('end_time', e.target.value, currentMinutes)
            }}
            className="ijsselheem-input flex-1"
          >
            <option value="">Uur</option>
            {hours.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          <select
            value={parseTime(formData.end_time).minutes}
            onChange={(e) => {
              const currentHours = parseTime(formData.end_time).hours || '00'
              handleTimeSelect('end_time', currentHours, e.target.value)
            }}
            className="ijsselheem-input flex-1"
          >
            <option value="">Min</option>
            {minutes.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </div>
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


