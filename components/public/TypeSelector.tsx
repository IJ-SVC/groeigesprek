import Link from 'next/link'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export function TypeSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ijsselheem-lichtblauw to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-ijsselheem-donkerblauw mb-4 text-center">
            Groeigesprekken
          </h1>
          <p className="text-lg text-ijsselheem-donkerblauw mb-12 text-center">
            Kies het type gesprek waarvoor je je wilt aanmelden
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/groepsontwikkelgesprek" className="group">
              <Card className="text-center h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-ijsselheem-accentblauw">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-ijsselheem-accentblauw flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-ijsselheem-donkerblauw" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
                  Groepsontwikkelgesprek
                </h2>
                <p className="text-ijsselheem-donkerblauw mb-6 flex-grow">
                  Meld je aan voor een groepsontwikkelgesprek
                </p>
                <Button className="w-full bg-ijsselheem-accentblauw hover:bg-ijsselheem-middenblauw transition-colors">
                  Kies Groepsontwikkelgesprek
                </Button>
              </Card>
            </Link>

            <Link href="/inloopgesprek" className="group">
              <Card className="text-center h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-ijsselheem-olijfgroen">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-ijsselheem-olijfgroen flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
                  Inloopgesprek
                </h2>
                <p className="text-ijsselheem-donkerblauw mb-6 flex-grow">
                  Meld je aan voor een inloopgesprek
                </p>
                <Button className="w-full bg-ijsselheem-olijfgroen text-white hover:bg-ijsselheem-donkerblauw transition-colors">
                  Kies Inloopgesprek
                </Button>
              </Card>
            </Link>

            <Link href="/individueel-gesprek" className="group">
              <Card className="text-center h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-ijsselheem-middenblauw">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-ijsselheem-middenblauw flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-ijsselheem-donkerblauw mb-4">
                  Individueel gesprek
                </h2>
                <p className="text-ijsselheem-donkerblauw mb-6 flex-grow">
                  Vraag een individueel ontwikkelgesprek aan met een collega
                </p>
                <Button className="w-full bg-ijsselheem-middenblauw text-white hover:bg-ijsselheem-donkerblauw transition-colors">
                  Kies Individueel gesprek
                </Button>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


