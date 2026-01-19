import { Card } from '@/components/shared/Card'
import { ColleagueForm } from '@/components/admin/ColleagueForm'

export const dynamic = 'force-dynamic'

export default async function NieuweColleaguePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-ijsselheem-donkerblauw mb-8">
        Nieuwe collega aanmaken
      </h1>
      <Card>
        <ColleagueForm />
      </Card>
    </div>
  )
}

