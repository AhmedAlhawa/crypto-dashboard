# CryptoTracker - Real-Time Crypto Market Dashboard

A real-time cryptocurrency market dashboard built with Next.js 16, featuring live WebSocket updates from Binance.

## Setup & Run Instructions

```bash
# Install dependencies
npm install

# Run development server
npm dev

# Build for production
npm build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

## Environment / Setup Notes

- **No API keys required** - Uses public Binance REST API and WebSocket streams
- **Node.js 18+** recommended

## Key Assumptions

1. **Binance API availability** - The app assumes Binance public APIs are accessible from the user's network

2. **Client-side rendering for real-time data** - WebSocket connections run in the browser
3. **localStorage availability** - Used for persisting user favorites

## Technical Trade-offs

| Decision | Trade-off |
|----------|-----------|
| **Client-side WebSocket** | Simpler architecture, but each user opens their own connection vs. server-side aggregation |
| **SWR for initial fetch** | Provides caching and revalidation, adds ~10KB to bundle , SWR is a React hook library for data fetching 
| **localStorage for favorites** | No backend required, but data is device-specific and not synced |
| **Recharts for charts** | Full-featured and React-native, but larger bundle (~200KB) vs. lightweight alternatives |
| **Exponential backoff reconnection** | Prevents API hammering during outages, but delays reconnection attempts |

---

## Dependencies Explained

### Core Framework

| Package | Purpose |
|---------|---------|
| `next` (16.1.6) | React framework with App Router, SSR, file-based routing, and API routes |
| `react` / `react-dom` (19.2.4) | UI library for building component-based interfaces |

### Styling & UI

| Package | Purpose |
|---------|---------|
| `tailwind-merge` | Intelligently merges Tailwind CSS classes, resolving conflicts (e.g., `p-2` + `p-4` = `p-4`) |
| `class-variance-authority` (cva) | Creates variant-based component styles (e.g., Button with `variant="primary"`) |
| `clsx` | Conditionally joins classNames together (`clsx('base', isActive && 'active')`) |
| `autoprefixer` | PostCSS plugin that adds vendor prefixes for browser compatibility |
| `next-themes` | Theme switching (light/dark mode) with SSR support and no flash |
| `lucide-react` | Icon library with 1000+ SVG icons as React components |

### Data & State Management

| Package | Purpose |
|---------|---------|
| `swr` | React hooks for data fetching with caching, revalidation, and stale-while-revalidate |
| `zod` | TypeScript-first schema validation for runtime type checking |
| `react-hook-form` | Performant form handling with minimal re-renders |

### Charts & Visualization

| Package | Purpose |
|---------|---------|
| `recharts` | Composable charting library built on D3 - used for price charts |

### UI Components (shadcn/ui ecosystem)

| Package | Purpose |
|---------|---------|
| `cmdk` | Command palette / search component (⌘K style) |
| `vaul` | Drawer/sheet component for mobile-friendly modals |
| `sonner` | Toast notifications with beautiful animations |
| `embla-carousel-react` | Lightweight carousel/slider component |
| `react-day-picker` | Date picker component |
| `date-fns` | Modern date utility library (formatting, parsing, manipulation) |
| `input-otp` | One-time password input component |
| `react-resizable-panels` | Resizable panel layouts (split views) |



## Project Structure

```
├── app/
│   ├── page.tsx              # Markets list (home page)
│   ├── markets/[symbol]/     # Market details page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── crypto/               # Crypto-specific components
├── hooks/                    # Custom React hooks
│   ├── use-websocket.ts      # WebSocket connection management
│   ├── use-favorites.ts      # Favorites persistence
│   └── use-market-data.ts    # SWR-based data fetching
└── lib/
    └── crypto/               # Crypto utilities
        ├── types.ts          # TypeScript interfaces
        ├── api.ts            # Binance REST API client
        └── websocket.ts      # WebSocket manager with reconnection
```


