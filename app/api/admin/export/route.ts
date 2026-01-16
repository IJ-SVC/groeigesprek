import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import ExcelJS from 'exceljs'

export async function GET(request: Request) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'excel'
    const sessionId = searchParams.get('sessionId')

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

    const { data: registrations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Datum aanmelding',
        'Gesprekstype',
        'Sessie datum',
        'Sessie tijd',
        'E-mail',
        'Naam',
        'Afdeling',
        'Locatie',
        'Begeleider',
        'Status',
      ]

      const rows = (registrations || []).map((reg) => [
        new Date(reg.created_at).toLocaleString('nl-NL'),
        reg.session?.conversation_type?.name || '',
        reg.session?.date || '',
        reg.session?.start_time || '',
        reg.email,
        reg.name,
        reg.department,
        reg.session?.is_online ? 'Online (Teams)' : reg.session?.location || '',
        reg.session?.facilitator || '',
        reg.status,
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="aanmeldingen-groeigesprekken-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Generate Excel
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Aanmeldingen')

      worksheet.columns = [
        { header: 'Datum aanmelding', key: 'created_at', width: 20 },
        { header: 'Gesprekstype', key: 'type', width: 25 },
        { header: 'Sessie datum', key: 'session_date', width: 15 },
        { header: 'Sessie tijd', key: 'session_time', width: 15 },
        { header: 'E-mail', key: 'email', width: 30 },
        { header: 'Naam', key: 'name', width: 25 },
        { header: 'Afdeling', key: 'department', width: 25 },
        { header: 'Locatie', key: 'location', width: 30 },
        { header: 'Begeleider', key: 'facilitator', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
      ]

      ;(registrations || []).forEach((reg) => {
        worksheet.addRow({
          created_at: new Date(reg.created_at).toLocaleString('nl-NL'),
          type: reg.session?.conversation_type?.name || '',
          session_date: reg.session?.date || '',
          session_time: reg.session?.start_time || '',
          email: reg.email,
          name: reg.name,
          department: reg.department,
          location: reg.session?.is_online ? 'Online (Teams)' : reg.session?.location || '',
          facilitator: reg.session?.facilitator || '',
          status: reg.status,
        })
      })

      // Style header row
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCBE9FB' },
      }

      const buffer = await workbook.xlsx.writeBuffer()

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="aanmeldingen-groeigesprekken-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}


