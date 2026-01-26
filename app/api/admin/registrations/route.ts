import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const supabase = await createClient()

    let query = supabase
      .from('registrations_groeigesprek')
      .select(`
        *,
        session:sessions_groeigesprek(
          *,
          conversation_type:conversation_types(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      // Filter by conversation type
      const { data: conversationType } = await supabase
        .from('conversation_types')
        .select('id')
        .eq('name', type)
        .single()

      if (conversationType) {
        // This requires a join, so we'll filter in memory for now
        // In production, you might want to use a more efficient query
      }
    }

    const { data: registrations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by type if specified (in memory)
    let filtered = registrations
    if (type && registrations) {
      filtered = registrations.filter((reg) => {
        const conversationTypeName = reg.session?.conversation_type?.name
        return typeof conversationTypeName === 'string' && conversationTypeName === type
      })
    }

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}


