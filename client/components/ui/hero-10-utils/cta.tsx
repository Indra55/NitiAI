import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface CtaProps {
  ctaEnabled: boolean
  text: string
  link: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Cta({ cta }: { cta: CtaProps }) {
  if (!cta.ctaEnabled) return null
  return (
    <Button asChild variant={cta.variant} size={cta.size}>
      <Link href={cta.link || '#'}>{cta.text}</Link>
    </Button>
  )
}
