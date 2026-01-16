'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('Attempting login with email:', email)
      const supabase = createClient()
      
      if (!supabase) {
        setError('Kan Supabase client niet initialiseren. Check je environment variabelen.')
        setIsLoading(false)
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log('Sign in response:', { 
        hasUser: !!data?.user, 
        userEmail: data?.user?.email,
        error: signInError?.message 
      })

      if (signInError) {
        console.error('Sign in error details:', signInError)
        let errorMsg = signInError.message
        
        // Provide more helpful error messages
        if (signInError.message.includes('Invalid login credentials')) {
          errorMsg = 'Ongeldige inloggegevens. Check of je email en wachtwoord correct zijn.'
        } else if (signInError.message.includes('Email not confirmed')) {
          errorMsg = 'Email niet bevestigd. Zet "Auto Confirm User" aan in Supabase.'
        }
        
        setError(`Login fout: ${errorMsg}`)
        setIsLoading(false)
        return
      }

      // User is logged in, redirect to admin panel
      if (data.user) {
        console.log('User logged in successfully:', data.user.email)
        console.log('Redirecting to /admin')
      }

      // Force a hard refresh to ensure session is loaded
      window.location.href = '/admin'
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMessage = err?.message || 'Er is een fout opgetreden. Probeer het opnieuw.'
      setError(`Error: ${errorMessage}. Check de browser console (F12) voor meer details.`)
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white flex items-center justify-center">
        <div className="text-ijsselheem-donkerblauw">Laden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-ijsselheem-donkerblauw mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-sm text-ijsselheem-donkerblauw mb-6 text-center">
            Log in met je Supabase admin account
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
                E-mailadres
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ijsselheem-accentblauw"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ijsselheem-donkerblauw mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ijsselheem-accentblauw"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-ijsselheem-accentblauw text-ijsselheem-donkerblauw font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Bezig...' : 'Inloggen'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-ijsselheem-donkerblauw mb-2">
              <strong>Nog geen admin account?</strong>
            </p>
            <ol className="text-xs text-ijsselheem-donkerblauw space-y-1 list-decimal list-inside">
              <li>Ga naar Supabase Dashboard → Authentication → Users</li>
              <li>Klik op &quot;Add user&quot; → &quot;Create new user&quot;</li>
              <li>Vul email en wachtwoord in, zet &quot;Auto Confirm User&quot; aan</li>
              <li>Klik op &quot;Create user&quot;</li>
              <li>Log hier in met die gegevens</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}


