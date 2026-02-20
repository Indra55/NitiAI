"use client"

import { useEffect, useState } from "react"

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ProgressRing({ percentage, size = 120, strokeWidth = 8, label }: ProgressRingProps) {
  const [offset, setOffset] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (percentage / 100) * circumference

  useEffect(() => {
    setOffset(strokeOffset)
  }, [percentage, strokeOffset])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--color-border))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--color-primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          className="text-xl font-bold fill-foreground"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {percentage}%
        </text>
      </svg>
      {label && <p className="text-sm font-medium text-muted-foreground text-center">{label}</p>}
    </div>
  )
}
