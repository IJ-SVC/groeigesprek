import Link from 'next/link'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export function TypeSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold text-ijsselheem-donkerblauw mb-4 text-center">
            Groeigesprekken
          </h1>
          <p className="text-lg text-ijsselheem-donkerblauw mb-12 text-center">
            Kies het type gesprek waarvoor je je wilt aanmelden
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
                Groepsontwikkelgesprek
              </h2>
              <p className="text-ijsselheem-donkerblauw mb-6">
                Meld je aan voor een groepsontwikkelgesprek
              </p>
              <Link href="/groepsontwikkelgesprek">
                <Button className="w-full">Kies Groepsontwikkelgesprek</Button>
              </Link>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
                Inloopgesprek
              </h2>
              <p className="text-ijsselheem-donkerblauw mb-6">
                Meld je aan voor een inloopgesprek
              </p>
              <Link href="/inloopgesprek">
                <Button className="w-full">Kies Inloopgesprek</Button>
              </Link>
            </Card>
          </div>

          <Card className="bg-ijsselheem-pastelgroen border-l-4 border-ijsselheem-olijfgroen">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-ijsselheem-olijfgroen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-ijsselheem-donkerblauw">
                  Individueel gesprek
                </h3>
                <p className="mt-1 text-sm text-ijsselheem-donkerblauw">
                  Voor individuele groeigesprekken kun je je aanmelden via Mijn IJsselheem.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


