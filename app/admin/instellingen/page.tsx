import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { HeadersForm } from '@/components/admin/HeadersForm'

export const dynamic = 'force-dynamic'

export default async function InstellingenPage() {
  const supabase = await createClient()

  const { data: headers } = await supabase
    .from('headers_groeigesprek')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: settings } = await supabase
    .from('settings_groeigesprek')
    .select('*')

  const settingsMap = (settings || []).reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw">
        Instellingen
      </h1>

      <Card>
        <h2 className="text-2xl font-semibold text-ijsselheem-donkerblauw mb-6">
          Header Content
        </h2>
        <HeadersForm headers={headers || []} />
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold text-ijsselheem-donkerblauw mb-6">
          Algemene Instellingen
        </h2>
        <SettingsForm settings={settingsMap} />
      </Card>
    </div>
  )
}


