import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isWithinCutoff } from '@/lib/utils'
import { sendCancellationEmail } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get registration by token
    const { data: registration, error: regError } = await supabase
      .from('registrations_groeigesprek')
      .select(`
        *,
        session:sessions_groeigesprek(*)
      `)
      .eq('cancellation_token', token)
      .eq('status', 'active')
      .single()

    if (regError || !registration || !registration.session) {
      return NextResponse.json(
        { error: 'Inschrijving niet gevonden' },
        { status: 404 }
      )
    }

    const session = registration.session

    // Get cutoff hours from settings
    const { data: setting } = await supabase
      .from('settings_groeigesprek')
      .select('value')
      .eq('key', 'cancellation_cutoff_hours')
      .single()

    const cutoffHours = setting ? parseInt(setting.value) : 2

    // Check if within cutoff time
    if (!isWithinCutoff(session.date, session.start_time, cutoffHours)) {
      return NextResponse.json(
        { error: `Annulering is alleen mogelijk tot ${cutoffHours} uur voor aanvang` },
        { status: 400 }
      )
    }

    // Update registration status
    const { error: updateError } = await supabase
      .from('registrations_groeigesprek')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', registration.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Send cancellation email (optional, won't fail if email fails)
    sendCancellationEmail(registration.email, session).catch(
      (err) => console.error('Email sending failed:', err)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

