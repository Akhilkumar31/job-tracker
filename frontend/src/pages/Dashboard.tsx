import { useEffect, useState } from 'react'
import { useTitle } from '../hooks/useTitle'
import api from '../api/http'
import StatusPie from '../components/Charts'
import { JobApp } from '../types'
import { parseLocalDate } from '../utils/dateUtils'

type Stats = Record<string, number>

export default function Dashboard() {
  useTitle('Dashboard')

  const [stats, setStats] = useState<Stats>({})
  const [recentApps, setRecentApps] = useState<JobApp[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingApps, setLoadingApps] = useState(true)

  useEffect(() => {
    // Load aggregated status counts
    api
      .get('/analytics/status-counts')
      .then((r) => setStats(r.data))
      .catch((err) => {
        console.error('Failed to load /analytics/status-counts', err)
        setStats({})
      })
      .finally(() => setLoadingStats(false))

    // Load applications so we can show recent activity
    api
      .get('/apps')
      .then((r) => {
        console.log('Dashboard /apps response:', r.data)
        const raw = r.data

        // Handle different possible shapes: [] or { items: [] }
        const apps: JobApp[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
          ? raw.items
          : []

        // Helper: pick the best date field for each app and convert to timestamp
        const getTimestamp = (app: any): number => {
          const dateStr: string | undefined =
            app.appliedDate || app.updatedAt || app.createdAt || app.nextActionDate
        
          if (dateStr) {
            const t = Date.parse(dateStr)
            if (!Number.isNaN(t)) return t
          }
        
          // Fallback: use id to keep newer ids at the top
          const idNum = typeof app.id === 'number' ? app.id : Number(app.id)
          return Number.isNaN(idNum) ? 0 : idNum
        }
        
        const sorted = [...apps].sort((a, b) => {
          const tb = getTimestamp(b)
          const ta = getTimestamp(a)
          return tb - ta // newest first
        })

        setRecentApps(sorted.slice(0, 4))
      })
      .catch((err) => {
        console.error('Failed to load /apps for Dashboard recent activity', err)
        setRecentApps([])
      })
      .finally(() => setLoadingApps(false))
  }, [])

  const loading = loadingStats || loadingApps

  const data = Object.entries(stats).map(([name, value]) => ({ name, value }))

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const applied = stats['APPLIED'] ?? 0
  const interviewing = stats['INTERVIEW'] ?? 0
  const offers = stats['OFFER'] ?? 0
  const rejected = stats['REJECTED'] ?? 0

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-6 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Main editor-like panel */}
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-xl shadow-slate-950/70">
          {/* Header */}
          <header className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
                JOB TRACKER • OVERVIEW
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-[13px] text-slate-400">
                A quick snapshot of where your applications are right now.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-medium text-emerald-200 shadow-sm shadow-emerald-500/30">
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />{' '}
                {total || 0} TOTAL
              </div>
              {!loading && (
                <div className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-mono text-slate-400">
                  Last updated: just now
                </div>
              )}
            </div>
          </header>

          {/* Summary row */}
          <section className="grid gap-3 md:grid-cols-4">
            <SummaryCard
              label="Applied"
              value={applied}
              hint="Waiting for a response"
              className="border-sky-400/50 bg-slate-950"
              dotClassName="bg-sky-400"
            />
            <SummaryCard
              label="Interviewing"
              value={interviewing}
              hint="In progress"
              className="border-amber-300/60 bg-slate-950"
              dotClassName="bg-amber-300"
            />
            <SummaryCard
              label="Offers"
              value={offers}
              hint="Great work!"
              className="border-emerald-400/70 bg-slate-950"
              dotClassName="bg-emerald-400"
            />
            <SummaryCard
              label="Rejected"
              value={rejected}
              hint="Part of the process"
              className="border-rose-400/60 bg-slate-950"
              dotClassName="bg-rose-400"
            />
          </section>

          {/* Chart + Insights */}
          <section className="grid gap-4 md:grid-cols-3">
            {/* Chart card */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-lg shadow-slate-950/60 md:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-slate-400">
                    APPLICATION STATUS BREAKDOWN
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Visualise how your applications are distributed across each stage.
                  </p>
                </div>
                {!loading && (
                  <div className="hidden rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-mono text-slate-400 md:inline-flex">
                    Hover chart slices to see exact counts
                  </div>
                )}
              </div>

              {loading ? (
                // Skeleton while loading
                <div className="flex h-80 items-center justify-center">
                  <div className="h-40 w-40 animate-pulse rounded-full bg-slate-800/60" />
                </div>
              ) : data.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-xs font-mono text-slate-500">
                  No applications yet. Add some to see your breakdown.
                </div>
              ) : (
                <StatusPie data={data} />
              )}
            </div>

            {/* Insights side panel */}
            <InsightsPanel
              total={total}
              applied={applied}
              interviewing={interviewing}
              offers={offers}
              rejected={rejected}
              loading={loading}
            />
          </section>

          {/* Recent activity + Action center */}
          <section className="grid gap-4 md:grid-cols-2">
            <RecentActivityCard loading={loadingApps} apps={recentApps} />
            <ActionCenterCard
              total={total}
              interviewing={interviewing}
              offers={offers}
              rejected={rejected}
            />
          </section>

          {/* VS Code-style status bar */}
          <footer className="mt-2 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-[11px] font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span>TypeScript React</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">UTF-8</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">LF</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{total || 0} apps</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Job Tracker · AI-ready</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

type SummaryCardProps = {
  label: string
  value: number
  hint: string
  className?: string
  dotClassName?: string
}

function SummaryCard({
  label,
  value,
  hint,
  className = '',
  dotClassName = '',
}: SummaryCardProps) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border px-4 py-3 text-xs shadow-lg shadow-slate-950/50 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </span>
        <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
      </div>
      <div className="font-mono text-2xl font-semibold tracking-tight text-slate-50">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{hint}</div>
    </div>
  )
}

type InsightsPanelProps = {
  total: number
  applied: number
  interviewing: number
  offers: number
  rejected: number
  loading: boolean
}

function InsightsPanel({
  total,
  interviewing,
  offers,
  rejected,
  loading,
}: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs shadow-lg shadow-slate-950/60">
        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-slate-800" />
        <div className="space-y-3">
          <div className="h-2 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-2 w-5/6 animate-pulse rounded bg-slate-800" />
          <div className="h-2 w-3/4 animate-pulse rounded bg-slate-800" />
        </div>
      </div>
    )
  }

  const hasData = total > 0
  const offerRate = total ? Math.round((offers / total) * 100) : 0
  const interviewRate = total ? Math.round((interviewing / total) * 100) : 0
  const rejectionRate = total ? Math.round((rejected / total) * 100) : 0

  let primaryMessage =
    'Solid base of applications. Next step: focus on turning them into interviews.'
  if (!hasData) {
    primaryMessage =
      'Once you start tracking applications, you’ll see personalised insights here.'
  } else if (offers > 0) {
    primaryMessage =
      'You’re already converting applications into offers. Capture what worked and repeat it.'
  } else if (interviewing > 0) {
    primaryMessage =
      'You’re getting into conversations. Prioritise prepping for interviews and following up.'
  } else if (rejectionRate > 40) {
    primaryMessage =
      'Rejections are a bit high. Try tightening your targeting and tweaking your resume for each role.'
  }

  return (
    <aside className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs shadow-lg shadow-slate-950/60">
      <div>
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-slate-400">
          Pipeline Insights
        </h2>
        <p className="mt-2 text-[11px] text-slate-500">{primaryMessage}</p>
      </div>

      {hasData && (
        <div className="mt-4 space-y-3">
          <InsightMetric label="Interview rate" value={interviewRate} />
          <InsightMetric label="Offer rate" value={offerRate} />
          <InsightMetric label="Rejection rate" value={rejectionRate} />
        </div>
      )}

      <div className="mt-4 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
        Tip: Update this dashboard after each application so you can spot trends in what’s working.
      </div>
    </aside>
  )
}

type InsightMetricProps = {
  label: string
  value: number
}

function InsightMetric({ label, value }: InsightMetricProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="font-mono text-[11px] text-slate-200">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

type RecentActivityCardProps = {
  loading: boolean
  apps: JobApp[]
}

function RecentActivityCard({ loading, apps }: RecentActivityCardProps) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs shadow-lg shadow-slate-950/60">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-slate-400">
          Recent Activity
        </h2>
        <span className="text-[10px] text-slate-500">Most recent updates</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-8 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-8 w-full animate-pulse rounded bg-slate-800" />
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[11px] text-slate-500">
          Once you log applications, you&apos;ll see a timeline of changes here.
        </div>
      ) : (
        <ul className="space-y-2">
          {apps.map((app) => (
            <li
              key={app.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-300">
                  {app.position}{' '}
                  <span className="text-slate-500">@ {app.company}</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {formatActionLabel((app as any).status)} ·{' '}
                  {formatWhen(
                    (app as any).nextActionDate ||
                      (app as any).updatedAt ||
                      (app as any).createdAt
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

type ActionCenterCardProps = {
  total: number
  interviewing: number
  offers: number
  rejected: number
}

function ActionCenterCard({
  total,
  interviewing,
  offers,
  rejected,
}: ActionCenterCardProps) {
  const hasData = total > 0

  const suggestions: string[] = []

  if (!hasData) {
    suggestions.push('Add your first 3 applications to start the tracking flow.')
    suggestions.push('Create a simple rule: 5 applications per day for the next week.')
  } else {
    suggestions.push('Review your last 5 applications and send 1–2 follow-up emails.')
    if (interviewing > 0) {
      suggestions.push(
        'Block 30 minutes today for interview prep (company research, STAR stories).'
      )
    }
    if (rejected > 0 && offers === 0) {
      suggestions.push('Compare roles where you were rejected and adjust resume keywords.')
    }
    if (offers > 0) {
      suggestions.push(
        'Write down what worked for the roles that became offers and replicate it.'
      )
    }
  }

  return (
    <section className="flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-xs shadow-lg shadow-slate-950/60">
      <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-slate-400">
        Action Center
      </h2>
      <p className="mt-2 text-[11px] text-slate-500">
        Small, focused steps you can take today to move your pipeline forward.
      </p>

      <ul className="mt-4 space-y-2">
        {suggestions.slice(0, 3).map((s, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 rounded-lg border border-slate-800/80 bg-slate-900/70 px-3 py-2"
          >
            <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-slate-200">{s}</span>
          </li>
        ))}
      </ul>

      {hasData && (
        <div className="mt-4 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
          Hint: Turn one of these into a recurring habit (e.g. “5 apps before lunch”).
        </div>
      )}
    </section>
  )
}

function formatActionLabel(status: any) {
  switch (status) {
    case 'APPLIED':
      return 'Applied to this role'
    case 'INTERVIEW':
      return 'Interview stage updated'
    case 'OFFER':
      return 'Offer received 🎉'
    case 'REJECTED':
      return 'Marked as rejected'
    default:
      return 'Updated'
  }
}

// More detailed "x ago" formatting (hours, days, etc.)
function formatWhen(dateStr?: string): string {
  if (!dateStr) return 'Date unknown'

  let date: Date

  // If backend sent just 'YYYY-MM-DD', parse as *local* date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    date = parseLocalDate(dateStr)
  } else {
    // Otherwise treat it as a full ISO datetime
    date = new Date(dateStr)
  }

  if (Number.isNaN(date.getTime())) return dateStr

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 0) {
    // Future date → just show the date
    return date.toLocaleDateString()
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  // 🔥 No more "23h ago" stuff
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString()
}


