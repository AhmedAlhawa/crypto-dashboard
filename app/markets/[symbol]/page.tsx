'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { useSymbolWebSocket } from '@/hooks/use-websocket'
import { useFavorites } from '@/hooks/use-favorites'
import { useMarketTicker, usePriceHistory } from '@/hooks/use-market-data'
import { parseSymbol } from '@/lib/crypto'
import {
  ConnectionStatus,
  PriceDisplay,
  PriceChart,
  formatPrice,
  formatVolume,
  formatPercent,
} from '@/components/crypto'

interface PageProps {
  params: Promise<{ symbol: string }>
}

export default function MarketDetailsPage({ params }: PageProps) {
  const { symbol } = use(params)
  const [interval, setInterval] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h')

  // Fetch initial data via REST
  const { data: restData, isLoading: tickerLoading } = useMarketTicker(symbol)
  
  // Connect to WebSocket for real-time updates
  const { status, data: wsData } = useSymbolWebSocket(symbol)
  
  // Get price history for chart
  const { data: priceHistory, isLoading: chartLoading } = usePriceHistory(symbol, interval, 100)
  
  // Favorites management
  const { isFavorite, toggleFavorite } = useFavorites()

  // Merge REST and WebSocket data - prefer WebSocket if newer
  const marketData = wsData && restData && wsData.lastUpdated > restData.lastUpdated 
    ? wsData 
    : restData

  const { base, quote } = parseSymbol(symbol)

  if (tickerLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="h-12 w-48 rounded bg-muted" />
            <div className="h-80 rounded-xl bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (!marketData) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to markets
          </Link>
          <div className="mt-12 text-center">
            <h1 className="text-2xl font-bold text-foreground">Market not found</h1>
            <p className="mt-2 text-muted-foreground">
              The trading pair {symbol} could not be found.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const isPositive = marketData.priceChangePercent >= 0

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to markets
        </Link>

        {/* Header */}
        <div className="mt-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Crypto icon */}
            <CryptoIcon symbol={base} size={56} />
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {base}
                  <span className="text-muted-foreground">/{quote}</span>
                </h1>
                <button
                  onClick={() => toggleFavorite(symbol)}
                  className="rounded-full p-1.5 transition-colors hover:bg-muted"
                  aria-label={isFavorite(symbol) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star
                    className={`h-5 w-5 ${
                      isFavorite(symbol)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              </div>
              <ConnectionStatus status={status} />
            </div>
          </div>
        </div>

        {/* Price display */}
        <div className="mt-8">
          <PriceDisplay
            price={marketData.price}
            priceChange={marketData.priceChange}
            priceChangePercent={marketData.priceChangePercent}
            size="lg"
          />
        </div>

        {/* Chart */}
        <div className="mt-8">
          <PriceChart
            data={priceHistory}
            isLoading={chartLoading}
            currentInterval={interval}
            onIntervalChange={setInterval}
          />
        </div>

        {/* Stats grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem
            label="24h High"
            value={`$${formatPrice(marketData.high24h)}`}
          />
          <StatItem
            label="24h Low"
            value={`$${formatPrice(marketData.low24h)}`}
          />
          <StatItem
            label="24h Volume"
            value={`${formatVolume(marketData.volume24h)} ${base}`}
          />
          <StatItem
            label="24h Quote Volume"
            value={`$${formatVolume(marketData.quoteVolume24h)}`}
          />
        </div>

        {/* Additional info */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Market Overview</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Price Change (24h)</p>
              <p className={`mt-1 text-lg font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? '+' : ''}{formatPrice(marketData.priceChange)} {quote}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Percent Change (24h)</p>
              <div className={`mt-1 flex items-center gap-1 text-lg font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
                {formatPercent(marketData.priceChangePercent)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CryptoIcon({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const colors: Record<string, string> = {
    BTC: 'bg-amber-500',
    ETH: 'bg-indigo-500',
    BNB: 'bg-yellow-500',
    XRP: 'bg-slate-700',
    ADA: 'bg-blue-600',
    DOGE: 'bg-amber-400',
    SOL: 'bg-gradient-to-br from-purple-500 to-teal-400',
    DOT: 'bg-pink-600',
    MATIC: 'bg-purple-600',
    LTC: 'bg-slate-500',
    AVAX: 'bg-red-500',
    LINK: 'bg-blue-500',
  }

  const bgColor = colors[symbol] || 'bg-muted'

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold ${bgColor}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {symbol.slice(0, 2)}
    </div>
  )
}
