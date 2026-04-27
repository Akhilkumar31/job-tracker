import { useEffect, useState, Fragment } from 'react'
import { useTitle } from '../hooks/useTitle'
import api from '../api/http'
import { JobApp, Status, Reminder } from '../types'
import StatusBadge from '../components/StatusBadge'
import ReminderInline from '../components/ReminderInline'
import * as XLSX from 'xlsx'
import DatePicker from 'react-datepicker'
import { formatLocalDate, parseLocalDate } from '../utils/dateUtils'

// --- URL helpers (shared logic with Wishlist-style behavior) ---
const normalizeUrl = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  // If user already included protocol, keep it
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Otherwise, assume https
  return `https://${trimmed}`
}

const isValidUrl = (value: string) => {
  const normalized = value.trim()
  if (!normalized) return false

  // Must start with http:// or https:// and have at least one dot in the hostname
  const pattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\S*)?$/
  return pattern.test(normalized)
}

// Popular companies (you can expand this list anytime)
const POPULAR_COMPANIES = [
  // Big tech
  'Google',
  'Apple',
  'Microsoft',
  'Amazon',
  'Meta',
  'NVIDIA',
  'Tesla',
  'IBM',
  'Oracle',
  'Samsung',
  'Sony',

  // Developer / product–heavy companies
  'Adobe',
  'Salesforce',
  'Shopify',
  'Spotify',
  'Atlassian',
  'Stripe',
  'Airbnb',
  'Uber',
  'Lyft',
  'Doordash',
  'Dropbox',
  'GitHub',
  'GitLab',
  'Figma',
  'Notion',
  'Slack',
  'ZoomInfo',
  'Canva',
  'Asana',
  'Trello',
  'HubSpot',

  // Enterprise / cloud / infra
  'Intel',
  'Cisco',
  'SAP',
  'Snowflake',
  'MongoDB',
  'Cloudflare',
  'DigitalOcean',
  'Datadog',
  'Red Hat',
  'VMware',
  'Palantir',
  'Splunk',
  'HashiCorp',
  'Twilio',
  'Okta',
  'Elastic',
  'Confluent',
  'Fastly',
  'Nutanix',
  'ServiceNow',

  // Social / consumer
  'Twitter',
  'X (Twitter)',
  'Snap',
  'TikTok',
  'LinkedIn',
  'Pinterest',
  'Reddit',
  'Twitch',
  'Discord',
  'Zoom',
  'Hulu',
  'Roku',
  'Yelp',
  'Netflix',
  'Quora',

  // Consulting / finance / others
  'Accenture',
  'Deloitte',
  'PwC',
  'KPMG',
  'EY',
  'Goldman Sachs',
  'J.P. Morgan',
  'Morgan Stanley',
  'Bloomberg',
  'Capital One',
  'Visa',
  'Mastercard',
  'American Express',
  'PayPal',
  'Square',
  'Robinhood',
  'Coinbase',

  // AI / emerging tech
  'OpenAI',
  'Anthropic',
  'DeepMind',
  'Cohere',
  'Hugging Face',
  'Stability AI',
  'Runway',
  'Scale AI',
  'Replit',
  'Inflection AI',
  'Adept AI',
  'Perplexity AI',
  'ElevenLabs',
]

// Popular job titles (you can expand this list anytime)
const POPULAR_POSITIONS = [
  // Core engineering
  'Software Engineer',
  'Software Development Engineer',
  'SDE',
  'Senior Software Engineer',
  'Senior SDE',
  'Principal SDE',
  'Staff Software Engineer',
  'Principal Software Engineer',
  'Junior Software Engineer',
  'Entry Level Software Engineer',
  'Lead Software Engineer',
  'Engineering Manager',
  'Director of Engineering',
  'Software Architect',
  'Solutions Architect',
  'Cloud Architect',
  'Enterprise Architect',

  // Frontend
  'Frontend Engineer',
  'Senior Frontend Engineer',
  'React Developer',
  'UI Engineer',
  'Angular Developer',
  'Vue.js Developer',
  'UI/UX Engineer',
  'Web Developer',

  // Backend
  'Backend Engineer',
  'Senior Backend Engineer',
  'Java Developer',
  'Node.js Developer',
  'Python Developer',
  'Golang Developer',
  'C# Developer',
  '.NET Developer',
  'Ruby on Rails Developer',
  'PHP Developer',
  'API Engineer',

  // Full stack
  'Full Stack Engineer',
  'Senior Full Stack Engineer',
  'Full Stack Developer', // common alternate title
  'Lead Full Stack Engineer',

  // Data / ML
  'Data Engineer',
  'Senior Data Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'ML Engineer',
  'AI Engineer',
  'Generative AI Engineer',
  'LLM Engineer',
  'Deep Learning Engineer',
  'MLOps Engineer',
  'Data Architect',
  'Research Scientist (AI/ML)',

  // DevOps / infra
  'DevOps Engineer',
  'Site Reliability Engineer',
  'SRE',
  'Cloud Engineer',
  'Platform Engineer',
  'DevSecOps Engineer',
  'Infrastructure Engineer',
  'Build and Release Engineer',
  'Systems Engineer',

  // Mobile
  'Android Engineer',
  'iOS Engineer',
  'Mobile Engineer',
  'React Native Developer',
  'Flutter Developer',

  // Product / QA / security
  'Product Manager',
  'Technical Product Manager',
  'QA Engineer',
  'Automation Engineer',
  'Security Engineer',
  'Application Security Engineer',
  'Product Owner',
  'Business Analyst',
  'Manual QA Tester',
  'Performance Test Engineer',
  'Test Automation Architect',
  'Cybersecurity Engineer',
  'Cloud Security Engineer',
  'Security Analyst',
  'Security Architect',
]

// Reusable input + dropdown suggestions component
type SuggestInputProps = {
  label: string
  required?: boolean
  placeholder?: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function SuggestInput({
  label,
  required,
  placeholder,
  value,
  options,
  onChange,
}: SuggestInputProps) {
  const [isOpen, setIsOpen] = useState(false)

  const normalized = value.trim().toLowerCase()
  const filtered =
    normalized.length === 0
      ? options
      : options.filter((opt) => opt.toLowerCase().includes(normalized))

  const showDropdown = isOpen && filtered.length > 0

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      <div className="relative">
        <input
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // small delay so click on option can register
            setTimeout(() => setIsOpen(false), 100)
          }}
        />

        {showDropdown && (
          <div
            className="
              absolute z-20 mt-1 max-h-48 w-full overflow-auto
              rounded-md border border-slate-800 bg-slate-950
              text-xs text-slate-100 shadow-lg shadow-black/40
            "
          >
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                className="
                  block w-full px-3 py-1.5 text-left
                  hover:bg-slate-800/80
                "
                onMouseDown={(e) => {
                  // prevent blur before click
                  e.preventDefault()
                  onChange(opt)
                  setIsOpen(false)
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Applications() {
  useTitle('Applications')

  // Helper to get today's date in local YYYY-MM-DD
  function getTodayStr() {
    const today = new Date()
    const tzOffset = today.getTimezoneOffset()
    const local = new Date(today.getTime() - tzOffset * 60000)
    return local.toISOString().slice(0, 10)
  }

  const [apps, setApps] = useState<JobApp[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [form, setForm] = useState<Partial<JobApp>>({
    company: '',
    position: '',
    status: 'APPLIED',
    jobLink: '',
    notes: '',
    nextActionDate: getTodayStr(), // default to today
  })

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  // --- EDITING STATE (including files) ---
  const [editing, setEditing] = useState<JobApp | null>(null)
  const [editForm, setEditForm] = useState<Partial<JobApp>>({})
  const [editResumeFile, setEditResumeFile] = useState<File | null>(null)
  const [editCoverLetterFile, setEditCoverLetterFile] = useState<File | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // --- FILTER STATE ---
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL')
  const statusFilters: Array<'ALL' | Status> = [
    'ALL',
    'APPLIED',
    'INTERVIEW',
    'REJECTED',
    'OFFER',
  ]

  // --- SEARCH + DATE FILTER STATE ---
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const loadApps = () => api.get('/apps').then((r) => setApps(r.data))
  const loadRems = () => api.get('/reminders').then((r) => setReminders(r.data))

  useEffect(() => {
    loadApps()
    loadRems()
  }, [])

  // --- DERIVED: FILTERED APPS (STATUS + SEARCH + DATE) ---
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredApps = apps.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter

    const matchesSearch =
      !normalizedSearch ||
      a.company.toLowerCase().includes(normalizedSearch) ||
      a.position.toLowerCase().includes(normalizedSearch)

    const matchesDate = !selectedDate || a.nextActionDate === selectedDate

    return matchesStatus && matchesSearch && matchesDate
  })

  // --- PAGINATION STATE ---
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const totalFiltered = filteredApps.length
  const totalPages = totalFiltered === 0 ? 1 : Math.ceil(totalFiltered / pageSize)

  useEffect(() => {
    // Clamp current page when filters or page size change
    const newTotalPages = totalFiltered === 0 ? 1 : Math.ceil(totalFiltered / pageSize)
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
  }, [totalFiltered, pageSize, currentPage])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedApps = filteredApps.slice(startIndex, endIndex)

  const showingFrom = totalFiltered === 0 ? 0 : startIndex + 1
  const showingTo = Math.min(endIndex, totalFiltered)

  const handlePresetPageSizeChange = (value: number) => {
    setPageSize(value)
    setCurrentPage(1)
  }

  // --- EXPORT TO EXCEL ---
  const exportToExcel = () => {
    if (!apps.length) {
      alert('No applications to export yet.')
      return
    }

    const rows = apps.map((a) => ({
      Company: a.company,
      Position: a.position,
      Status: a.status,
      'Job Link': a.jobLink || '',
      'Applied Date': (a as any).nextActionDate || '',
      Notes: (a as any).notes || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications')
    XLSX.writeFile(workbook, 'applications.xlsx')
  }

  // --- AUTHENTICATED FILE VIEWER ---
  const viewFile = async (url: string) => {
    const newTab = window.open('', '_blank')
    if (!newTab) return
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) { newTab.close(); return }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      newTab.location.href = blobUrl
    } catch {
      newTab.close()
    }
  }

  // --- CREATE NEW APPLICATION (multipart/form-data) ---
  const save = async () => {
    const {
      company = '',
      position = '',
      status = 'APPLIED',
      jobLink = '',
      notes = '',
      nextActionDate,
    } = form

    if (!company.trim() || !position.trim() || !jobLink.trim()) {
      alert('Please fill in Company, Position, and Job Link before adding an application.')
      return
    }

    const normalizedJobLink = normalizeUrl(jobLink)

    if (!isValidUrl(normalizedJobLink)) {
      alert('Please paste a valid job URL (e.g. https://careers.example.com/role).')
      return
    }

    if (!resumeFile) {
      alert('Please upload a resume for this application.')
      return
    }

    const formData = new FormData()
    formData.append('company', company)
    formData.append('position', position)
    formData.append('status', status)
    formData.append('jobLink', normalizedJobLink) // use normalized URL
    formData.append('notes', notes)
    if (nextActionDate) formData.append('nextActionDate', nextActionDate)

    formData.append('resume', resumeFile)
    if (coverLetterFile) {
      formData.append('coverLetter', coverLetterFile)
    }

    try {
      setSaving(true)

      await api.post('/apps', formData)

      setForm({
        company: '',
        position: '',
        status: 'APPLIED',
        jobLink: '',
        notes: '',
        nextActionDate: getTodayStr(), // reset to today
      })
      setResumeFile(null)
      setCoverLetterFile(null)

      const resumeInput = document.getElementById('resume-input') as HTMLInputElement | null
      if (resumeInput) resumeInput.value = ''

      const coverInput = document.getElementById('cover-input') as HTMLInputElement | null
      if (coverInput) coverInput.value = ''

      loadApps()
    } catch (err: any) {
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        alert('Failed to save application. Please try again.')
      }
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // --- START / CANCEL EDITING ---
  const startEdit = (app: JobApp) => {
    setEditing(app)
    setEditForm({
      company: app.company,
      position: app.position,
      status: app.status,
      jobLink: app.jobLink,
      notes: (app as any).notes ?? '',
      nextActionDate: (app as any).nextActionDate ?? '',
    })
    setEditResumeFile(null)
    setEditCoverLetterFile(null)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditForm({})
    setEditResumeFile(null)
    setEditCoverLetterFile(null)
    setSavingEdit(false)
  }

  // --- SAVE EDITED APPLICATION (JSON PATCH + optional multipart for files) ---
  const saveEdit = async () => {
    if (!editing) return

    const {
      company = '',
      position = '',
      status = 'APPLIED',
      jobLink = '',
      notes = '',
      nextActionDate,
    } = editForm

    if (!company.trim() || !position.trim() || !jobLink.trim()) {
      alert('Please fill in Company, Position, and Job Link.')
      return
    }

    // normalize + validate edited URL
    const normalizedJobLink = normalizeUrl(jobLink)

    if (!isValidUrl(normalizedJobLink)) {
      alert('Please paste a valid job URL (e.g. https://careers.example.com/role).')
      return
    }

    try {
      setSavingEdit(true)

      await api.patch(`/apps/${editing.id}`, {
        company,
        position,
        status,
        jobLink: normalizedJobLink, // use normalized URL
        notes,
        nextActionDate,
      })

      if (editResumeFile || editCoverLetterFile) {
        const fd = new FormData()
        if (editResumeFile) fd.append('resume', editResumeFile)
        if (editCoverLetterFile) fd.append('coverLetter', editCoverLetterFile)

        await api.patch(`/apps/${editing.id}/files`, fd)
      }

      await loadApps()
      cancelEdit()
    } catch (err: any) {
      const statusCode = err?.response?.status
      if (statusCode !== 401 && statusCode !== 403) {
        alert('Update failed. Please try again.')
      }
      console.error(err)
    } finally {
      setSavingEdit(false)
    }
  }

  // --- existing quick status update (JSON only) ---
  const update = async (id: number, patch: Partial<JobApp>) => {
    try {
      await api.patch(`/apps/${id}`, patch)
      await loadApps()
    } catch (err: any) {
      const status = err?.response?.status
      if (status !== 401 && status !== 403) {
        alert('Update failed. Please try again.')
      }
      console.error(err)
    }
  }

  const remove = async (id: number) => {
    await api.delete(`/apps/${id}`)
    loadApps()
    loadRems()
  }

  const remsFor = (appId: number) => reminders.filter((r) => r.application.id === appId)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Applications
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track applications, notes, reminders, and attachments in one place.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 font-mono text-center">
              ● {apps.length} application{apps.length === 1 ? '' : 's'} tracked
            </div>
          </div>
        </header>

        {/* Form card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/60">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono">
              NEW APPLICATION
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Company: single input with dropdown suggestions */}
            <SuggestInput
              label="Company"
              required
              placeholder="Start typing or pick a company..."
              value={form.company || ''}
              options={POPULAR_COMPANIES}
              onChange={(value) => setForm({ ...form, company: value })}
            />

            {/* Position: single input with dropdown suggestions */}
            <SuggestInput
              label="Position"
              required
              placeholder="Start typing or pick a position..."
              value={form.position || ''}
              options={POPULAR_POSITIONS}
              onChange={(value) => setForm({ ...form, position: value })}
            />

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Status</label>
              <select
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                value={form.status as Status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Status })
                }
              >
                {['APPLIED', 'INTERVIEW', 'REJECTED', 'OFFER'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Applied date (DatePicker) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Applied date</label>
              <DatePicker
                selected={
                  form.nextActionDate ? parseLocalDate(form.nextActionDate) : new Date()
                }
                onChange={(date) =>
                  setForm({
                    ...form,
                    nextActionDate: date ? formatLocalDate(date) : '',
                  })
                }
                showIcon
                toggleCalendarOnIconClick
                iconClassName="react-datepicker__calendar-icon"
                wrapperClassName="w-full relative"
                className="
                  w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pl-3 pr-10 text-sm
                  text-slate-200 font-mono outline-none
                  focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
                "
                calendarClassName="react-datepicker"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-300">
                Job link <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                placeholder="https://..."
                value={form.jobLink || ''}
                onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-300">Notes</label>
              <textarea
                className="min-h-[70px] w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                placeholder="Talking points, salary range, recruiter details, etc."
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {/* Resume */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Resume <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('resume-input')?.click()}
                  className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-xs font-mono font-medium text-slate-950 hover:bg-sky-400"
                >
                  Choose file
                </button>
                <span className="text-[11px] text-slate-400 font-mono truncate">
                  {resumeFile ? resumeFile.name : 'No file selected'}
                </span>
              </div>
              <input
                id="resume-input"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-[11px] text-slate-500">Accepted: PDF, DOC, DOCX</p>
            </div>

            {/* Cover letter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Cover letter (optional)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('cover-input')?.click()}
                  className="
                    inline-flex items-center rounded-md
                    border border-slate-700 bg-slate-900/80
                    px-3 py-1.5 text-xs font-mono font-medium text-slate-100
                    hover:bg-slate-800/90 hover:border-sky-400/70
                    transition
                  "
                >
                  Choose file
                </button>
                <span className="text-[11px] text-slate-400 font-mono truncate">
                  {coverLetterFile ? coverLetterFile.name : 'No file selected'}
                </span>
              </div>
              <input
                id="cover-input"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) =>
                  setCoverLetterFile(e.target.files?.[0] ?? null)
                }
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-1">
              <button
                className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-mono font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Add application'}
              </button>
            </div>
          </div>
        </section>

{/* FILTER + EXPORT BAR + SEARCH + DATE FILTER */}
<section className="mt-4">
  <div className="flex flex-col gap-2">
    {/* ROW 1: search + export + status filters (right aligned) */}
    <div className="flex flex-wrap items-center justify-end gap-2">
      {/* Search input: grows to use remaining space, but won't overflow */}
      <div className="flex-1 min-w-[140px] max-w-xs md:max-w-sm lg:max-w-md">
        <input
          type="text"
          placeholder="Search by company or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            rounded-full border border-slate-700 bg-slate-950/80
            px-3 py-1.5 text-[11px] font-mono text-slate-100
            placeholder:text-slate-500
            outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400
          "
        />
      </div>

      {/* Export button */}
      <button
        type="button"
        onClick={exportToExcel}
        className="
          flex-none
          inline-flex items-center justify-center gap-1
          rounded-full border border-emerald-500/70 bg-emerald-500/10
          px-3 py-1.5 text-[11px] font-mono font-medium
          text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-100
          transition
        "
      >
        <span className="text-xs">📊</span>
        <span>Export to Excel</span>
      </button>

      {/* Status filters */}
      {statusFilters.map((f) => {
        const isActive = statusFilter === f
        const label = f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()
        return (
          <button
            key={f}
            type="button"
            onClick={() => {
              setStatusFilter(f)
              setCurrentPage(1)
            }}
            className={`
              flex-none
              rounded-full px-2.5 py-1 border text-[11px] font-mono transition
              ${
                isActive
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                  : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:border-slate-500 hover:text-slate-100'
              }
            `}
          >
            {label}
          </button>
        )
      })}
    </div>

    {/* ROW 2: date filter – right aligned */}
    <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] font-mono">
      <span className="text-slate-400">Applied date: search by date</span>

      <DatePicker
        selected={selectedDate ? parseLocalDate(selectedDate) : null}
        onChange={(date) => {
          const value = date ? formatLocalDate(date) : null
          setSelectedDate(value)
          setCurrentPage(1)
        }}
        placeholderText="Select a date"
        showIcon
        toggleCalendarOnIconClick
        iconClassName="react-datepicker__calendar-icon"
        wrapperClassName="relative"
        className="
          w-40
          rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pl-3 pr-10
          text-sm text-slate-200 font-mono outline-none
          focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
        "
        calendarClassName="react-datepicker"
      />
    </div>
  </div>
</section>


        {/* Table card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/60">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono">
              YOUR APPLICATIONS
            </h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/70">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400 font-mono">
                <tr>
                  <th className="px-3 py-2 text-left">Company / Notes</th>
                  <th className="px-3 py-2 text-left">Position</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Applied date</th>
                  <th className="px-3 py-2 text-center">Attachments</th>
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedApps.map((a, i) => (
                  <Fragment key={a.id}>
                    {/* MAIN ROW */}
                    <tr
                      className={`border-t border-slate-800/70 ${
                        i % 2 === 1 ? 'bg-slate-900/40' : ''
                      }`}
                    >
                      <td className="px-3 py-3 align-top">
                        <div className="font-medium text-slate-50">
                          <a
                            href={a.jobLink || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-100 font-mono"
                          >
                            <span>{a.company}</span>
                            <span className="text-[10px] text-sky-500/70">🔗</span>
                          </a>
                        </div>

                        {a.notes && (
                          <p className="mt-1 text-xs text-slate-400">
                            <span className="font-semibold text-slate-300">Notes:</span>{' '}
                            {a.notes}
                          </p>
                        )}

                        {remsFor(a.id).length > 0 && (
                          <div className="mt-2 text-xs text-slate-400">
                            <div className="font-semibold text-slate-300">Reminders</div>
                            <ul className="ml-4 list-disc">
                              {remsFor(a.id).map((r) => (
                                <li key={r.id}>
                                  {new Date(r.remindAt).toLocaleString()} — {r.message}
                                  {r.sent && (
                                    <span className="ml-1 text-emerald-400/90">(sent)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3 align-top text-slate-100">
                        {a.position}
                      </td>

                      <td className="px-3 py-3 align-top text-center">
                        <StatusBadge status={a.status} />
                      </td>

                      <td className="px-3 py-3 align-top text-center text-xs text-slate-300">
                        {a.nextActionDate || '-'}
                      </td>

                      <td className="px-3 py-3 align-top text-center text-xs text-slate-300">
                        <div className="space-y-1">
                          {a.resumeUrl ? (
                            <button
                              onClick={() => viewFile(a.resumeUrl!)}
                              className="inline-flex items-center justify-center rounded-full border border-sky-400/60 bg-sky-500/10 px-2 py-0.5 text-[11px] font-mono font-medium text-sky-200 hover:bg-sky-500/20"
                            >
                              Resume
                            </button>
                          ) : (
                            <span className="text-slate-500">No resume</span>
                          )}

                          {a.coverLetterUrl ? (
                            <button
                              onClick={() => viewFile(a.coverLetterUrl!)}
                              className="ml-1 inline-flex items-center justify-center rounded-full border border-slate-500/60 bg-slate-600/20 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-100 hover:bg-slate-500/30"
                            >
                              Cover letter
                            </button>
                          ) : (
                            <div className="text-[11px] text-slate-500">
                              No cover letter
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3 align-top text-center text-xs">
                        <div className="space-y-2">
                          <select
                            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                            value={a.status}
                            onChange={(e) =>
                              update(a.id, { status: e.target.value as any })
                            }
                          >
                            {['APPLIED', 'INTERVIEW', 'REJECTED', 'OFFER'].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>

                          <button
                            className="w-full rounded-md border border-slate-700 bg-slate-600/30 px-2 py-1 text-[11px] font-mono font-medium text-slate-100 hover:bg-slate-500/40"
                            onClick={() => startEdit(a)}
                          >
                            Edit
                          </button>

                          <button
                            className="w-full rounded-md border border-rose-500/70 bg-rose-500/10 px-2 py-1 text-[11px] font-mono font-medium text-rose-200 hover:bg-rose-500/20"
                            onClick={() => remove(a.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* FULL-WIDTH REMINDER ROW */}
                    <tr className={i % 2 === 1 ? 'bg-slate-900/40' : ''}>
                      <td colSpan={6} className="px-3 pb-4">
                        <ReminderInline
                          applicationId={a.id}
                          onCreated={() => loadRems()}
                        />
                      </td>
                    </tr>
                  </Fragment>
                ))}

                {filteredApps.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-xs text-slate-500 font-mono"
                    >
                      {apps.length === 0
                        ? 'No applications yet. Add your first one above to get started.'
                        : 'No applications match this filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination controls */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/80 px-3 py-3 text-[11px] text-slate-400 md:flex-row">
              {/* Page size controls */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono">Rows per page:</span>
                <select
                  className="
                    rounded-md border border-slate-700 bg-slate-950
                    px-2 py-1 text-[11px] font-mono text-slate-100
                    outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400
                  "
                  value={pageSize}
                  onChange={(e) => handlePresetPageSizeChange(Number(e.target.value))}
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-3 font-mono">
                <span>
                  Showing {showingFrom}-{showingTo} of {totalFiltered || 0}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || totalFiltered === 0}
                    className={`
                      rounded-md border px-2 py-1
                      ${
                        currentPage <= 1 || totalFiltered === 0
                          ? 'cursor-not-allowed border-slate-800 text-slate-600 bg-slate-900/80'
                          : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-sky-400 hover:text-sky-100'
                      }
                    `}
                  >
                    Prev
                  </button>
                  <span className="px-1 text-slate-500">
                    Page {totalFiltered === 0 ? 0 : currentPage} of{' '}
                    {totalFiltered === 0 ? 0 : totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages || totalFiltered === 0}
                    className={`
                      rounded-md border px-2 py-1
                      ${
                        currentPage >= totalPages || totalFiltered === 0
                          ? 'cursor-not-allowed border-slate-800 text-slate-600 bg-slate-900/80'
                          : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-sky-400 hover:text-sky-100'
                      }
                    `}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* EDIT MODAL (with file inputs) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono">
                EDIT APPLICATION
              </h2>
              <button
                className="text-xs text-slate-400 hover:text-slate-200 font-mono"
                onClick={cancelEdit}
                disabled={savingEdit}
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {/* Edit Company: single input with suggestions */}
              <SuggestInput
                label="Company"
                required
                placeholder="Start typing or pick a company..."
                value={editForm.company || ''}
                options={POPULAR_COMPANIES}
                onChange={(value) => setEditForm({ ...editForm, company: value })}
              />

              {/* Edit Position: single input with suggestions */}
              <SuggestInput
                label="Position"
                required
                placeholder="Start typing or pick a position..."
                value={editForm.position || ''}
                options={POPULAR_POSITIONS}
                onChange={(value) => setEditForm({ ...editForm, position: value })}
              />

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Status</label>
                <select
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  value={editForm.status as Status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value as Status })
                  }
                >
                  {['APPLIED', 'INTERVIEW', 'REJECTED', 'OFFER'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Applied date
                </label>
                <DatePicker
                  selected={
                    editForm.nextActionDate
                      ? parseLocalDate(editForm.nextActionDate)
                      : null
                  }
                  onChange={(date) =>
                    setEditForm({
                      ...editForm,
                      nextActionDate: date ? formatLocalDate(date) : '',
                    })
                  }
                  dateFormat="yyyy-MM-dd"
                  showIcon
                  toggleCalendarOnIconClick
                  iconClassName="react-datepicker__calendar-icon"
                  wrapperClassName="w-full relative"
                  className="
                    w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pl-3 pr-10
                    text-sm text-slate-200 font-mono outline-none
                    focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400
                  "
                  calendarClassName="react-datepicker"
                  placeholderText="Select applied date"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Job link</label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  value={editForm.jobLink || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, jobLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Notes</label>
                <textarea
                  className="min-h-[70px] w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  value={editForm.notes || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                />
              </div>

              {/* EDIT RESUME */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Resume <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('edit-resume-input')?.click()
                    }
                    className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-xs font-mono font-medium text-slate-950 hover:bg-sky-400"
                  >
                    Choose file
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {editResumeFile
                      ? editResumeFile.name
                      : editing?.resumeUrl
                      ? 'Existing file in use'
                      : 'No file selected'}
                  </span>
                </div>
                <input
                  id="edit-resume-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setEditResumeFile(e.target.files?.[0] ?? null)}
                />
                {editing?.resumeUrl && !editResumeFile && (
                  <p className="text-[11px] text-slate-400">
                    Current:{' '}
                    <button
                      onClick={() => viewFile(editing!.resumeUrl!)}
                      className="underline decoration-sky-400/70 underline-offset-2 hover:text-sky-300"
                    >
                      view existing resume
                    </button>
                    . If you don&apos;t pick a new file, the existing one stays.
                  </p>
                )}
              </div>

              {/* EDIT COVER LETTER */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Cover letter (optional)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('edit-cover-input')?.click()
                    }
                    className="
                      inline-flex items-center rounded-md
                      border border-slate-700 bg-slate-900/80
                      px-3 py-1.5 text-xs font-mono font-medium text-slate-100
                      hover:bg-slate-800/90 hover:border-sky-400/70
                      transition
                    "
                  >
                    Choose file
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {editCoverLetterFile
                      ? editCoverLetterFile.name
                      : editing?.coverLetterUrl
                      ? 'Existing file in use'
                      : 'No file selected'}
                  </span>
                </div>
                <input
                  id="edit-cover-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) =>
                    setEditCoverLetterFile(e.target.files?.[0] ?? null)
                  }
                />
                {editing?.coverLetterUrl && !editCoverLetterFile && (
                  <p className="text-[11px] text-slate-400">
                    Current:{' '}
                    <button
                      onClick={() => viewFile(editing!.coverLetterUrl!)}
                      className="underline decoration-sky-400/70 underline-offset-2 hover:text-sky-300"
                    >
                      view existing cover letter
                    </button>
                    . If you don&apos;t pick a new file, the existing one stays.
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-1">
                <button
                  className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-mono text-slate-200 hover:bg-slate-800"
                  onClick={cancelEdit}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-mono font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800"
                  onClick={saveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
