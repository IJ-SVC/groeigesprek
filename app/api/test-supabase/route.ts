import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing environment variables',
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
          },
        },
        { status: 400 }
      )
    }

    // Test connection
    const supabase = await createClient()

    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('conversation_types')
      .select('count')
      .limit(1)

    if (error) {
      // Check if it's a table doesn't exist error (schema not run yet)
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Database schema not found',
          message: 'De database tabellen bestaan nog niet. Voer eerst supabase/schema.sql uit in Supabase.',
          details: error.message,
        })
      }

      // Check if it's an RLS policy issue
      if (error.code === '42501' || error.message.includes('permission denied')) {
        return NextResponse.json({
          success: false,
          error: 'Permission denied',
          message: 'Er is een probleem met de RLS policies of de anon key heeft geen toegang.',
          details: error.message,
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        details: error.message,
        code: error.code,
      })
    }

    // If we get here, connection works!
    return NextResponse.json({
      success: true,
      message: 'Supabase connectie werkt correct!',
      details: {
        url: supabaseUrl.substring(0, 30) + '...', // Don't expose full URL
        hasKey: true,
        connectionTest: 'passed',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

