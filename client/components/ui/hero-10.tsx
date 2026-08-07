'use client'

import * as React from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import Balancer from 'react-wrap-balancer'

import { cn } from '@/lib/utils'

import { Cta, type CtaProps } from '@/components/ui/hero-10-utils/cta'

export interface FeatureCard {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface Hero10Props {
  title: string
  titleLine2Prefix?: string
  titleHighlight?: string
  description: string
  socialProof?: string
  features: FeatureCard[]
  animation?: 'none' | 'subtle'
  primaryCTA: CtaProps
  secondaryCTA?: CtaProps
  variant?: 'standard' | 'compact'
}

const variantStyles = {
  standard: {
    section: 'py-20 sm:py-28',
    title: 'text-4xl sm:text-5xl md:text-6xl',
    description: 'max-w-lg text-sm sm:text-base',
    header: 'gap-5',
    content: 'gap-8 sm:gap-10',
    fan: 'max-w-4xl',
    fanCard: 'aspect-square sm:aspect-4/5',
  },
  compact: {
    section: 'py-14 sm:py-20',
    title: 'text-2xl sm:text-3xl md:text-4xl',
    description: 'max-w-md text-sm',
    header: 'gap-4',
    content: 'gap-6 sm:gap-8',
    fan: 'max-w-3xl',
    fanCard: 'aspect-square sm:aspect-4/5',
  },
} as const

const fanSlots = [
  { width: 'w-[25%]', layout: '-mr-10 sm:-mr-16 z-0', rotate: -12, x: 80, ty: 48 },
  { width: 'w-[30%]', layout: '-mr-8 sm:-mr-12 z-10', rotate: -6, x: 40, ty: 24 },
  { width: 'w-[35%]', layout: 'z-20', rotate: 0, x: 0, ty: -8 },
  { width: 'w-[30%]', layout: '-ml-8 sm:-ml-12 z-10', rotate: 6, x: -40, ty: 24 },
  { width: 'w-[25%]', layout: '-ml-10 sm:-ml-16 z-0', rotate: 12, x: -80, ty: 48 },
]

const fanContainer: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.4,
      delayChildren: 0.5,
      staggerChildren: 0.1,
    },
  },
}

const fanCard: Variants = {
  hidden: (slot: (typeof fanSlots)[number]) => ({
    x: slot.x,
    rotate: slot.rotate,
    y: slot.ty,
  }),
  visible: (slot: (typeof fanSlots)[number]) => ({
    x: 0,
    rotate: slot.rotate,
    y: slot.ty,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function Reveal({
  active,
  variants,
  className,
  children,
}: Readonly<{
  active: boolean
  variants?: Variants
  className?: string
  children: React.ReactNode
}>) {
  if (!active) return <div className={className}>{children}</div>

  return (
    <motion.div variants={variants ?? item} className={className}>
      {children}
    </motion.div>
  )
}

function FeatureFan({
  features,
  cardAspect,
  animate,
}: Readonly<{
  features: FeatureCard[]
  cardAspect: string
  animate: boolean
}>) {
  return (
    <motion.div
      className="relative flex w-full items-center justify-center"
      variants={fanContainer}
      initial={animate ? 'hidden' : false}
      whileInView={animate ? 'visible' : undefined}
      animate={animate ? undefined : 'visible'}
      viewport={{ once: true, margin: '-80px' }}
    >
      {features.slice(0, 5).map((feature, i) => {
        const slot = fanSlots[i] ?? fanSlots[2]
        return (
          <motion.div
            key={feature.title}
            custom={slot}
            variants={fanCard}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-xl shadow-2xl outline outline-black/5 bg-[#eeeeee] p-4 sm:p-6 flex flex-col justify-center items-center text-center group hover:z-50 hover:scale-105 transition-all duration-300 cursor-default',
              cardAspect,
              slot.width,
              slot.layout,
            )}
          >
            <div className="text-3xl sm:text-5xl mb-2 sm:mb-4 opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform duration-300">{feature.icon}</div>
            <h3 className="font-semibold text-sm sm:text-xl text-gray-900 mb-1 sm:mb-2 leading-tight">{feature.title}</h3>
            <p className="text-[10px] sm:text-sm text-gray-600 leading-relaxed hidden sm:block">{feature.description}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function Hero10({
  title,
  titleLine2Prefix,
  titleHighlight,
  description,
  socialProof,
  features,
  animation = 'none',
  primaryCTA,
  secondaryCTA,
  variant = 'standard',
}: Readonly<Hero10Props>) {
  const reduce = useReducedMotion()
  const animate = animation === 'subtle' && !reduce
  const vs = variantStyles[variant]

  const titleElement = title && (
    <h1
      className={cn(
        'text-foreground font-sans font-normal tracking-tight text-balance',
        vs.title,
      )}
    >
      <Balancer>{title}</Balancer>
      {(titleLine2Prefix || titleHighlight) && (
        <>
          <br />
          <Balancer>
            {titleLine2Prefix && <span>{titleLine2Prefix} </span>}
            {titleHighlight && (
              <span className="text-orange-500">{titleHighlight}</span>
            )}
          </Balancer>
        </>
      )}
    </h1>
  )

  const descriptionElement = description && (
    <p className={cn('text-foreground/70', vs.description)}>
      <Balancer>{description}</Balancer>
    </p>
  )

  const ctasElement = (primaryCTA?.ctaEnabled || secondaryCTA?.ctaEnabled) && (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
      {primaryCTA?.ctaEnabled && <Cta cta={primaryCTA} />}
      {secondaryCTA?.ctaEnabled && (
        <Cta
          cta={{ ...secondaryCTA, variant: secondaryCTA.variant ?? 'outline' }}
        />
      )}
    </div>
  )

  const socialProofElement = socialProof && (
    <p className="text-foreground/50 text-xs font-medium">{socialProof}</p>
  )

  const mediaElement = features?.length ? (
    <FeatureFan
      features={features}
      cardAspect={vs.fanCard}
      animate={animate}
    />
  ) : null

  return (
    <section className="bg-transparent relative isolate w-full overflow-hidden">
      <motion.div
        className={cn(
          'relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center',
          vs.section,
          vs.content,
        )}
        variants={animate ? container : undefined}
        initial={animate ? 'hidden' : false}
        whileInView={animate ? 'visible' : undefined}
        viewport={{ once: true, margin: '-80px' }}
      >
        <Reveal
          active={animate}
          className={cn(
            'flex w-full max-w-3xl flex-col items-center',
            vs.header,
          )}
        >
          {titleElement}
          {descriptionElement}
        </Reveal>

        <Reveal active={animate} className="flex flex-col items-center gap-4">
          {ctasElement}
          {socialProofElement}
        </Reveal>

        <div className={cn('mx-auto w-full mt-10', vs.fan)}>{mediaElement}</div>
      </motion.div>
    </section>
  )
}

export default Hero10;
