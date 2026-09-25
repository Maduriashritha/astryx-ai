import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-neon/15 text-neon ring-1 ring-neon/30 md:hidden">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <h1 className="text-base font-semibold tracking-tight text-balance">AI Generation Studio</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs font-medium text-neon">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-neon" />
          </span>
          Groq Llama 3
        </span>
        <div
          className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium ring-1 ring-border"
          role="img"
          aria-label="User avatar: Alex Kim"
        >
          AK
        </div>
      </div>
    </header>
  )
}
