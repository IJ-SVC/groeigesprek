'use client'

import { useState } from 'react'
import { Colleague } from '@/types'
import { Button } from '@/components/shared/Button'

interface RequestModalProps {
  colleague: Colleague
  isOpen: boolean
  onClose: () => void
  mailtoOnly?: boolean
}

const DEFAULT_MESSAGE = 'Ik wil graag een ontwikkelgesprek met je inplannen. Kun je aangeven welke moment voor jou past, zodat we de afspraak kunnen vastleggen? Dank je wel alvast.'
const SPELVORM_MESSAGE = 'Ik wil graag een individueel ontwikkelgesprek - spelvorm met je inplannen. Kun je aangeven welke moment voor jou past, zodat we de afspraak kunnen vastleggen? Dank je wel alvast.'

export function RequestModal({ colleague, isOpen, onClose, mailtoOnly = false }: RequestModalProps) {
  const defaultMessage = mailtoOnly ? SPELVORM_MESSAGE : DEFAULT_MESSAGE
  const [requesterName, setRequesterName] = useState('')
  const [message, setMessage] = useState(defaultMessage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const generateMailtoLink = (
    email: string,
    subject: string,
    body: string
  ): string => {
    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)
    return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Generate email body
      let emailBody = `Beste ${colleague.name},\n\n${message.trim()}\n\n`
      
      if (requesterName) {
        emailBody += `Met vriendelijke groet,\n${requesterName}`
      } else {
        emailBody += 'Met vriendelijke groet'
      }

      // Generate and open mailto link
      const mailtoLink = generateMailtoLink(
        colleague.email,
        'Aanvraag voor ontwikkelgesprek',
        emailBody
      )

      // Open mailto link (this will open the default email client)
      window.location.href = mailtoLink

      // Optionally save the request to the database for tracking (only when not mailtoOnly)
      if (!mailtoOnly) {
        try {
          const response = await fetch('/api/individual-request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              colleague_id: colleague.id,
              requester_name: requesterName || undefined,
              message: message.trim(),
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            // Log error but don't show it to user since mailto already opened
            console.error('Error saving request to database:', data.error)
          }
        } catch (dbErr) {
          // Log error but don't show it to user since mailto already opened
          console.error('Error saving request to database:', dbErr)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setRequesterName('')
        setMessage(defaultMessage)
      }, 3000)
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setError(null)
      setSuccess(false)
      setRequesterName('')
      setMessage(defaultMessage)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-ijsselheem-donkerblauw">
              Aanvraag voor {colleague.name}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-ijsselheem-donkerblauw">
                Outlook wordt geopend
              </p>
              <p className="text-ijsselheem-donkerblauw mt-2">
                Je e-mailclient (Outlook) is geopend met een vooringevulde e-mail naar {colleague.name}. Verstuur de e-mail om je aanvraag te voltooien.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
                  Jouw naam
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="ijsselheem-input w-full"
                  placeholder="Jouw naam"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
                  Bericht *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="ijsselheem-input w-full"
                  rows={6}
                  required
                  placeholder={defaultMessage}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Bezig...' : 'Aanvragen'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Annuleren
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

