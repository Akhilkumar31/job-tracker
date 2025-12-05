import { useState } from 'react'
import api from '../api/http'
import { useTitle } from '../hooks/useTitle'

export default function ResumeMatch() {
  useTitle('Resume Match') // -> "Resume Match | Job Tracker"

  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResumeUpload = async (file: File) => {
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    // If it's plain text, read on the client
    if (ext === 'txt' || file.type === 'text/plain') {
      try {
        const text = await file.text()
        setResume(text)
        setError(null)
      } catch {
        setError('Could not read the text file. Please try again.')
      }
      return
    }

    // For PDF / Word, send to backend for extraction
    const formData = new FormData()
    formData.append('file', file)

    try {
      setError(null)
      const { data } = await api.post('/ai/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.text) {
        setResume(data.text)
      } else {
        setError('No text could be extracted from this file.')
      }
    } catch (err) {
      console.error(err)
      setError(
        'Unable to extract text from this file. Try another format or paste your resume manually.'
      )
    }
  }

  const run = async () => {
    if (!resume.trim() || !jd.trim()) return
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const { data } = await api.post('/ai/match', {
        resumeText: resume,
        jobDescription: jd,
      })
      setResult(data)
    } catch (err) {
      console.error(err)
      setError('Something went wrong while analyzing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !resume.trim() || !jd.trim()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          AI Resume Keyword Match
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your resume or paste it into the VS Code–style editor, paste the job description,
          and see how well they match.
        </p>
      </header>

{/* Upload Resume */}
<div className="mb-6">
  <label className="text-sm font-medium text-slate-300 mb-2 block">
    Upload Resume (PDF, Word, or TXT)
  </label>

  <div className="flex items-center gap-3">
    {/* Custom upload button */}
    <button
      type="button"
      onClick={() => document.getElementById('resumeUploader')?.click()}
      className="
        bg-emerald-500 hover:bg-emerald-400
        text-slate-950 font-mono text-sm
        px-4 py-2 rounded-md
        transition
      "
    >
      Choose File
    </button>

    {/* Filename display */}
    <span className="text-sm text-slate-400 font-mono">
      {resume.trim()
        ? 'File Loaded'
        : 'No file selected'}
    </span>
  </div>

  {/* Hidden file input */}
  <input
    id="resumeUploader"
    type="file"
    accept=".pdf,.txt,.doc,.docx"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0]
      if (file) void handleResumeUpload(file)
    }}
  />

  <p className="text-xs mt-2 text-slate-500">
    TXT files are processed in the browser. PDF/Word files are sent securely to the server for extraction.
  </p>
</div>


      {/* Main panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-sm overflow-hidden">
        {/* Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-900">
          {/* Resume editor */}
          <div className="flex flex-col bg-slate-950">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wide text-[11px]">
                RESUME (EDITABLE)
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Plain text • UTF-8
              </span>
            </div>
            <textarea
              className="
                flex-1 min-h-[260px]
                font-mono text-[13px] leading-relaxed
                bg-slate-950
                text-slate-100
                placeholder:text-slate-500
                px-3 py-3
                outline-none
                border-none
                resize-y
                caret-emerald-400
                focus:ring-0
              "
              spellCheck={false}
              placeholder="// Paste your resume text here or upload a file above"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>

          {/* Job description editor */}
          <div className="flex flex-col bg-slate-950">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wide text-[11px]">
                JOB DESCRIPTION
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Plain text • UTF-8
              </span>
            </div>
            <textarea
              className="
                flex-1 min-h-[260px]
                font-mono text-[13px] leading-relaxed
                bg-slate-950
                text-slate-100
                placeholder:text-slate-500
                px-3 py-3
                outline-none
                border-none
                resize-y
                caret-emerald-400
                focus:ring-0
              "
              spellCheck={false}
              placeholder="// Paste the job description here"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>
        </div>

        {/* Bottom bar / actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-800 bg-slate-900/90 px-4 py-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
              <span>AI engine ready</span>
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline">
              Tip: edit your resume to naturally include relevant keywords, don&apos;t just stuff
              them.
            </span>
          </div>

          <button
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-xs md:text-sm font-medium font-mono tracking-wide transition
              ${
                isDisabled
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-900'
              }
            `}
            onClick={run}
            disabled={isDisabled}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                RUN ANALYSIS
              </>
            ) : (
              'RUN ANALYSIS'
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/60 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <section className="mt-6 space-y-4">
          {/* Score */}
          {'score' in result && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-emerald-400">
                MATCH SCORE
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Alignment between your resume and the job description based on extracted keywords.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-2xl font-semibold text-emerald-400 font-mono shadow-inner shadow-emerald-500/30">
                {Math.round(Number(result.score) || 0)}%
              </span>
            </div>
          </div>
        )}

        {/* Missing keywords */}
        {Array.isArray(result.missing_keywords) && result.missing_keywords.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
            <p className="text-xs font-mono uppercase tracking-wide text-amber-400">
              MISSING / WEAK KEYWORDS
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Consider adding these keywords if they genuinely match your skills and experience.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.missing_keywords.map((kw: string) => (
                <span
                  key={kw}
                  className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-mono text-amber-200 border border-amber-500/40"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Raw response */}
        <details className="mt-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
          <summary className="cursor-pointer font-mono text-xs text-slate-400">
            ▶ Show raw AI response (JSON)
          </summary>
          <pre className="mt-2 overflow-auto rounded-md bg-black/80 p-3 text-xs text-emerald-300 font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      </section>
    )}
  </div>
  )
}
