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

