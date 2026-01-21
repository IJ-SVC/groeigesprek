import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(time: string): string {
  return time.substring(0, 5) // HH:MM
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} om ${formatTime(time)}`
}

export function generateCancellationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isWithinCutoff(sessionDate: string, sessionTime: string, cutoffHours: number = 2): boolean {
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`)
  const cutoffTime = new Date(sessionDateTime.getTime() - cutoffHours * 60 * 60 * 1000)
  const now = new Date()
  return now < cutoffTime
}

// Check if conversation type supports ICS calendar download
export function supportsICSDownload(conversationTypeName: string | undefined): boolean {
  if (!conversationTypeName) return false
  return conversationTypeName === 'groepsontwikkelgesprek' || 
         conversationTypeName === 'inloopgesprek'
}

// Format conversation type name for display
export function formatConversationTypeName(name: string | undefined): string {
  if (!name) return 'Onbekend'
  if (name === 'individueel gesprek') return 'Individueel ontwikkelgesprek'
  if (name === 'groepsontwikkelgesprek') return 'Ontwikkelgesprek in groepsvorm'
  if (name === 'inloopgesprek') return 'Ontwikkelgesprek – spelwerkvorm (individueel)'
  return name
}


