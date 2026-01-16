import { TypeSelector } from '@/components/public/TypeSelector'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/shared/Card'
import { AdminButton } from '@/components/public/AdminButton'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get active header
  const { data: header } = await supabase
    .from('headers_groeigesprek')
    .select('*')
    .eq('is_active', true)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <AdminButton />
      <div className="container mx-auto px-4 py-8 pt-16">
        {header && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card>
              <h1 className="text-4xl font-extrabold text-ijsselheem-donkerblauw mb-4">
                {header.title}
              </h1>
              <p className="text-lg text-ijsselheem-donkerblauw whitespace-pre-line">
                {header.subtitle}
              </p>
            </Card>
          </div>
        )}
        <TypeSelector />
      </div>
    </div>
  )
}


