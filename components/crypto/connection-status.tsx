'use client'

import { ConnectionStatus as ConnectionStatusType } from '@/lib/crypto'

interface ConnectionStatusProps {
  status: ConnectionStatusType
}

const statusConfig: Record<ConnectionStatusType, { label: string; className: string }> = {
  connected: {
    label: 'Live',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  connecting: {
    label: 'Connecting',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  reconnecting: {
    label: 'Reconnecting',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  disconnected: {
    label: 'Offline',
    className: 'bg-muted text-muted-foreground',
  },
  error: {
    label: 'Error',
    className: 'bg-destructive/15 text-destructive',
  },
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = statusConfig[status]

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
      <span
        className={`h-2 w-2 rounded-full ${
          status === 'connected'
            ? 'bg-emerald-500 animate-pulse'
            : status === 'connecting' || status === 'reconnecting'
            ? 'bg-amber-500 animate-pulse'
            : status === 'error'
            ? 'bg-destructive'
            : 'bg-muted-foreground'
        }`}
      />
      {config.label}
    </div>
  )
}
