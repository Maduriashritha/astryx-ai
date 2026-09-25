'use client'

import { Loader2, SendHorizontal } from 'lucide-react'
import { useState } from 'react'

type PromptInputProps = {
  onSubmit: (prompt: string) => Promise<boolean>
  isLoading: boolean
}

const MAX_LENGTH = 8000

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [value, setValue] = useState('')
  const canSubmit = value.trim().length > 0 && !isLoading

  async function submit() {
    if (!canSubmit) return
    const ok = await onSubmit(value.trim())
    if (ok) setValue('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="rounded-2xl border border-border bg-card p-4 transition-colors focus-within:border-neon/50"
    >
      <label htmlFor="prompt" className="text-sm font-medium">
        Prompt
      </label>
      <textarea
        id="prompt"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey)) return
          if (e.nativeEvent.isComposing || e.keyCode === 229) return
          e.preventDefault()
          submit()
        }}
        maxLength={MAX_LENGTH}
        rows={6}
        placeholder="Ask anything — draft an email, explain a concept, write some code..."
        className="mt-2 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
            {'Ctrl/Cmd + Enter'}
          </kbd>
          <span className="ml-2 hidden sm:inline">to generate</span>
          <span className="ml-3 font-mono">
            {value.length}/{MAX_LENGTH}
          </span>
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-neon px-5 py-2 text-sm font-semibold text-neon-foreground shadow-[0_0_24px_-4px_var(--neon)] transition-all hover:shadow-[0_0_32px_-2px_var(--neon)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <SendHorizontal className="size-4" aria-hidden="true" />
          )}
          {isLoading ? 'Generating' : 'Generate'}
        </button>
      </div>
    </form>
  )
}
