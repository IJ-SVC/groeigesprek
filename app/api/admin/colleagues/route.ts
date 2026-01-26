import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const colleagueSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  email: z.string().email('Ongeldig email adres'),
  photo_url: z.string().url().optional().or(z.literal('')),
  function: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export async function GET(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: colleagues, error } = await supabase
      .from('colleagues_groeigesprek')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(colleagues)
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = colleagueSchema.parse(body)

    const supabase = await createClient()

    const { data: colleague, error } = await supabase
      .from('colleagues_groeigesprek')
      .insert({
        name: validated.name,
        email: validated.email,
        photo_url: validated.photo_url || null,
        function: validated.function || null,
        is_active: validated.is_active,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Een collega met dit email adres bestaat al' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(colleague, { status: 201 })
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

export async function PUT(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is verplicht' },
        { status: 400 }
      )
    }

    const validated = colleagueSchema.partial().parse(updateData)

    const supabase = await createClient()

    const { data: colleague, error } = await supabase
      .from('colleagues_groeigesprek')
      .update({
        ...validated,
        photo_url: validated.photo_url || null,
        function: validated.function || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Een collega met dit email adres bestaat al' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!colleague) {
      return NextResponse.json(
        { error: 'Collega niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json(colleague)
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

export async function DELETE(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is verplicht' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('colleagues_groeigesprek')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

