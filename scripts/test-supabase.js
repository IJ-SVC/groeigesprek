// Test script om Supabase connectie te checken
const path = require('path')
const fs = require('fs')

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value
      }
    }
  })
}

const { createClient } = require('@supabase/supabase-js')

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Environment variables:')
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)
  console.log()

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing required environment variables!')
    console.log('Please check your .env.local file.')
    process.exit(1)
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    console.log('⚠️  Warning: SUPABASE_URL should start with https://')
  }

  // Validate key format
  if (supabaseKey.length < 100) {
    console.log('⚠️  Warning: SUPABASE_ANON_KEY seems too short')
  }

  // Test connection
  try {
    console.log('Testing connection...')
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
        console.log('   Please run supabase/schema.sql in your Supabase SQL Editor.')
        console.log(`   Error: ${error.message}`)
        process.exit(1)
      }

      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.log('\n❌ Permission denied!')
        console.log('   There might be an issue with RLS policies or the anon key.')
        console.log(`   Error: ${error.message}`)
        process.exit(1)
      }

      console.log('\n❌ Connection error:')
      console.log(`   Code: ${error.code}`)
      console.log(`   Message: ${error.message}`)
      process.exit(1)
    }

    console.log('\n✅ Supabase connection successful!')
    console.log('   Your keys are working correctly.')
    console.log('   Database is accessible.')
  } catch (error) {
    console.log('\n❌ Unexpected error:')
    console.log(`   ${error.message}`)
    process.exit(1)
  }
}

testSupabase()

