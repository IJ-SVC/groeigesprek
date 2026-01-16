import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { SessionForm } from '@/components/admin/SessionForm'

export const dynamic = 'force-dynamic'

export default async function NieuweSessiePage() {
  const supabase = await createClient()

  const { data: conversationTypes } = await supabase
    .from('conversation_types')
    .select('*')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
        Nieuwe sessie aanmaken
      </h1>
      <Card>
        <SessionForm conversationTypes={conversationTypes || []} />
      </Card>
    </div>
  )
}


