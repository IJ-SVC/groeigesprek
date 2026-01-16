export default function AdminTestPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
        Admin Test Pagina
      </h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-800 mb-4">
          ✅ Admin Layout werkt!
        </h2>
        <p className="text-green-700">
          Als je deze pagina ziet, betekent dit dat:
        </p>
        <ul className="list-disc list-inside text-green-700 space-y-1 mt-2">
          <li>Je succesvol bent ingelogd als admin</li>
          <li>De admin layout correct werkt</li>
          <li>De navigatie zichtbaar is</li>
        </ul>
      </div>
    </div>
  )
}

