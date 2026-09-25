'use client'

import { AlertCircle, Bot, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { Generation } from '@/lib/types'

type OutputCardProps = {
  generation: Generation | null
  isLoading: boolean
  error: string | null
  saved: boolean | null
}

export function OutputCard({ generation, isLoading, error, saved }: OutputCardProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!generation) return
    await navigator.clipboard.writeText(generation.response)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section
      aria-labelledby="output-title"
      aria-live="polite"
      aria-busy={isLoading}
      className="flex min-h-64 flex-1 flex-col rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-neon" aria-hidden="true" />
          <h2 id="output-title" className="text-sm font-medium">
            Response
          </h2>
          {generation && saved !== null && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
              {saved ? 'Saved to Supabase' : 'Not saved'}
            </span>
          )}
        </div>
        {generation && (
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      <div className="flex-1 p-5">
        {isLoading ? (
          <div className="flex flex-col gap-3" aria-label="Generating response">
            <div className="h-3 w-11/12 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-secondary" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">{error}</p>
          </div>
        ) : generation ? (
          <div className="flex flex-col gap-4">
            <p className="line-clamp-2 border-l-2 border-neon/50 pl-3 text-xs italic text-muted-foreground">
              {generation.prompt}
            </p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-pretty text-card-foreground">
              {generation.response}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
              <Bot className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">No response yet</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Write a prompt above and hit Generate to see the model&apos;s answer here.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
