import { useState } from 'react'
import api from '../api/http'
import { CreateReminderReq } from '../types'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toLocalISOString } from '../utils/dateUtils'

export default function ReminderInline({
  applicationId,
  onCreated,
}: {
  applicationId: number
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [when, setWhen] = useState<Date | null>(null)
  const [msg, setMsg] = useState('Follow up on this application')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!when) {
      alert('Choose a date & time')
      return
    }

    try {
      setSaving(true)
      const payload: CreateReminderReq = {
        applicationId,
        remindAt: toLocalISOString(when),
        message: msg,
      }
      await api.post('/reminders', payload)
      onCreated()
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[12px] font-mono text-emerald-300 hover:bg-emerald-500/20"
      >
        <span className="mr-1 text-emerald-400">+</span>
        Reminder
      </button>
    )
  }

  return (
    <div className="mt-3 w-full rounded-2xl border border-slate-800 bg-slate-950/95 px-4 py-4 text-xs text-slate-100">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
          New reminder
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {/* Date + time */}
        <div className="w-full md:max-w-sm">
          <label className="mb-1 block text-[11px] font-mono text-slate-300">
            Remind at (date &amp; time)
          </label>
          <DatePicker
            selected={when}
            onChange={(date) => setWhen(date)}
            showTimeSelect
            timeIntervals={30}
            timeCaption="Time"
            dateFormat="yyyy-MM-dd HH:mm"
            showIcon
            toggleCalendarOnIconClick
            iconClassName="react-datepicker__calendar-icon"
            wrapperClassName="w-full relative"
            className="
              w-full rounded-md border border-slate-800 bg-slate-950
              px-3 py-2.5 pr-10 text-sm font-mono text-slate-100
              outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
            "
            calendarClassName="react-datepicker"
            placeholderText="Select date & time"
          />
        </div>

        {/* Message */}
        <div className="w-full flex-1">
          <label className="mb-1 block text-[11px] font-mono text-slate-300">
            Reminder message
          </label>
          <textarea
            className="
              w-full rounded-md border border-slate-800 bg-slate-950
              px-3 py-3 text-sm font-mono text-slate-100
              outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
            "
            rows={3}
            placeholder="Reminder message"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-mono font-medium text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-mono text-slate-200 hover:bg-slate-800 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
