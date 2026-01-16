import Link from 'next/link'
import { Session } from '@/types'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { formatDate, formatTime } from '@/lib/utils'

interface SessionCardProps {
  session: Session & { registrationCount?: number }
  conversationTypeName: string
}

export function SessionCard({ session, conversationTypeName }: SessionCardProps) {
  const availableSpots = session.max_participants - (session.registrationCount || 0)
  const isFull = availableSpots <= 0
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-ijsselheem-donkerblauw mb-2">
            {formatDate(session.date)}
          </h3>
          <p className="text-ijsselheem-donkerblauw">
            {formatTime(session.start_time)}
            {session.end_time && ` - ${formatTime(session.end_time)}`}
          </p>
        </div>
        <Badge variant={isFull ? 'danger' : isAlmostFull ? 'warning' : 'info'}>
          {conversationTypeName}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-ijsselheem-donkerblauw">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {session.is_online ? 'Online (Teams)' : session.location}
        </div>
        <div className="flex items-center text-sm text-ijsselheem-donkerblauw">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {session.facilitator}
        </div>
        <div className="flex items-center text-sm text-ijsselheem-donkerblauw">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {availableSpots} van {session.max_participants} plekken beschikbaar
          {isAlmostFull && !isFull && (
            <span className="ml-2 text-ijsselheem-olijfgroen font-semibold">(Bijna vol)</span>
          )}
        </div>
      </div>

      <Link href={`/inschrijven/${session.id}`}>
        <Button className="w-full" disabled={isFull}>
          {isFull ? 'Vol' : 'Aanmelden'}
        </Button>
      </Link>
    </Card>
  )
}


