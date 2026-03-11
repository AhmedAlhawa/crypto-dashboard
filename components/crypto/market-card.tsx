'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { MarketData } from '@/lib/crypto'
import { PriceDisplay, formatVolume } from './price-display'

interface MarketCardProps {
  market: MarketData
  isFavorite: boolean
  onToggleFavorite: (symbol: string) => void
}

// Crypto icon mapping using simple colored circles with initials
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

export function MarketCard({ market, isFavorite, onToggleFavorite }: MarketCardProps) {
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite(market.symbol)
  }

  return (
    <Link
      href={`/markets/${market.symbol}`}
      className="group block"
    >
      <div className="relative flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-lg">
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute right-3 top-2 rounded-full p-1.5 transition-colors hover:bg-muted"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`h-4 w-4 ${
              isFavorite
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground group-hover:text-foreground'
            }`}
          />
        </button>

        {/* Crypto icon */}
        <CryptoIcon symbol={market.baseAsset} />

        {/* Symbol and name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{market.baseAsset}</h3>
            <span className="text-xs text-muted-foreground">/{market.quoteAsset}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            Vol: {formatVolume(market.volume24h)} {market.baseAsset}
          </p>
        </div>

        {/* Price */}
        <div className="text-right">
          <PriceDisplay
            price={market.price}
            priceChangePercent={market.priceChangePercent}
            size="sm"
          />
        </div>
      </div>
    </Link>
  )
}
