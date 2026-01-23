import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { sessionSchema } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const supabase = await createClient()

    // Get conversation types that require registration (exclude individual conversations)
    const { data: conversationTypes } = await supabase
      .from('conversation_types')
      .select('id')
      .neq('name', 'individueel gesprek')

    const conversationTypeIds = conversationTypes?.map(ct => ct.id) || []

    let query = supabase
      .from('sessions_groeigesprek')
      .select(`
        *,
        conversation_type:conversation_types(*)
      `)
      .in('conversation_type_id', conversationTypeIds.length > 0 ? conversationTypeIds : ['00000000-0000-0000-0000-000000000000'])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (type) {
      // Don't allow filtering by individual conversation type
      if (type === 'individueel gesprek') {
        return NextResponse.json([], { status: 200 })
      }

      const { data: conversationType } = await supabase
        .from('conversation_types')
        .select('id')
        .eq('name', type)
        .single()

      if (conversationType) {
        query = query.eq('conversation_type_id', conversationType.id)
      }
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: sessions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received request body:', body)

    let validated
    try {
      validated = sessionSchema.parse(body)
      console.log('Validated data:', validated)
    } catch (validationError: any) {
      console.error('Validation error:', validationError)
      if (validationError.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Ongeldige gegevens', errors: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('Creating session with data:', { ...validated, created_by: user?.id })

    const { data: session, error } = await supabase
      .from('sessions_groeigesprek')
      .insert({
        ...validated,
        created_by: user?.id,
      })
      .select(`
        *,
        conversation_type:conversation_types(*)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint },
        { status: 500 }
      )
    }

    console.log('Session created successfully:', session)
    return NextResponse.json(session, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden', details: error.message },
      { status: 500 }
    )
  }
}


