import { z } from 'zod'

export const registrationSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  sessionId: z.string().uuid('Ongeldige sessie ID'),
  name: z.string().min(2, 'Naam moet minimaal 2 tekens bevatten'),
  department: z.string().min(2, 'Afdeling moet minimaal 2 tekens bevatten'),
})

export const sessionSchema = z.object({
  conversation_type_id: z.string().uuid('Ongeldig gesprekstype'),
  date: z.string().refine((date) => {
    const d = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d >= today
  }, 'Datum moet vandaag of in de toekomst zijn'),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Ongeldig tijdformaat (HH:MM)'),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Ongeldig tijdformaat (HH:MM)').optional(),
  location: z.string().min(2, 'Locatie moet minimaal 2 tekens bevatten'),
  is_online: z.boolean().default(false),
  teams_link: z.string().url('Ongeldige URL').optional(),
  facilitator: z.string().min(2, 'Begeleider moet minimaal 2 tekens bevatten'),
  facilitator_user_id: z.string().uuid('Ongeldige gebruiker ID').optional(),
  max_participants: z.number().int().min(1, 'Minimaal 1 deelnemer vereist'),
  status: z.enum(['draft', 'published', 'cancelled']).default('draft'),
  target_audience: z.string().optional(),
  notes: z.string().optional(),
  instructions: z.string().optional(),
}).refine((data) => {
  if (data.is_online && !data.teams_link) {
    return false
  }
  return true
}, {
  message: 'Teams-link is verplicht voor online sessies',
  path: ['teams_link'],
}).refine((data) => {
  if (data.end_time && data.start_time) {
    const start = data.start_time.split(':').map(Number)
    const end = data.end_time.split(':').map(Number)
    const startMinutes = start[0] * 60 + start[1]
    const endMinutes = end[0] * 60 + end[1]
    return endMinutes > startMinutes
  }
  return true
}, {
  message: 'Eindtijd moet na starttijd zijn',
  path: ['end_time'],
})

export const headerSchema = z.object({
  title: z.string().min(1, 'Titel is verplicht'),
  subtitle: z.string().min(1, 'Subtitle is verplicht'),
  is_active: z.boolean().default(false),
})

export const cancelSessionSchema = z.object({
  cancellation_reason: z.string().min(1, 'Reden voor annulering is verplicht'),
})


