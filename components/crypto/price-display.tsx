'use client'

import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface PriceDisplayProps {
  price: number
  priceChange?: number
  priceChangePercent?: number
  size?: 'sm' | 'md' | 'lg'
  showChange?: boolean
}

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } else if (price >= 1) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  } else {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    })
  }
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`
  }
  return volume.toFixed(2)
}

export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

const sizeClasses = {
  sm: {
    price: 'text-sm font-medium',
    change: 'text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    price: 'text-lg font-semibold',
    change: 'text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    price: 'text-3xl font-bold tracking-tight',
    change: 'text-base',
    icon: 'h-5 w-5',
  },
}

export function PriceDisplay({
  price,
  priceChange = 0,
  priceChangePercent = 0,
  size = 'md',
  showChange = true,
}: PriceDisplayProps) {
  const isPositive = priceChangePercent >= 0
  const classes = sizeClasses[size]

  return (
    <div className="flex flex-col">
      <span className={`${classes.price} text-foreground`}>
        ${formatPrice(price)}
      </span>
      {showChange && (
        <div
          className={`flex items-center gap-1 ${classes.change} ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive ? (
            <ArrowUpIcon className={classes.icon} />
          ) : (
            <ArrowDownIcon className={classes.icon} />
          )}
          <span>{formatPercent(priceChangePercent)}</span>
        </div>
      )}
    </div>
  )
}
