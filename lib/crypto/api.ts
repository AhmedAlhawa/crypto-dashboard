import {
  BinanceTickerResponse,
  MarketData,
  PricePoint,
  SUPPORTED_PAIRS,
  transformTickerResponse,
  transformKline,
} from './types'

const BINANCE_REST_URL = 'https://api.binance.com/api/v3'

// Fetch 24hr ticker for all supported pairs
export async function fetchAllTickers(): Promise<MarketData[]> {
  const symbols = SUPPORTED_PAIRS.join('","')
  console.log('symbols123 : ',symbols)
  const url = `${BINANCE_REST_URL}/ticker/24hr?symbols=["${symbols}"]`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch tickers: ${response.status}`)
  }
  
  const data: BinanceTickerResponse[] = await response.json()
    console.log('response123 : ',data)

  return data.map(transformTickerResponse)
}

// Fetch 24hr ticker for a single symbol
export async function fetchTicker(symbol: string): Promise<MarketData> {
  const url = `${BINANCE_REST_URL}/ticker/24hr?symbol=${symbol}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ticker for ${symbol}: ${response.status}`)
  }
  
  const data: BinanceTickerResponse = await response.json()
  return transformTickerResponse(data)
}

// Fetch historical kline/candlestick data
export async function fetchKlines(
  symbol: string,
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h',
  limit: number = 100
): Promise<PricePoint[]> {
  const url = `${BINANCE_REST_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch klines for ${symbol}: ${response.status}`)
  }
  
  const data: (string | number)[][] = await response.json()
  return data.map(transformKline)
}

// Fetch current price only (lightweight)
export async function fetchPrice(symbol: string): Promise<number> {
  const url = `${BINANCE_REST_URL}/ticker/price?symbol=${symbol}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch price for ${symbol}: ${response.status}`)
  }
  
  const data: { symbol: string; price: string } = await response.json()
  return parseFloat(data.price)
}
