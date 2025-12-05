import { useState, FormEvent } from 'react'
import { useTitle } from '../hooks/useTitle'
import api from '../api/http'

type SupportType = 'QUESTION' | 'BUG' | 'FEATURE' | 'OTHER'

type SupportForm = {
  type: SupportType
  subject: string
  message: string
}

export default function Support() {
  useTitle('Support')

  const [form, setForm] = useState<SupportForm>({
    type: 'QUESTION',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange =
    (field: keyof SupportForm) =>
    (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)
      setError(null)
      setSuccess(null)
    
      try {
        await api.post('/support', {
          type: form.type,
          subject: form.subject,
          message: form.message,
        })
    
        setSuccess('Your message has been sent! We will get back to you soon.')
    
        // Reset form
        setForm({
          type: 'QUESTION',
          subject: '',
          message: '',
        })
      } catch (err) {
        console.error(err)
        setError('Something went wrong while sending your request.')
      } finally {
        setSubmitting(false)
      }
    }
    

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Support
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Stuck, noticed a bug, or want to suggest an improvement? Reach out
              and we&apos;ll get back to you.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-mono text-emerald-200">
            Logged-in support
            <div className="text-[11px] text-emerald-300/80">
              Your account is automatically attached to every request.
            </div>
          </div>
        </header>

        {/* Main content: left = info, right = form */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)]">
          {/* Info / help types */}
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/60">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono">
              HOW WE CAN HELP
            </h2>

            <p className="text-sm text-slate-300">
              Use this page to contact the Job Tracker support team. Common
              reasons:
            </p>

            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-400">●</span>
                <div>
                  <span className="font-medium text-slate-100">
                    Bug or unexpected behavior
                  </span>
                  <div className="text-xs text-slate-400">
                    Something not saving, weird UI behavior, or an error message.
                  </div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-sky-400">●</span>
                <div>
                  <span className="font-medium text-slate-100">
                    Feature request
                  </span>
                  <div className="text-xs text-slate-400">
                    Ideas that would make tracking applications easier for you.
                  </div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-indigo-400">●</span>
                <div>
                  <span className="font-medium text-slate-100">
                    Account or access issues
                  </span>
                  <div className="text-xs text-slate-400">
                    Trouble signing in, questions about your data, or anything
                    account-related.
                  </div>
                </div>
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 font-mono">
                TIPS FOR A FAST RESPONSE
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-slate-300">
                <li>Mention what page you were on (e.g. Applications, Wishlist).</li>
                <li>
                  If it&apos;s a bug, describe the steps you took right before it
                  happened.
                </li>
                <li>
                  Include any error messages you saw – copy/paste is perfect.
                </li>
              </ul>
            </div>
          </section>

          {/* Support form */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/60">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 font-mono">
                CONTACT SUPPORT
              </h2>
            </div>

            {success && (
              <div className="mb-3 rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-3 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Type */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  What do you need help with?
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {([
                    { value: 'QUESTION', label: 'General question' },
                    { value: 'BUG', label: 'Bug / issue' },
                    { value: 'FEATURE', label: 'Feature request' },
                    { value: 'OTHER', label: 'Other' },
                  ] as { value: SupportType; label: string }[]).map((opt) => {
                    const active = form.type === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange('type')(opt.value)}
                        className={`
                          rounded-lg border px-2.5 py-1.5 text-left transition
                          ${
                            active
                              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                              : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Subject <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="Short summary of your question or issue"
                  value={form.subject}
                  onChange={(e) => handleChange('subject')(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="Describe what you were trying to do, what happened, and what you expected instead."
                  value={form.message}
                  onChange={(e) => handleChange('message')(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Your email address from your account will be attached automatically.</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-xs font-mono font-medium text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800"
                >
                  {submitting ? 'Sending...' : 'Send to support'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
