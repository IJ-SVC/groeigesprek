import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-semibold py-2 px-4 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary'
          ? 'bg-ijsselheem-accentblauw text-ijsselheem-donkerblauw hover:opacity-90'
          : 'bg-ijsselheem-lichtblauw text-ijsselheem-donkerblauw hover:opacity-90',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}


