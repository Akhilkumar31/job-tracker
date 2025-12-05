import { useEffect, useState } from 'react'
import api from '../api/http'
import { useTitle } from '../hooks/useTitle'
import { parseLocalDate } from '../utils/dateUtils'

type ProfileData = {
  email: string
  displayName: string | null
  joinedAt: string | null
  applicationsCount: number
  wishlistCount: number
  reminderEmail: string | null
  defaultReminderMessage: string | null
  currentCompany: string | null
  dateOfBirth: string | null
}

export default function Profile() {
  useTitle('Profile')

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<ProfileData>('/me/profile')
      .then((r) => {
        setProfile(r.data)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load profile.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-slate-200">
        <p className="text-sm text-slate-400">Loading profile…</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-slate-200">
        <p className="text-sm text-red-400">{error ?? 'Profile unavailable.'}</p>
      </div>
    )
  }

  const {
    email,
    displayName,
    joinedAt,
    applicationsCount,
    wishlistCount,
    reminderEmail,
    defaultReminderMessage,
    currentCompany,
    dateOfBirth,
  } = profile

  const safeName = displayName || 'User'
  const joinLabel = joinedAt
  ? (/^\d{4}-\d{2}-\d{2}$/.test(joinedAt)
      ? parseLocalDate(joinedAt).toLocaleDateString()
      : new Date(joinedAt).toLocaleDateString())
  : 'Unknown'

  const dobLabel = dateOfBirth
  ? (/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)
      ? parseLocalDate(dateOfBirth).toLocaleDateString()
      : new Date(dateOfBirth).toLocaleDateString())
  : 'Not set'
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-100">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your JobTracker account details and usage overview.
        </p>
      </header>

      <div className="space-y-6">
        {/* Identity & account */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/95 shadow-sm">
          <div className="border-b border-slate-800 px-4 py-3">
            <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-slate-400">
              ACCOUNT
            </h2>
          </div>
          <div className="grid gap-4 px-4 py-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">USERNAME</p>
              <p className="text-sm max-w-[14rem] truncate">{safeName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">EMAIL (LOGIN)</p>
              <p className="text-sm">{email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">JOINED JOBTRACKER</p>
              <p className="text-sm">{joinLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">DATE OF BIRTH</p>
              <p className="text-sm">{dobLabel}</p>
            </div>
          </div>
        </section>

        {/* Activity stats */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/95 shadow-sm">
          <div className="border-b border-slate-800 px-4 py-3">
            <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-slate-400">
              ACTIVITY
            </h2>
          </div>
          <div className="grid gap-4 px-4 py-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">APPLICATIONS SAVED</p>
              <p className="text-2xl font-semibold text-emerald-400">{applicationsCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">WISHLISTED JOBS</p>
              <p className="text-2xl font-semibold text-sky-400">{wishlistCount}</p>
            </div>
          </div>
        </section>

        {/* Work & reminders */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/95 shadow-sm">
          <div className="border-b border-slate-800 px-4 py-3">
            <h2 className="text-sm font-mono uppercase tracking-[0.18em] text-slate-400">
              WORK & REMINDERS
            </h2>
          </div>
          <div className="grid gap-4 px-4 py-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">CURRENT COMPANY</p>
              <p className="text-sm">
                {currentCompany && currentCompany.trim().length > 0
                  ? currentCompany
                  : 'Not set'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">REMINDER EMAIL</p>
              <p className="text-sm">
                {reminderEmail && reminderEmail.trim().length > 0
                  ? reminderEmail
                  : email}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 px-4 py-4">
            <p className="text-xs font-mono text-slate-500 mb-1">
              DEFAULT REMINDER MESSAGE
            </p>
            <div className="rounded-xl border border-slate-800 bg-black/50 px-3 py-2 text-sm text-slate-100 whitespace-pre-wrap">
              {defaultReminderMessage && defaultReminderMessage.trim().length > 0
                ? defaultReminderMessage
                : 'Follow up on this application'}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
