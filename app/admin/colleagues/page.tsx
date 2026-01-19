import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { Badge } from '@/components/shared/Badge'
import { ColleaguesTable } from '@/components/admin/ColleaguesTable'

export const dynamic = 'force-dynamic'

export default async function ColleaguesPage() {
  const supabase = await createClient()

  const { data: colleagues } = await supabase
    .from('colleagues_groeigesprek')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw">
          Collega&apos;s beheer
        </h1>
        <div className="flex gap-4">
          <Link href="/admin/colleagues/nieuw">
            <Button>Nieuwe collega</Button>
          </Link>
        </div>
      </div>

      <ColleaguesTable colleagues={colleagues || []} />
    </div>
  )
}

