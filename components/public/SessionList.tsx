'use client'

import { Session } from '@/types'
import { SessionCard } from './SessionCard'
import { useMemo, useState } from 'react'

interface SessionListProps {
  sessions: (Session & { registrationCount?: number })[]
  conversationTypeName: string
  showLocationFilter?: boolean
}

export function SessionList({ sessions, conversationTypeName, showLocationFilter = false }: SessionListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'location'>('date')
  const [locationFilter, setLocationFilter] = useState<string>('')

  const locations = useMemo(() => {
    if (!showLocationFilter) return []
    const unique = [...new Set(sessions.map((s) => s.location))].sort()
    return unique
  }, [sessions, showLocationFilter])

  const filteredSessions = useMemo(() => {
    if (!showLocationFilter || !locationFilter) return sessions
    return sessions.filter((s) => s.location === locationFilter)
  }, [sessions, showLocationFilter, locationFilter])

  const sortedSessions = [...filteredSessions].sort((a, b) => {
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
      <div className="mb-6 flex flex-wrap justify-end gap-4">
        {showLocationFilter && locations.length > 0 && (
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="ijsselheem-input"
            aria-label="Filter op locatie"
          >
            <option value="">Alle locaties</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        )}
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
      {sortedSessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-ijsselheem-donkerblauw">
            {locationFilter
              ? `Geen sessies gevonden op ${locationFilter}.`
              : 'Er zijn momenteel geen beschikbare sessies.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              conversationTypeName={conversationTypeName}
            />
          ))}
        </div>
      )}
    </div>
  )
}


