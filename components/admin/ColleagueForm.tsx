'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Colleague } from '@/types'

interface ColleagueFormProps {
  colleague?: Colleague
}

export function ColleagueForm({ colleague }: ColleagueFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: colleague?.name || '',
    email: colleague?.email || '',
    photo_url: colleague?.photo_url || '',
    is_active: colleague?.is_active ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    colleague?.photo_url || null
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrors({ photo: 'Alleen JPEG, PNG en WebP afbeeldingen zijn toegestaan' })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setErrors({ photo: 'Bestand is te groot. Maximum grootte is 5MB' })
      return
    }

    setIsUploading(true)
    setErrors({})

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/admin/colleagues/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ photo: data.error || 'Upload mislukt' })
        setIsUploading(false)
        return
      }

      setFormData({ ...formData, photo_url: data.url })
      setPhotoPreview(data.url)
      setErrors({})
    } catch (error) {
      setErrors({ photo: 'Er is een fout opgetreden bij het uploaden' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const url = colleague
        ? '/api/admin/colleagues'
        : '/api/admin/colleagues'
      const method = colleague ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colleague ? { id: colleague.id, ...formData } : formData),
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

      router.push('/admin/colleagues')
      router.refresh()
    } catch (error) {
      setErrors({ submit: 'Er is een fout opgetreden. Probeer het opnieuw.' })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Naam *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="ijsselheem-input w-full"
          required
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Email adres *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="ijsselheem-input w-full"
          required
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
          Foto
        </label>
        {photoPreview && (
          <div className="mb-4">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-ijsselheem-lichtblauw"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="ijsselheem-input w-full"
          disabled={isUploading}
        />
        {errors.photo && (
          <p className="text-red-600 text-sm mt-1">{errors.photo}</p>
        )}
        {isUploading && (
          <p className="text-sm text-ijsselheem-donkerblauw mt-1">Uploaden...</p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          Alleen JPEG, PNG en WebP. Maximum grootte: 5MB
        </p>
      </div>

      <div>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-semibold text-ijsselheem-donkerblauw">
            Actief (zichtbaar voor gebruikers)
          </span>
        </label>
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? 'Bezig...' : colleague ? 'Bijwerken' : 'Aanmaken'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
        >
          Annuleren
        </Button>
      </div>
    </form>
  )
}

