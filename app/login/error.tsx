'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              Error in Login Pagina
            </h1>
            <p className="text-red-700 mb-2">
              Er is een fout opgetreden:
            </p>
            <p className="text-sm text-red-600 mb-4 font-mono bg-red-100 p-2 rounded">
              {error.message}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-ijsselheem-accentblauw text-ijsselheem-donkerblauw rounded-lg font-semibold hover:opacity-90"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

