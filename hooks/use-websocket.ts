'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  WebSocketManager,
  ConnectionStatus,
  MarketData,
  SUPPORTED_PAIRS,
} from '@/lib/crypto'

interface UseWebSocketOptions {
  symbols?: string[]
  enabled?: boolean
}

interface UseWebSocketReturn {
  status: ConnectionStatus
  data: Map<string, MarketData>
  connect: () => void
  disconnect: () => void
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { symbols = [...SUPPORTED_PAIRS], enabled = true } = options
  
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [data, setData] = useState<Map<string, MarketData>>(new Map())
  const managerRef = useRef<WebSocketManager | null>(null)

  const handleTicker = useCallback((ticker: MarketData) => {
    setData(prev => {
      const next = new Map(prev)
      next.set(ticker.symbol, ticker)
      return next
    })
  }, [])

  const handleStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus)
  }, [])

  const connect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const manager = new WebSocketManager({
      symbols,
      onTicker: handleTicker,
      onStatus: handleStatus,
    })

    managerRef.current = manager
    manager.connect()

    return () => {
      manager.disconnect()
      managerRef.current = null
    }
  }, [enabled, symbols.join(','), handleTicker, handleStatus])

  return { status, data, connect, disconnect }
}

// Hook for a single symbol - used in details page
export function useSymbolWebSocket(symbol: string | null): {
  status: ConnectionStatus
  data: MarketData | null
} {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [data, setData] = useState<MarketData | null>(null)
  const managerRef = useRef<WebSocketManager | null>(null)

  useEffect(() => {
    if (!symbol) return

    const manager = new WebSocketManager({
      symbols: [symbol],
      onTicker: (ticker) => setData(ticker),
      onStatus: (newStatus) => setStatus(newStatus),
    })

    managerRef.current = manager
    manager.connect()

    return () => {
      manager.disconnect()
      managerRef.current = null
    }
  }, [symbol])

  return { status, data }
}
