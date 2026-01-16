import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { RegistrationTable } from '@/components/admin/RegistrationTable'

export const dynamic = 'force-dynamic'

export default async function AanmeldingenPage() {
  const supabase = await createClient()

  const { data: registrations } = await supabase
    .from('registrations_groeigesprek')
    .select(`
      *,
      session:sessions_groeigesprek(
        *,
        conversation_type:conversation_types(*)
      )
    `)
    .order('created_at', { ascending: false })

  const { data: sessions } = await supabase
    .from('sessions_groeigesprek')
    .select(`
      *,
      conversation_type:conversation_types(*)
    `)
    .order('date', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw">
          Aanmeldingen
        </h1>
        <div className="flex gap-4">
          <a href="/api/admin/export?format=excel" download>
            <Button>Exporteer naar Excel</Button>
          </a>
          <a href="/api/admin/export?format=csv" download>
            <Button variant="secondary">Exporteer naar CSV</Button>
          </a>
        </div>
      </div>

      <RegistrationTable
        registrations={registrations || []}
        sessions={sessions || []}
      />
    </div>
  )
}


