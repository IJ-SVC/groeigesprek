'use client'

import { useState } from 'react'
import { Colleague } from '@/types'
import { Card } from '@/components/shared/Card'
import { RequestModal } from './RequestModal'

interface ColleaguesListProps {
  colleagues: Colleague[]
}

export function ColleaguesList({ colleagues }: ColleaguesListProps) {
  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleColleagueClick = (colleague: Colleague) => {
    setSelectedColleague(colleague)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedColleague(null)
  }

  if (colleagues.length === 0) {
    return (
      <Card>
        <p className="text-center text-ijsselheem-donkerblauw py-8">
          Er zijn momenteel geen collega&apos;s beschikbaar voor individuele gesprekken.
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {colleagues.map((colleague) => (
          <Card
            key={colleague.id}
            className="text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleColleagueClick(colleague)}
          >
            <div className="mb-4">
              {colleague.photo_url ? (
                <img
                  src={colleague.photo_url}
                  alt={colleague.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-ijsselheem-lichtblauw"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto bg-ijsselheem-lichtblauw flex items-center justify-center border-4 border-ijsselheem-lichtblauw">
                  <svg
                    className="w-12 h-12 text-ijsselheem-donkerblauw"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-ijsselheem-donkerblauw">
              {colleague.name}
            </h3>
            {colleague.function && (
              <p className="text-sm text-ijsselheem-donkerblauw mt-1">
                {colleague.function}
              </p>
            )}
          </Card>
        ))}
      </div>

      {selectedColleague && (
        <RequestModal
          colleague={selectedColleague}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}

