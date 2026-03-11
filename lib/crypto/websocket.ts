import {
  BinanceWebSocketTicker,
  ConnectionStatus,
  MarketData,
  SUPPORTED_PAIRS,
  transformWebSocketTicker,
} from './types'

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'

type TickerCallback = (data: MarketData) => void
type StatusCallback = (status: ConnectionStatus) => void

interface WebSocketManagerConfig {
  onTicker?: TickerCallback
  onStatus?: StatusCallback
  symbols?: string[]
  reconnectAttempts?: number
  reconnectDelay?: number
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts: number
  private baseReconnectDelay: number
  private reconnectTimeout: NodeJS.Timeout | null = null
  private symbols: string[]
  private onTicker: TickerCallback | null = null
  private onStatus: StatusCallback | null = null
  private isManualClose = false

  constructor(config: WebSocketManagerConfig = {}) {
    this.symbols = config.symbols || [...SUPPORTED_PAIRS]
    this.maxReconnectAttempts = config.reconnectAttempts ?? 10
    this.baseReconnectDelay = config.reconnectDelay ?? 1000
    this.onTicker = config.onTicker || null
    this.onStatus = config.onStatus || null
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isManualClose = false
    this.updateStatus('connecting')

    // Build combined stream URL for all symbols
    const streams = this.symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')
    const url = `${BINANCE_WS_URL}/${streams}`

    try {
      this.ws = new WebSocket(url)
      this.setupEventHandlers()
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.updateStatus('connected')
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle ticker updates
        if (data.e === '24hrTicker') {
          const ticker = data as BinanceWebSocketTicker
          const marketData = transformWebSocketTicker(ticker)
          this.onTicker?.(marketData)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      if (!this.isManualClose) {
        console.log('WebSocket closed:', event.code, event.reason)
        this.handleReconnect()
      } else {
        this.updateStatus('disconnected')
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.updateStatus('error')
    }
  }

  private handleReconnect(): void {
    if (this.isManualClose) return
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateStatus('error')
      console.error('Max reconnect attempts reached')
      return
    }

    this.updateStatus('reconnecting')
    this.reconnectAttempts++

    // Exponential backoff with jitter
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + Math.random() * 1000,
      30000
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private updateStatus(status: ConnectionStatus): void {
    this.onStatus?.(status)
  }

  disconnect(): void {
    this.isManualClose = true
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.updateStatus('disconnected')
  }

  // Update symbols and reconnect
  updateSymbols(symbols: string[]): void {
    this.symbols = symbols
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.disconnect()
      this.connect()
    }
  }

  getStatus(): ConnectionStatus {
    if (!this.ws) return 'disconnected'
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'disconnected'
    }
  }
}

// Singleton manager for the main ticker stream
let mainManager: WebSocketManager | null = null

export function getMainWebSocketManager(): WebSocketManager {
  if (!mainManager) {
    mainManager = new WebSocketManager()
  }
  return mainManager
}

// Create a dedicated manager for a single symbol (used in details page)
export function createSymbolWebSocketManager(
  symbol: string,
  onTicker: TickerCallback,
  onStatus?: StatusCallback
): WebSocketManager {
  return new WebSocketManager({
    symbols: [symbol],
    onTicker,
    onStatus,
  })
}
