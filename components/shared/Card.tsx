import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={cn('bg-white rounded-lg shadow-md p-6', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}


