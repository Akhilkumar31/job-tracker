import { FormEvent, useEffect, useState } from 'react'
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

export default function Settings() {
  useTitle('Settings')

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [reminderEmail, setReminderEmail] = useState('')
  const [defaultReminderMessage, setDefaultReminderMessage] = useState('')
  const [currentCompany, setCurrentCompany] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('') // yyyy-mm-dd

  useEffect(() => {
    api
      .get<ProfileData>('/me/profile')
      .then((r) => {
        const p = r.data
        setProfile(p)
        setDisplayName(p.displayName ?? '')
        setReminderEmail(p.reminderEmail ?? '')
        setDefaultReminderMessage(p.defaultReminderMessage ?? 'Follow up on this application')
        setCurrentCompany(p.currentCompany ?? '')
        setDateOfBirth(p.dateOfBirth ?? '')
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load settings.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    api
      .patch<ProfileData>('/me/profile', {
        displayName,
        reminderEmail,
        defaultReminderMessage,
        currentCompany,
        dateOfBirth: dateOfBirth || null,
      })
      .then((r) => {
        setProfile(r.data)
        setSuccess('Settings saved.')
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to save settings.')
      })
      .finally(() => setSaving(false))
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-slate-200">
        <p className="text-sm text-slate-400">Loading settings…</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-slate-200">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-100">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Update your profile details, reminder preferences, and work information.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-sm"
      >
        {/* Account section */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
            Account
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500">Username</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500">Joined JobTracker</label>
              <input
  type="text"
  value={
    profile?.joinedAt
      ? (/^\d{4}-\d{2}-\d{2}$/.test(profile.joinedAt)
          ? parseLocalDate(profile.joinedAt).toLocaleDateString()
          : new Date(profile.joinedAt).toLocaleDateString())
      : ''
  }
  disabled
  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400"
/>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500">Login email</label>
              <input
                type="text"
                value={profile?.email ?? ''}
                disabled
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500">Date of birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>
        </section>

        {/* Work & reminders */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
            Work & reminders
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500">Current job company</label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                placeholder="e.g. OpenAI"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500">Reminder email</label>
              <input
                type="email"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                placeholder="Defaults to your login email if empty"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500">Default reminder message</label>
            <textarea
              rows={3}
              value={defaultReminderMessage}
              onChange={(e) => setDefaultReminderMessage(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              placeholder="Follow up on this application"
            />
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            {error && <span className="text-red-400 mr-3">{error}</span>}
            {success && <span className="text-emerald-400 mr-3">{success}</span>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center rounded-md px-4 py-2 text-xs md:text-sm font-mono tracking-wide transition ${
              saving
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
