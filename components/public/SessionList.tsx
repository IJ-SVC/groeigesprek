'use client'

import { Session } from '@/types'
import { SessionCard } from './SessionCard'
import { useState } from 'react'

interface SessionListProps {
  sessions: (Session & { registrationCount?: number })[]
  conversationTypeName: string
}

export function SessionList({ sessions, conversationTypeName }: SessionListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'location'>('date')

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(`${a.date}T${a.start_time}`)
      const dateB = new Date(`${b.date}T${b.start_time}`)
      return dateA.getTime() - dateB.getTime()
    }
    if (sortBy === 'time') {
      return a.start_time.localeCompare(b.start_time)
    }
    if (sortBy === 'location') {
      return a.location.localeCompare(b.location)
    }
    return 0
  })

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-ijsselheem-donkerblauw">
          Er zijn momenteel geen beschikbare sessies.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'time' | 'location')}
          className="ijsselheem-input"
        >
          <option value="date">Sorteer op datum</option>
          <option value="time">Sorteer op tijd</option>
          <option value="location">Sorteer op locatie</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            conversationTypeName={conversationTypeName}
          />
        ))}
      </div>
    </div>
  )
}


