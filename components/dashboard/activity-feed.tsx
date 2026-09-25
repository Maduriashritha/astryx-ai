'use client'

import { Clock, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Generation } from '@/lib/types'

type ActivityFeedProps = {
  items: Generation[]
  isLoading: boolean
  configured: boolean
  activeId: string | null
  onSelect: (generation: Generation) => void
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function ActivityFeed({ items, isLoading, configured, activeId, onSelect }: ActivityFeedProps) {
  return (
    <aside
      aria-labelledby="activity-title"
      className="flex max-h-[28rem] flex-col border-t border-border bg-sidebar lg:max-h-none lg:w-80 lg:shrink-0 lg:border-l lg:border-t-0"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 id="activity-title" className="text-sm font-medium">
            Activity History
          </h2>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
      </div>

      {!configured && !isLoading && (
        <p className="mx-3 mt-3 rounded-lg border border-border bg-secondary/50 p-3 text-xs leading-relaxed text-muted-foreground">
          Supabase isn&apos;t connected, so history only lasts for this session.
        </p>
      )}

      <ul className="flex-1 overflow-y-auto p-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex flex-col gap-2 p-3">
              <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
              <div className="h-2.5 w-1/4 animate-pulse rounded bg-secondary" />
            </li>
          ))}

        {!isLoading && items.length === 0 && (
          <li className="px-3 py-10 text-center text-xs text-muted-foreground">Your past prompts will appear here.</li>
        )}

        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              aria-current={activeId === item.id ? 'true' : undefined}
              className={cn(
                'w-full rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-sidebar-accent',
                activeId === item.id && 'border-neon/30 bg-sidebar-accent',
              )}
            >
              <p className="line-clamp-2 text-sm leading-snug text-sidebar-foreground">{item.prompt}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" aria-hidden="true" />
                <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
              </p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
