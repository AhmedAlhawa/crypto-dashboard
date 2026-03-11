// Binance REST API response types
export interface BinanceTickerResponse {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  bidQty: string
  askPrice: string
  askQty: string
  openPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
}

// Binance WebSocket ticker stream
export interface BinanceWebSocketTicker {
  e: string // Event type
  E: number // Event time
  s: string // Symbol
  p: string // Price change
  P: string // Price change percent
  w: string // Weighted average price
  x: string // Previous close price
  c: string // Current close price (last price)
  Q: string // Close quantity
  b: string // Best bid price
  B: string // Best bid quantity
  a: string // Best ask price
  A: string // Best ask quantity
  o: string // Open price
  h: string // High price
  l: string // Low price
  v: string // Total traded base asset volume
  q: string // Total traded quote asset volume
  O: number // Statistics open time
  C: number // Statistics close time
  F: number // First trade ID
  L: number // Last trade ID
  n: number // Total number of trades
}

// Binance Kline/Candlestick data
export interface BinanceKline {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  quoteAssetVolume: string
  numberOfTrades: number
  takerBuyBaseAssetVolume: string
  takerBuyQuoteAssetVolume: string
}

// Normalized market data for app use
export interface MarketData {
  symbol: string
  displaySymbol: string
  baseAsset: string
  quoteAsset: string
  price: number
  priceChange: number
  priceChangePercent: number
  high24h: number
  low24h: number
  volume24h: number
  quoteVolume24h: number
  lastUpdated: number
}

// Price history point for charts
export interface PricePoint {
  timestamp: number
  price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// WebSocket connection state
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'

// Trading pairs we support
export const SUPPORTED_PAIRS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'DOTUSDT',
  'MATICUSDT',
  'LTCUSDT',
  'AVAXUSDT',
  'LINKUSDT',
] as const

export type SupportedPair = typeof SUPPORTED_PAIRS[number]

// Helper to parse symbol into base/quote
export function parseSymbol(symbol: string): { base: string; quote: string } {
  const quoteAssets = ['USDT', 'BUSD', 'BTC', 'ETH', 'BNB']
  for (const quote of quoteAssets) {
    if (symbol.endsWith(quote)) {
      return {
        base: symbol.slice(0, -quote.length),
        quote,
      }
    }
  }
  return { base: symbol, quote: 'USDT' }
}

// Transform Binance REST response to normalized market data
export function transformTickerResponse(ticker: BinanceTickerResponse): MarketData {
  const { base, quote } = parseSymbol(ticker.symbol)
  return {
    symbol: ticker.symbol,
    displaySymbol: `${base}/${quote}`,
    baseAsset: base,
    quoteAsset: quote,
    price: parseFloat(ticker.lastPrice),
    priceChange: parseFloat(ticker.priceChange),
    priceChangePercent: parseFloat(ticker.priceChangePercent),
    high24h: parseFloat(ticker.highPrice),
    low24h: parseFloat(ticker.lowPrice),
    volume24h: parseFloat(ticker.volume),
    quoteVolume24h: parseFloat(ticker.quoteVolume),
    lastUpdated: ticker.closeTime,
  }
}

// Transform Binance WebSocket ticker to normalized market data
export function transformWebSocketTicker(ticker: BinanceWebSocketTicker): MarketData {
  const { base, quote } = parseSymbol(ticker.s)
  return {
    symbol: ticker.s,
    displaySymbol: `${base}/${quote}`,
    baseAsset: base,
    quoteAsset: quote,
    price: parseFloat(ticker.c),
    priceChange: parseFloat(ticker.p),
    priceChangePercent: parseFloat(ticker.P),
    high24h: parseFloat(ticker.h),
    low24h: parseFloat(ticker.l),
    volume24h: parseFloat(ticker.v),
    quoteVolume24h: parseFloat(ticker.q),
    lastUpdated: ticker.E,
  }
}

// Transform Binance kline array to PricePoint
export function transformKline(kline: (string | number)[]): PricePoint {
  return {
    timestamp: kline[0] as number,
    open: parseFloat(kline[1] as string),
    high: parseFloat(kline[2] as string),
    low: parseFloat(kline[3] as string),
    close: parseFloat(kline[4] as string),
    price: parseFloat(kline[4] as string),
    volume: parseFloat(kline[5] as string),
  }
}
