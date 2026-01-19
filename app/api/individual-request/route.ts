import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendIndividualRequestEmail } from '@/lib/email'
import { z } from 'zod'

const individualRequestSchema = z.object({
  colleague_id: z.string().uuid(),
  requester_name: z.string().optional(),
  requester_email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(1, 'Bericht is verplicht'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = individualRequestSchema.parse(body)

    const supabase = await createClient()

    // Check if colleague exists and is active
    const { data: colleague, error: colleagueError } = await supabase
      .from('colleagues_groeigesprek')
      .select('*')
      .eq('id', validated.colleague_id)
      .eq('is_active', true)
      .single()

    if (colleagueError || !colleague) {
      return NextResponse.json(
        { error: 'Collega niet gevonden of niet beschikbaar' },
        { status: 404 }
      )
    }

    // Get or create "individueel gesprek" conversation type
    let { data: individualType } = await supabase
      .from('conversation_types')
      .select('*')
      .eq('name', 'individueel gesprek')
      .single()

    if (!individualType) {
      // Create the conversation type if it doesn't exist
      const { data: newType, error: typeError } = await supabase
        .from('conversation_types')
        .insert({
          name: 'individueel gesprek',
          description: 'Individueel gesprek',
        })
        .select()
        .single()

      if (typeError) {
        return NextResponse.json({ error: 'Fout bij aanmaken gesprekstype' }, { status: 500 })
      }
      individualType = newType
    }

    // Get or create a special session for individual conversations with this colleague
    // We'll use a session per colleague to track requests
    let { data: individualSession } = await supabase
      .from('sessions_groeigesprek')
      .select('*')
      .eq('conversation_type_id', individualType.id)
      .eq('facilitator', colleague.name)
      .eq('status', 'published')
      .single()

    if (!individualSession) {
      // Create a placeholder session for this colleague's individual conversations
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions_groeigesprek')
        .insert({
          conversation_type_id: individualType.id,
          date: new Date().toISOString().split('T')[0], // Today's date as placeholder
          start_time: '00:00:00',
          location: `Individueel gesprek met ${colleague.name}`,
          facilitator: colleague.name,
          max_participants: 999, // High limit for individual conversations
          status: 'published',
          notes: 'Placeholder sessie voor individuele gespreksaanvragen',
        })
        .select()
        .single()

      if (sessionError) {
        return NextResponse.json({ error: 'Fout bij aanmaken sessie' }, { status: 500 })
      }
      individualSession = newSession
    }

    // Insert request
    const { data: requestData, error: insertError } = await supabase
      .from('individual_requests_groeigesprek')
      .insert({
        colleague_id: validated.colleague_id,
        requester_name: validated.requester_name || null,
        requester_email: validated.requester_email || null,
        message: validated.message,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Create registration if we have requester email and name
    if (validated.requester_email && validated.requester_name) {
      const cancellationToken = Math.random().toString(36).substring(2, 15) + 
                                Math.random().toString(36).substring(2, 15)

      const { error: registrationError } = await supabase
        .from('registrations_groeigesprek')
        .insert({
          session_id: individualSession.id,
          email: validated.requester_email,
          name: validated.requester_name,
          department: 'Individueel gesprek', // Default department for individual conversations
          cancellation_token: cancellationToken,
        })

      if (registrationError) {
        // Log error but don't fail the request
        console.error('Error creating registration:', registrationError)
      }
    }

    // Send email to colleague (optional, won't fail if email fails)
    if (requestData) {
      sendIndividualRequestEmail(
        colleague.email,
        {
          colleague_name: colleague.name,
          requester_name: validated.requester_name,
          requester_email: validated.requester_email,
          message: validated.message,
        }
      ).catch((err) => console.error('Email sending failed:', err))
    }

    return NextResponse.json(requestData, { status: 201 })
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

