import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { formatConversationTypeName } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const supabase = await createClient()

    const { data: session, error } = await supabase
      .from('sessions_groeigesprek')
      .select(`
        *,
        conversation_type:conversation_types(*)
      `)
      .eq('id', sessionId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Sessie niet gevonden' }, { status: 404 })
    }

    // Create ICS content
    const startDateTime = new Date(`${session.date}T${session.start_time}`)
    const endDateTime = session.end_time
      ? new Date(`${session.date}T${session.end_time}`)
      : new Date(startDateTime.getTime() + 60 * 60 * 1000) // Default 1 hour

    // Format description with proper escaping for ICS
    const descriptionParts = [
      `Begeleider: ${session.facilitator}`,
      session.instructions ? session.instructions : null,
    ].filter(Boolean)
    const description = descriptionParts.join('\\n\\n').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')

    // Format summary with proper escaping
    const summary = (formatConversationTypeName(session.conversation_type?.name) || 'Groeigesprek')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')

    // Organizer: organization/facilitator so Outlook does not treat the user as organizer (then they can save/add the event)
    const organizerName = (session.facilitator || 'IJsselheem Groeigesprekken').replace(/[,;]/g, ' ')
    const organizerEmail = process.env.NEXT_PUBLIC_ICS_ORGANIZER_EMAIL || 'groeigesprekken@ijsselheem.nl'
    const organizerLine = `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//IJsselheem//Groeigesprekken//NL',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${session.id}@groeigesprekken.ijsselheem.nl`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      organizerLine,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${session.is_online ? 'Online (Teams)' : session.location.replace(/,/g, '\\,').replace(/;/g, '\\;')}`,
      session.is_online && session.teams_link ? `URL:${session.teams_link}` : '',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Herinnering: Groeigesprek',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n')

    return new Response(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="groeigesprek-${session.id}.ics"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}


