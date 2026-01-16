// Simpele check om te zien welke env variabelen er zijn
const fs = require('fs')
const path = require('path')

console.log('📋 Checking .env.local file...\n')

const envPath = path.join(__dirname, '..', '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!')
  process.exit(1)
}

console.log('✅ .env.local file found\n')
console.log('Contents (hiding values):\n')

const content = fs.readFileSync(envPath, 'utf8')
const lines = content.split('\n')

let hasSupabaseUrl = false
let hasSupabaseKey = false

lines.forEach((line, index) => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      const displayValue = value.length > 0 
        ? (value.length > 30 ? value.substring(0, 30) + '...' : value)
        : '(empty)'
      
      console.log(`  ${key.trim()} = ${displayValue}`)
      
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') hasSupabaseUrl = true
      if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') hasSupabaseKey = true
    }
  } else if (trimmed.startsWith('#')) {
    console.log(`  ${trimmed}`)
  }
})

console.log('\n📊 Summary:')
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅ Found' : '❌ Missing'}`)
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅ Found' : '❌ Missing'}`)

if (!hasSupabaseUrl || !hasSupabaseKey) {
  console.log('\n⚠️  Please add the missing variables to .env.local')
  console.log('   Format: VARIABLE_NAME=value')
  console.log('   No spaces around the = sign')
  process.exit(1)
}

console.log('\n✅ All required variables found!')

