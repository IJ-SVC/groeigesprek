import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { SessionForm } from '@/components/admin/SessionForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BewerkSessiePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions_groeigesprek')
    .select(`
      *,
      conversation_type:conversation_types(*)
    `)
    .eq('id', id)
    .single()

  if (!session) {
    notFound()
  }

  const { data: conversationTypes } = await supabase
    .from('conversation_types')
    .select('*')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
        Sessie bewerken
      </h1>
      <Card>
        <SessionForm conversationTypes={conversationTypes || []} session={session} />
      </Card>
    </div>
  )
}


