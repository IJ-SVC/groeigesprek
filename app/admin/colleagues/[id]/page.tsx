import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { ColleagueForm } from '@/components/admin/ColleagueForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditColleaguePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: colleague } = await supabase
    .from('colleagues_groeigesprek')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!colleague) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
        Collega bewerken
      </h1>
      <Card>
        <ColleagueForm colleague={colleague} />
      </Card>
    </div>
  )
}

