// Test script dat Next.js environment loading simuleert
const { loadEnvConfig } = require('@next/env')

const projectDir = process.cwd()
loadEnvConfig(projectDir)

async function testSupabase() {
  console.log('🔍 Testing Supabase connection (Next.js style)...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Environment variables:')
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set (' + supabaseUrl.substring(0, 30) + '...)' : '❌ Missing'}`)
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set (' + supabaseKey.length + ' chars)' : '❌ Missing'}`)
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? '✅ Set (' + serviceKey.length + ' chars)' : '❌ Missing'}`)
  console.log()

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing required environment variables!')
    console.log('\nTips:')
    console.log('  - Check if variables are in .env.local (not just .env)')
    console.log('  - Make sure there are NO spaces around the = sign')
    console.log('  - Make sure variable names are exactly: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('  - Restart your terminal/IDE after adding variables')
    process.exit(1)
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    console.log('⚠️  Warning: SUPABASE_URL should start with https://')
    console.log(`   Current value starts with: ${supabaseUrl.substring(0, 10)}`)
  }

  // Validate key format
  if (supabaseKey.length < 100) {
    console.log('⚠️  Warning: SUPABASE_ANON_KEY seems too short (should be ~200+ chars)')
    console.log(`   Current length: ${supabaseKey.length} chars`)
  }

  // Test connection
  try {
    console.log('Testing connection to Supabase...')
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try a simple query
    const { data, error } = await supabase
      .from('conversation_types')
      .select('count')
      .limit(1)

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('\n❌ Database schema not found!')
        console.log('   The tables do not exist yet.')
        console.log('   ✅ Your Supabase keys are working!')
        console.log('   ⚠️  But you need to run the database schema.')
        console.log('   → Go to Supabase SQL Editor and run: supabase/schema.sql')
        console.log(`   Error: ${error.message}`)
        process.exit(1)
      }

      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.log('\n❌ Permission denied!')
        console.log('   There might be an issue with RLS policies.')
        console.log('   ✅ Your Supabase keys are working!')
        console.log('   ⚠️  But RLS policies might need adjustment.')
        console.log(`   Error: ${error.message}`)
        process.exit(1)
      }

      if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
        console.log('\n❌ Invalid API key!')
        console.log('   The anon key you provided is not valid.')
        console.log('   → Check if you copied the correct key from Supabase')
        console.log('   → Make sure you copied the "anon public" key, not the service_role key')
        console.log(`   Error: ${error.message}`)
        process.exit(1)
      }

      console.log('\n❌ Connection error:')
      console.log(`   Code: ${error.code || 'N/A'}`)
      console.log(`   Message: ${error.message}`)
      process.exit(1)
    }

    console.log('\n✅ Supabase connection successful!')
    console.log('   Your keys are working correctly.')
    console.log('   Database is accessible.')
    console.log('   ✅ Ready to use!')
  } catch (error) {
    if (error.message.includes('fetch')) {
      console.log('\n❌ Network error!')
      console.log('   Could not connect to Supabase.')
      console.log('   → Check if the URL is correct')
      console.log('   → Check your internet connection')
      console.log(`   Error: ${error.message}`)
    } else {
      console.log('\n❌ Unexpected error:')
      console.log(`   ${error.message}`)
    }
    process.exit(1)
  }
}

testSupabase()

