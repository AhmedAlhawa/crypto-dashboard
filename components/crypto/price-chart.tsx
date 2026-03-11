'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { PricePoint } from '@/lib/crypto'
import { formatPrice } from './price-display'

interface PriceChartProps {
  data: PricePoint[]
  isLoading?: boolean
  onIntervalChange?: (interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d') => void
  currentInterval?: string
}

const intervals = [
  { key: '1m', label: '1m' },
  { key: '5m', label: '5m' },
  { key: '15m', label: '15m' },
  { key: '1h', label: '1H' },
  { key: '4h', label: '4H' },
  { key: '1d', label: '1D' },
] as const

export function PriceChart({
  data,
  isLoading = false,
  onIntervalChange,
  currentInterval = '1h',
}: PriceChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area')

  // Determine if price is going up or down overall
  const isPositive = data.length >= 2 && data[data.length - 1].close >= data[0].close

  // Format data for chart
  const chartData = data.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    price: point.close,
    volume: point.volume,
  }))

  // Calculate min/max for Y axis domain with padding
  const prices = data.map(p => p.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.1
  const yDomain = [minPrice - padding, maxPrice + padding]

  if (isLoading) {
    return (
      <div className="h-80 w-full animate-pulse rounded-xl bg-muted" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    )
  }

  const strokeColor = isPositive ? '#10b981' : '#ef4444'
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Interval selector */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {intervals.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onIntervalChange?.(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentInterval === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chart type toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setChartType('area')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              chartType === 'area'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              chartType === 'line'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full rounded-xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={val => `$${formatPrice(val)}`}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={val => `$${formatPrice(val)}`}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
