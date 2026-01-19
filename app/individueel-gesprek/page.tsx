import { createClient } from '@/lib/supabase/server'
import { ColleaguesList } from '@/components/public/ColleaguesList'
import { Card } from '@/components/shared/Card'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'

export const dynamic = 'force-dynamic'

export default async function IndividueelGesprekPage() {
  const supabase = await createClient()

  // Get active colleagues
  const { data: colleagues } = await supabase
    .from('colleagues_groeigesprek')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="secondary">← Terug</Button>
            </Link>
          </div>

          <Card className="mb-8">
            <h1 className="text-4xl font-extrabold text-ijsselheem-donkerblauw mb-4">
              Individueel gesprek
            </h1>
            <p className="text-lg text-ijsselheem-donkerblauw">
              Kies een collega om een ontwikkelgesprek aan te vragen
            </p>
          </Card>

          <ColleaguesList colleagues={colleagues || []} />
        </div>
      </div>
    </div>
  )
}

