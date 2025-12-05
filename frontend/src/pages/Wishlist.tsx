import { FormEvent, useEffect, useMemo, useState } from 'react'
import api from '../api/http'
import { useTitle } from '../hooks/useTitle'

type WishlistItem = {
  id: number
  company: string
  url: string
  createdAt: string // ISO
}

type SortOption = 'newest' | 'oldest' | 'company-asc' | 'company-desc'

export default function Wishlist() {
  useTitle('Wishlist')

  const [company, setCompany] = useState('')
  const [url, setUrl] = useState('')
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  useEffect(() => {
    api
      .get<WishlistItem[]>('/wishlist')
      .then((r) => {
        setItems(r.data)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load wishlist.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !url.trim()) return

    const normalizedUrl =
      url.startsWith('http://') || url.startsWith('https://')
        ? url.trim()
        : `https://${url.trim()}`

    api
      .post<WishlistItem>('/wishlist', {
        company: company.trim(),
        url: normalizedUrl,
      })
      .then((r) => {
        setItems((prev) => [r.data, ...prev])
        setCompany('')
        setUrl('')
        setCurrentPage(1)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to add wishlist item.')
      })
  }

  const handleDelete = (id: number) => {
    // optional confirm to avoid accidental deletes
    const ok = window.confirm('Remove this wishlist item?')
    if (!ok) return

    api
      .delete(`/wishlist/${id}`)
      .then(() => {
        setItems((prev) => prev.filter((it) => it.id !== id))
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to delete wishlist item.')
      })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatRelativeTime = (iso: string) => {
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diffMs = now - then
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)

    if (diffSec < 10) return 'just now'
    if (diffMin < 1) return `${diffSec}s ago`
    if (diffHr < 1) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`
    if (diffDay < 1) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    if (diffYear < 1) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`
  }

  // --- Derived stats / filters / sorting ------------------------------------

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredAndSorted = useMemo(() => {
    let data = [...items]

    if (normalizedSearch) {
      data = data.filter((item) => {
        const inCompany = item.company.toLowerCase().includes(normalizedSearch)
        const inUrl = item.url.toLowerCase().includes(normalizedSearch)
        return inCompany || inUrl
      })
    }

    data.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'company-asc') {
        return a.company.localeCompare(b.company)
      }
      if (sortBy === 'company-desc') {
        return b.company.localeCompare(a.company)
      }
      return 0
    })

    return data
  }, [items, normalizedSearch, sortBy])

  const total = filteredAndSorted.length
  const totalAll = items.length

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  const safeCurrentPage = Math.min(currentPage, totalPages || 1)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = filteredAndSorted.slice(startIndex, endIndex)
  const showingFrom = total === 0 ? 0 : startIndex + 1
  const showingTo = total === 0 ? 0 : Math.min(endIndex, total)

  const stats = useMemo(() => {
    if (!items.length) {
      return {
        addedLast7Days: 0,
        uniqueCompanies: 0,
        latestAdded: null as WishlistItem | null,
      }
    }

    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    let addedLast7Days = 0
    let latest: WishlistItem | null = null
    const companySet = new Set<string>()

    for (const item of items) {
      const ts = new Date(item.createdAt).getTime()
      if (ts >= sevenDaysAgo) addedLast7Days += 1
      companySet.add(item.company.trim().toLowerCase())
      if (!latest || ts > new Date(latest.createdAt).getTime()) {
        latest = item
      }
    }

    return {
      addedLast7Days,
      uniqueCompanies: companySet.size,
      latestAdded: latest,
    }
  }, [items])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-slate-100">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Wishlist</h1>
        <p className="mt-1 text-sm text-slate-400">
          Save interesting roles to revisit later. These are stored in your JobTracker account.
        </p>
      </header>

      {/* Quick stats */}
      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/95 px-3 py-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Total saved
          </p>
          <p className="mt-1 text-2xl font-mono font-semibold text-sky-400">
            {totalAll}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Keep a focused list of roles you genuinely care about.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/95 px-3 py-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Added in last 7 days
          </p>
          <p className="mt-1 text-2xl font-mono font-semibold text-emerald-400">
            {stats.addedLast7Days}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Aim to add a few roles every week, then actually apply to them.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/95 px-3 py-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Unique companies
          </p>
          <p className="mt-1 text-2xl font-mono font-semibold text-indigo-400">
            {stats.uniqueCompanies}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Diversify your search across different companies and industries.
          </p>
        </div>
      </section>

      {/* Add form */}
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
          Add to wishlist
        </h2>

        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="mb-1 block text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. OpenAI"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
          </div>

          <div className="flex-[1.5]">
            <label className="mb-1 block text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Job link
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste job posting link here"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
          </div>

          <div className="md:w-40">
            <button
              type="submit"
              className="mt-2 w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-mono text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
              disabled={!company.trim() || !url.trim()}
            >
              Add
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-3 text-xs text-red-400">
            {error}
          </p>
        )}
      </section>

      {/* List + toolbar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/95 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-3 text-xs font-mono text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            {loading
              ? 'Loading…'
              : totalAll === 0
              ? 'No wishlist items yet. Add a job link above.'
              : `Wishlist items (${totalAll})`}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Company or URL"
                className="w-40 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort by:</span>
              <select
                className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-mono text-slate-100 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption)
                  setCurrentPage(1)
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="company-asc">Company A–Z</option>
                <option value="company-desc">Company Z–A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between animate-pulse"
                >
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-32 rounded bg-slate-800" />
                    <div className="h-3 w-64 rounded bg-slate-900" />
                  </div>
                  <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                    <div className="h-3 w-32 rounded bg-slate-900" />
                    <div className="h-7 w-16 rounded bg-slate-900" />
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading &&
            paginatedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 px-4 py-3 text-sm text-slate-100 hover:bg-slate-900/80 transition-colors md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded bg-sky-900/70 px-2 py-[3px] text-[11px] font-mono uppercase tracking-[0.16em] text-sky-100 hover:bg-sky-700 hover:text-white transition-colors"
                    >
                      {item.company}
                    </a>
                    <span className="rounded-full bg-slate-900 px-2 py-[2px] text-[10px] font-mono text-slate-400 border border-slate-700/60">
                      {new URL(item.url).hostname.replace(/^www\./, '')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 break-all">
                    {item.url}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <div className="text-right text-[11px] font-mono text-slate-500 md:text-xs">
                    <div>Added: {formatDate(item.createdAt)}</div>
                    <div className="text-slate-400">{formatRelativeTime(item.createdAt)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-md border border-red-500/60 px-2 py-1 text-[11px] font-mono text-red-300 hover:bg-red-900/40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

          {!loading && total === 0 && (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              {totalAll === 0
                ? 'Start building your wishlist by adding a job link above.'
                : 'No items match your current filters. Try clearing the search or changing the sort.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 px-3 py-3 text-[11px] text-slate-400 md:flex-row">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono">Rows per page:</span>
            <select
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-mono text-slate-100 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span>
              Showing {showingFrom}-{showingTo} of {total || 0}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1 || total === 0}
                className={`rounded-md border px-2 py-1 ${
                  safeCurrentPage <= 1 || total === 0
                    ? 'cursor-not-allowed border-slate-800 text-slate-600 bg-slate-900/80'
                    : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-sky-400 hover:text-sky-100'
                }`}
              >
                Prev
              </button>
              <span className="px-1 text-slate-500">
                Page {total === 0 ? 0 : safeCurrentPage} of {total === 0 ? 0 : totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages || total === 0}
                className={`rounded-md border px-2 py-1 ${
                  safeCurrentPage >= totalPages || total === 0
                    ? 'cursor-not-allowed border-slate-800 text-slate-600 bg-slate-900/80'
                    : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-sky-400 hover:text-sky-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
