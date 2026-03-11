'use client'

import { useWebSocket } from '@/hooks/use-websocket'
import { useFavorites } from '@/hooks/use-favorites'
import { useAllMarketData, useMergedMarketData } from '@/hooks/use-market-data'
import { ConnectionStatus, MarketList } from '@/components/crypto'
import { TrendingUp } from 'lucide-react'

export default function MarketsPage() {
  // Fetch initial data via REST
  const { data: restData, isLoading } = useAllMarketData()
  
  // Connect to WebSocket for real-time updates
  const { status, data: wsData } = useWebSocket()
  
  // Merge REST and WebSocket data
  const markets = useMergedMarketData(restData, wsData)
  
  // Favorites management
  const { favorites, toggleFavorite, isLoaded: favoritesLoaded } = useFavorites()
  console.log('restData : ',restData)
  console.log('wsData : ',wsData)
  console.log('markets : ',markets)
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
              <TrendingUp className="h-5 w-5 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CryptoTracker</h1>
              <p className="text-xs text-muted-foreground">Real-time market data</p>
            </div>
          </div>
          
          <ConnectionStatus status={status} />
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Markets"
            value={markets.length.toString()}
            subtext="Trading pairs"
          />
          <StatCard
            label="Gainers"
            value={markets.filter(m => m.priceChangePercent > 0).length.toString()}
            subtext="24h positive"
            variant="positive"
          />
          <StatCard
            label="Losers"
            value={markets.filter(m => m.priceChangePercent < 0).length.toString()}
            subtext="24h negative"
            variant="negative"
          />
        </div>

        {/* Market list */}
        <MarketList
          markets={markets}
          favorites={favoritesLoaded ? favorites : new Set()}
          onToggleFavorite={toggleFavorite}
          isLoading={isLoading}
        />
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  subtext,
  variant = 'default',
}: {
  label: string
  value: string
  subtext: string
  variant?: 'default' | 'positive' | 'negative'
}) {

  const variantClasses = {
    default: 'border-border',
    positive: 'border-emerald-500/30 bg-emerald-500/5',
    negative: 'border-red-500/30 bg-red-500/5',
  }

  const valueClasses = {
    default: 'text-foreground',
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className={`flex flex-col rounded-xl border bg-card p-4 ${variantClasses[variant]}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${valueClasses[variant]}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  )
}
