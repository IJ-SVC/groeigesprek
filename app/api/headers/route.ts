import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const supabase = await createClient()

    let result

    if (active === 'true') {
      result = await supabase
        .from('headers_groeigesprek')
        .select('*')
        .eq('is_active', true)
        .single()
    } else {
      result = await supabase
        .from('headers_groeigesprek')
        .select('*')
        .order('created_at', { ascending: false })
    }

    const { data, error } = result

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}


