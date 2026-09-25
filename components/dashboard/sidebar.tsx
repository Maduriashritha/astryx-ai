import { BarChart3, LayoutDashboard, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Dashboard', href: '#', icon: LayoutDashboard, active: true },
  { label: 'Analytics', href: '#', icon: BarChart3, active: false },
  { label: 'Settings', href: '#', icon: Settings, active: false },
]

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-neon/15 text-neon ring-1 ring-neon/30">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Promptly</span>
      </div>

      <nav aria-label="Main" className="flex-1 px-3 py-4">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</p>
        <ul className="flex flex-col gap-1">
          {links.map(({ label, href, icon: Icon, active }) => (
            <li key={label}>
              <a
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
              >
                <Icon className={cn('size-4', active && 'text-neon')} aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
        <p className="text-xs font-medium text-sidebar-foreground">Powered by Groq</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Ultra-fast inference on the LPU engine.
        </p>
      </div>
    </aside>
  )
}
