'use client'

import { useState, useMemo } from 'react'
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { MarketData } from '@/lib/crypto'
import { MarketCard } from './market-card'

interface MarketListProps {
  markets: MarketData[]
  favorites: Set<string>
  onToggleFavorite: (symbol: string) => void
  isLoading?: boolean
}

type SortOption = 'name' | 'price' | 'change' | 'volume'
type FilterOption = 'all' | 'favorites' | 'gainers' | 'losers'

export function MarketList({
  markets,
  favorites,
  onToggleFavorite,
  isLoading = false,
}: MarketListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('volume')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  const filteredAndSortedMarkets = useMemo(() => {
    let result = [...markets]

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        m =>
          m.symbol.toLowerCase().includes(searchLower) ||
          m.baseAsset.toLowerCase().includes(searchLower)
      )
    }

    // Filter by category
    switch (filterBy) {
      case 'favorites':
        result = result.filter(m => favorites.has(m.symbol))
        break
      case 'gainers':
        result = result.filter(m => m.priceChangePercent > 0)
        break
      case 'losers':
        result = result.filter(m => m.priceChangePercent < 0)
        break
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.baseAsset.localeCompare(b.baseAsset)
        case 'price':
          return b.price - a.price
        case 'change':
          return b.priceChangePercent - a.priceChangePercent
        case 'volume':
        default:
          return b.quoteVolume24h - a.quoteVolume24h
      }
    })

    return result
  }, [markets, search, sortBy, filterBy, favorites])

  const filterButtons: { key: FilterOption; label: string; icon?: React.ReactNode }[] = [
    { key: 'all', label: 'All' },
    { key: 'favorites', label: 'Favorites', icon: <Star className="h-3.5 w-3.5" /> },
    { key: 'gainers', label: 'Gainers', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: 'losers', label: 'Losers', icon: <TrendingDown className="h-3.5 w-3.5" /> },
  ]

  const sortButtons: { key: SortOption; label: string }[] = [
    { key: 'volume', label: 'Volume' },
    { key: 'price', label: 'Price' },
    { key: 'change', label: 'Change' },
    { key: 'name', label: 'Name' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-border bg-card animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search markets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filterButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilterBy(btn.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filterBy === btn.key
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Sort:</span>
          {sortButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setSortBy(btn.key)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                sortBy === btn.key
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Market list */}
      {filteredAndSortedMarkets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No markets found</p>
          {filterBy === 'favorites' && favorites.size === 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Click the star icon on any market to add it to favorites
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMarkets.map(market => (
            <MarketCard
              key={market.symbol}
              market={market}
              isFavorite={favorites.has(market.symbol)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
