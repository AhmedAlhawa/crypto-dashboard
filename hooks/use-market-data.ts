'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { fetchAllTickers, fetchTicker, fetchKlines, MarketData, PricePoint } from '@/lib/crypto'

// SWR fetcher functions
const allTickersFetcher = () => fetchAllTickers()

const tickerFetcher = (symbol: string) => fetchTicker(symbol)
const klinesFetcher = ([symbol, interval, limit]: [string, string, number]) => 
  fetchKlines(symbol, interval as '1m' | '5m' | '15m' | '1h' | '4h' | '1d', limit)

// Hook for fetching all market tickers with SWR
export function useAllMarketData() {
  const { data, error, isLoading, mutate } = useSWR<MarketData[]>(
    'all-tickers',
    allTickersFetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds as fallback
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  return {
    data: data ?? [],
    error,
    isLoading,
    refresh: mutate,
  }
}

// Hook for fetching a single market ticker
export function useMarketTicker(symbol: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MarketData>(
    symbol ? `ticker-${symbol}` : null,
    () => (symbol ? tickerFetcher(symbol) : Promise.reject('No symbol')),
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  )

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}

// Hook for fetching price history (klines)
export function usePriceHistory(
  symbol: string | null,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h',
  limit: number = 100
) {
  const { data, error, isLoading, mutate } = useSWR<PricePoint[]>(
    symbol ? ['klines', symbol, interval, limit] : null,
    () => (symbol ? klinesFetcher([symbol, interval, limit]) : Promise.reject('No symbol')),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  return {
    data: data ?? [],
    error,
    isLoading,
    refresh: mutate,
  }
}

// Combined hook that merges REST data with WebSocket updates
export function useMergedMarketData(
  restData: MarketData[],
  wsData: Map<string, MarketData>
): MarketData[] {
  const [mergedData, setMergedData] = useState<MarketData[]>([])

  useEffect(() => {
    if (restData.length === 0) {
      setMergedData([])
      return
    }

    const merged = restData.map(item => {
      const wsUpdate = wsData.get(item.symbol)
      // Use WebSocket data if available and newer
      if (wsUpdate && wsUpdate.lastUpdated > item.lastUpdated) {
        return wsUpdate
      }
      return item
    })

    setMergedData(merged)
  }, [restData, wsData])

  return mergedData
}
