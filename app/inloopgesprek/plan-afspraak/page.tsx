import { createClient } from '@/lib/supabase/server'
import { ColleaguesList } from '@/components/public/ColleaguesList'
import { Card } from '@/components/shared/Card'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'

export const dynamic = 'force-dynamic'

export default async function PlanAfspraakPage() {
  const supabase = await createClient()

  // Get colleagues available for spelwerkvorm (individual request - plan zelf een afspraak)
  const { data: colleagues } = await supabase
    .from('colleagues_groeigesprek')
    .select('*')
    .eq('is_active', true)
    .eq('available_for_spelwerkvorm', true)
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/inloopgesprek">
              <Button variant="secondary">← Terug</Button>
            </Link>
          </div>

          <Card className="mb-8">
            <h1 className="text-4xl font-extrabold text-ijsselheem-donkerblauw mb-4">
              Plan zelf een afspraak
            </h1>
            <p className="text-lg text-ijsselheem-donkerblauw">
              Kies een collega om een ontwikkelgesprek – spelwerkvorm (individueel) aan te vragen. Na het invullen van je gegevens opent Outlook met een vooringevulde e-mail; verstuur de e-mail om je aanvraag te voltooien.
            </p>
          </Card>

          <ColleaguesList colleagues={colleagues || []} mailtoOnly />
        </div>
      </div>
    </div>
  )
}
