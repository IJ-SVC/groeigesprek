'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'

interface CancelRegistrationFormProps {
  token: string
}

export function CancelRegistrationForm({ token }: CancelRegistrationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/registrations/cancel/${token}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Er is een fout opgetreden')
        setIsSubmitting(false)
        return
      }

      router.push('/bevestiging?cancelled=true')
    } catch (error) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      <p className="text-ijsselheem-donkerblauw mb-6">
        Weet je zeker dat je je inschrijving wilt annuleren?
      </p>
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} variant="secondary">
          {isSubmitting ? 'Bezig...' : 'Ja, annuleer inschrijving'}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Nee, behoud inschrijving
        </Button>
      </div>
    </form>
  )
}

