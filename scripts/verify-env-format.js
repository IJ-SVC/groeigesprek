// Script om de format van .env bestanden te verifiëren
const fs = require('fs')
const path = require('path')

console.log('📋 Verifying .env file format...\n')

const envFiles = ['.env', '.env.local']
let foundAny = false

envFiles.forEach(fileName => {
  const filePath = path.join(__dirname, '..', fileName)
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${fileName} exists`)
    foundAny = true
    
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    let hasSupabaseUrl = false
    let hasSupabaseKey = false
    let hasServiceKey = false
    let issues = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        return
      }
      
      // Check for = sign
      if (!trimmed.includes('=')) {
        issues.push(`Line ${index + 1}: Missing = sign`)
        return
      }
      
      const [key, ...valueParts] = trimmed.split('=')
      const keyTrimmed = key.trim()
      const value = valueParts.join('=').trim()
      
      // Check for spaces around =
      if (key !== keyTrimmed || (valueParts[0] && valueParts[0].startsWith(' '))) {
        issues.push(`Line ${index + 1}: Has spaces around = sign`)
      }
      
      // Check for required variables
      if (keyTrimmed === 'NEXT_PUBLIC_SUPABASE_URL') {
        hasSupabaseUrl = true
        if (!value || value.length === 0) {
          issues.push(`Line ${index + 1}: NEXT_PUBLIC_SUPABASE_URL has empty value`)
        } else if (!value.startsWith('https://')) {
          issues.push(`Line ${index + 1}: NEXT_PUBLIC_SUPABASE_URL should start with https://`)
        }
      }
      
      if (keyTrimmed === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        hasSupabaseKey = true
        if (!value || value.length === 0) {
          issues.push(`Line ${index + 1}: NEXT_PUBLIC_SUPABASE_ANON_KEY has empty value`)
        } else if (value.length < 100) {
          issues.push(`Line ${index + 1}: NEXT_PUBLIC_SUPABASE_ANON_KEY seems too short (${value.length} chars, expected ~200+)`)
        }
      }
      
      if (keyTrimmed === 'SUPABASE_SERVICE_ROLE_KEY') {
        hasServiceKey = true
        if (!value || value.length === 0) {
          issues.push(`Line ${index + 1}: SUPABASE_SERVICE_ROLE_KEY has empty value`)
        }
      }
    })
    
    console.log(`\n  Variables found:`)
    console.log(`    NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅' : '❌'}`)
    console.log(`    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅' : '❌'}`)
    console.log(`    SUPABASE_SERVICE_ROLE_KEY: ${hasServiceKey ? '✅' : '❌'}`)
    
    if (issues.length > 0) {
      console.log(`\n  ⚠️  Issues found:`)
      issues.forEach(issue => console.log(`    - ${issue}`))
    } else if (hasSupabaseUrl && hasSupabaseKey) {
      console.log(`\n  ✅ Format looks correct!`)
    }
    
    console.log('')
  } else {
    console.log(`❌ ${fileName} not found`)
  }
})

if (!foundAny) {
  console.log('\n❌ No .env files found!')
  console.log('   Please create .env.local with your Supabase credentials.')
  process.exit(1)
}

