import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { registrationSchema } from '@/lib/validation'
import { sendConfirmationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registrationSchema.parse(body)

    const supabase = await createClient()

    // Check if session exists and is published
    const { data: session, error: sessionError } = await supabase
      .from('sessions_groeigesprek')
      .select('*')
      .eq('id', validated.sessionId)
      .eq('status', 'published')
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sessie niet gevonden of niet beschikbaar' },
        { status: 404 }
      )
    }

    // Check capacity within transaction
    const { count } = await supabase
      .from('registrations_groeigesprek')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', validated.sessionId)
      .eq('status', 'active')

    if ((count || 0) >= session.max_participants) {
      return NextResponse.json(
        { error: 'Deze sessie is vol' },
        { status: 400 }
      )
    }

    // Check for duplicate registration
    const { data: existing } = await supabase
      .from('registrations_groeigesprek')
      .select('id')
      .eq('session_id', validated.sessionId)
      .eq('email', validated.email)
      .eq('status', 'active')
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Je bent al ingeschreven voor deze sessie' },
        { status: 400 }
      )
    }

    // Generate cancellation token
    const cancellationToken = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15)

    // Insert registration
    const { data: registration, error: insertError } = await supabase
      .from('registrations_groeigesprek')
      .insert({
        session_id: validated.sessionId,
        email: validated.email,
        name: validated.name,
        department: validated.department,
        cancellation_token: cancellationToken,
      })
      .select()
      .single()

    if (insertError) {
      // Check if it's a unique constraint violation (race condition)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Deze sessie is vol of je bent al ingeschreven' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Send confirmation email (optional, won't fail if email fails)
    if (registration) {
      sendConfirmationEmail(validated.email, session, cancellationToken).catch(
        (err) => console.error('Email sending failed:', err)
      )
    }

    return NextResponse.json(registration, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

