'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  CircleDot,
  Code2,
  Copy,
  FileCode2,
  Filter,
  GitPullRequest,
  History,
  Info,
  LoaderCircle,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const codePresets = {
  TypeScript: `import { exec } from "node:child_process"\nimport { db } from "./database"\n\nexport async function runQuery(input: string) {\n  const query = \`SELECT * FROM users WHERE name = '\${input}'\`\n  const result = await db.query(query)\n\n  exec(input, (error, stdout) => {\n    if (!error) console.log(stdout)\n  })\n\n  return result.rows\n}`,
  Python: `from flask import request\nimport sqlite3\n\ndef get_user():\n    name = request.args.get("name")\n    query = "SELECT * FROM users WHERE name = '" + name + "'"\n    db = sqlite3.connect("app.db")\n    return db.execute(query).fetchall()`,
  Go: `package main\n\nimport (\n  "database/sql"\n  "net/http"\n)\n\nfunc getUser(w http.ResponseWriter, r *http.Request) {\n  name := r.URL.Query().Get("name")\n  query := "SELECT * FROM users WHERE name = '" + name + "'"\n  db.Query(query)\n}`,
} as const

type Language = keyof typeof codePresets
type Finding = { id: string; title: string; description: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; line: number; cwe: string; patch: string }
type AuditData = { score: number; summary: string; findings: Finding[] }

const severityStyles: Record<Finding['severity'], string> = {
  Critical: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
  High: 'border-orange-400/25 bg-orange-400/10 text-orange-300',
  Medium: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  Low: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
}

function CodeBlock({ code, patch = false }: { code: string; patch?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-[#070a11] font-mono text-[11px] leading-5">
      {code.split('\n').map((line, index) => (
        <div key={`${index}-${line}`} className={`flex min-h-5 ${patch && index >= 4 && index <= 7 ? 'bg-rose-400/[0.08]' : ''}`}>
          <span className="w-10 shrink-0 select-none border-r border-white/[0.06] px-2 text-right text-zinc-600">{index + 1}</span>
          <span className={`whitespace-pre px-3 ${patch && index >= 4 && index <= 7 ? 'text-rose-200' : 'text-zinc-300'}`}>{line || ' '}</span>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const [language, setLanguage] = useState<Language>('TypeScript')
  const [code, setCode] = useState(codePresets.TypeScript)
  const [activeTab, setActiveTab] = useState('Security Flaws')
  const [severity, setSeverity] = useState('All')
  const [isAuditing, setIsAuditing] = useState(false)
  const [selectedFinding, setSelectedFinding] = useState(1)
  const [copied, setCopied] = useState(false)
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [auditError, setAuditError] = useState<string | null>(null)

  const findings = auditData?.findings ?? []
  const visibleFindings = useMemo(() => severity === 'All' ? findings : findings.filter((finding) => finding.severity === severity), [severity, findings])
  const selected = findings.find((finding) => finding.id === selectedFinding) ?? visibleFindings[0] ?? findings[0] ?? null

  async function runAudit() {
    if (!code.trim() || isAuditing) return
    setIsAuditing(true)
    setAuditError(null)
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, language }) })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'Analysis failed. Please try again.')
      if (!result || typeof result.score !== 'number' || typeof result.summary !== 'string' || !Array.isArray(result.findings)) throw new Error('The analysis service returned an invalid response. Please try again.')
      const next: AuditData = {
        score: Math.max(0, Math.min(100, Math.round(result.score))),
        summary: result.summary,
        findings: result.findings.filter((item: unknown): item is Finding => Boolean(item) && typeof item === 'object' && typeof (item as Finding).id === 'string' && typeof (item as Finding).title === 'string' && typeof (item as Finding).description === 'string' && ['Critical', 'High', 'Medium', 'Low'].includes((item as Finding).severity) && typeof (item as Finding).line === 'number' && typeof (item as Finding).cwe === 'string' && typeof (item as Finding).patch === 'string'),
      }
      setAuditData(next)
      setSelectedFinding(next.findings[0]?.id ?? '')
      setSeverity('All')
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : 'Analysis failed. Please try again.')
    } finally {
      setIsAuditing(false)
    }
  }

  async function copyPatch() {
    if (!selected?.patch) return
    try {
      await navigator.clipboard.writeText(selected.patch)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setAuditError('Could not copy the patch. Check clipboard permissions and try again.')
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#090d16] text-zinc-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.11),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(56,189,248,0.09),transparent_26%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,auto,36px_36px,36px_36px]" />
      <header className="relative flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0b101b]/80 px-5 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-9">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.16)]"><Terminal /></div>
            <span className="text-[15px] font-semibold tracking-[0.22em] text-white">ASTRYX</span>
          </div>
          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Primary navigation">
            {[[Code2, 'Workspace', true], [History, 'History', false], [BookOpen, 'OWASP Docs', false]].map(([Icon, label, active]) => (
              <button key={label as string} className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${active ? 'bg-white/[0.07] text-white' : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200'}`}><Icon data-icon="inline-start" />{label as string}</button>
            ))}
          </nav>
        </div>
        <Button onClick={runAudit} disabled={isAuditing || !code.trim()} className="h-9 gap-2 bg-emerald-400 px-3 text-xs font-semibold text-[#07140f] hover:bg-emerald-300">
          {isAuditing ? <LoaderCircle className="animate-spin" /> : <Sparkles />} {isAuditing ? 'Auditing...' : 'Run AI Audit'}
        </Button>
      </header>

      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-5 p-4 md:p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400"><CircleDot /> Live workspace</div><h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Security review workspace</h1><p className="mt-1 text-sm text-zinc-500">Inspect vulnerabilities, understand the risk, and ship safer code.</p></div>
          <div className="flex items-center gap-2 text-xs text-zinc-500"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />{auditData ? `${findings.length} findings from latest audit` : 'No audit run yet'}</div>
        </div>

        <section className="grid min-h-[680px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d121d]/95 shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_0_1px_rgba(52,211,153,0.03)] backdrop-blur-xl xl:grid-cols-[minmax(430px,0.92fr)_minmax(560px,1.08fr)]">
          <div className="flex min-h-[650px] flex-col border-b border-white/[0.08] xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3"><div className="flex items-center gap-2 text-xs font-medium text-zinc-300"><FileCode2 className="text-emerald-400" /> review.ts</div><div className="flex items-center gap-2"><select aria-label="Select language" value={language} onChange={(event) => { const next = event.target.value as Language; setLanguage(next); setCode(codePresets[next]) }} className="rounded-md border border-white/[0.09] bg-white/[0.04] px-2 py-1.5 text-xs text-zinc-300 outline-none"><option>TypeScript</option><option>Python</option><option>Go</option></select><Button variant="ghost" size="icon-sm" aria-label="Search code"><Search /></Button></div></div>
            <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2"><span className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Presets</span>{(['SQL injection', 'Command injection', 'Clean auth flow']).map((preset) => <button key={preset} onClick={() => preset === 'Clean auth flow' ? setCode(code.replace(/exec\([\s\S]*?\n  }\n\n  return/, 'return')) : undefined} className="rounded border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-500 hover:border-emerald-400/30 hover:text-emerald-300">{preset}</button>)}</div>
            <div className="relative flex-1 overflow-auto bg-[#080b12] p-4 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px)] before:bg-[size:100%_24px] before:opacity-50"><textarea aria-label="Source code editor" spellCheck={false} value={code} onChange={(event) => setCode(event.target.value)} className="min-h-[480px] w-full resize-none bg-transparent font-mono text-[12px] leading-6 text-zinc-300 outline-none" /></div>
            <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3 text-[11px] text-zinc-600"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-400" /> Ready to analyze</span><span>{code.split('\n').length} lines &middot; {language}</span></div>
          </div>

          <div className="flex min-h-[650px] flex-col bg-[#0c111b]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4"><div><h2 className="text-sm font-semibold text-white">Analysis report</h2><p className="mt-0.5 text-xs text-zinc-500">AI-powered static analysis</p>{auditError && <p role="alert" className="mt-2 text-xs text-rose-300">{auditError}</p>}</div><Button variant="outline" size="sm" onClick={runAudit} className="border-white/10 bg-white/[0.03] text-zinc-300"><Wrench data-icon="inline-start" /> Fix all</Button></div>
            <div className="grid grid-cols-[150px_1fr] gap-5 border-b border-white/[0.08] bg-gradient-to-br from-white/[0.025] to-transparent p-5"><div className="relative flex size-32 items-center justify-center rounded-full shadow-[0_0_34px_rgba(245,158,11,0.12)]" style={{ background: 'conic-gradient(#f59e0b 0deg 248deg, #202838 248deg 360deg)' }}><div className="flex size-[106px] flex-col items-center justify-center rounded-full border border-white/[0.06] bg-[#0c111b]"><span className="text-3xl font-semibold tracking-tight text-white"{auditData?.score ?? '—'}</span><span className="text-[10px] uppercase tracking-wider text-zinc-500">out of 100</span></div></div><div className="flex flex-col justify-center gap-3"><div className="flex items-center gap-2 text-xs text-amber-300"><AlertTriangle /> Needs attention before merge</div><p className="max-w-md text-sm leading-5 text-zinc-400">{auditData?.summary ?? 'Run an audit to see security findings for the code in your editor.'}</p><div className="flex flex-wrap gap-2">{(['Critical', 'High', 'Medium', 'Low'] as const).map((item) => <button key={item} onClick={() => setSeverity(severity === item ? 'All' : item)} className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${severity === item ? 'ring-1 ring-white/30 ' : ''}${severityStyles[item]}`}><span className="mr-1.5 font-semibold">{findings.filter((finding) => finding.severity === item).length}</span>{item}</button>)}</div></div></div>
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5"><div className="flex gap-5">{['Security Flaws', 'Proposed Fixes', 'Performance Suggestions'].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 py-3 text-xs font-medium transition-colors ${activeTab === tab ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{tab}</button>)}</div><button onClick={() => setSeverity('All')} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"><Filter /> {severity === 'All' ? 'Filter' : severity}</button></div>
            <div className="grid flex-1 xl:grid-cols-[1fr_1fr]">
              <div className="border-b border-white/[0.08] xl:border-b-0 xl:border-r"><div className="flex items-center justify-between px-5 py-3"><span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">{activeTab}</span><span className="text-[10px] text-zinc-600">{visibleFindings.length} findings</span></div><div className="flex flex-col">{visibleFindings.map((finding) => <button key={finding.id} onClick={() => setSelectedFinding(finding.id)} className={`border-l-2 px-5 py-3 text-left transition-colors ${selectedFinding === finding.id ? 'border-emerald-400 bg-emerald-400/[0.06]' : 'border-transparent hover:bg-white/[0.03]'}`}><div className="flex items-start justify-between gap-3"><div className="flex gap-2.5"><div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded ${finding.severity === 'Critical' ? 'bg-rose-400/15 text-rose-300' : 'bg-amber-400/15 text-amber-300'}`}><AlertTriangle /></div><div><p className="text-xs font-medium text-zinc-200">{finding.title}</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{finding.description}</p></div></div><span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] ${severityStyles[finding.severity]}`}>{finding.severity}</span></div><div className="mt-2 flex items-center gap-3 pl-7 text-[10px] text-zinc-600"><span>Line {finding.line}</span><span>{finding.cwe}</span></div></button>)}</div></div>
              <div className="p-5"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-medium text-zinc-300">Suggested patch</p><p className="mt-1 text-[10px] text-zinc-600">{selected ? `Fix for ${selected.title} at line ${selected.line}` : 'Run an audit to see suggested fixes'}</p></div><Button variant="ghost" size="icon-sm" onClick={copyPatch} disabled={!selected?.patch} aria-label="Copy patch">{copied ? <Check className="text-emerald-400" /> : <Copy />}</Button></div><CodeBlock patch code={selected?.patch || 'No patch is available for this finding.'} /><div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] p-3 text-[11px] leading-4 text-emerald-200/80"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" /> {selected?.description ?? 'Findings will appear here after the audit completes.'}</div></div>
            </div>
          </div>
        </section>
        <footer className="flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-zinc-600"><span className="flex items-center gap-2"><Info /> ASTryx analyzes locally in your workspace. Your source code is never stored.</span><span className="flex items-center gap-4"><span className="flex items-center gap-1.5"><GitPullRequest /> PR checks enabled</span><span className="flex items-center gap-1.5"><ArrowUp /> {findings.length} findings</span><span className="flex items-center gap-1.5"><ArrowDown /> {auditData ? 'Current results' : 'Awaiting audit'}</span></span></footer>
      </div>
    </main>
  )
}
