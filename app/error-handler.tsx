'use client'

import { useEffect } from 'react'

export function ErrorHandler() {
  useEffect(() => {
    // Suppress common browser extension errors that are harmless
    const originalError = console.error
    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || ''
      
      // Ignore common browser extension errors
      if (
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('asynchronous response') ||
        errorMessage.includes('Extension context invalidated')
      ) {
        // Silently ignore these errors - they're from browser extensions
        return
      }
      
      // Log all other errors normally
      originalError.apply(console, args)
    }

    // Also catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorMessage = event.reason?.toString() || ''
      
      if (
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('asynchronous response') ||
        errorMessage.includes('Extension context invalidated')
      ) {
        // Prevent these errors from showing in console
        event.preventDefault()
        return
      }
    })

    return () => {
      console.error = originalError
    }
  }, [])

  return null
}

