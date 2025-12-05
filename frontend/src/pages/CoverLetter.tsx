import { useState } from 'react'
import api from '../api/http'
import { useTitle } from '../hooks/useTitle'

export default function CoverLetter() {
  useTitle('Cover Letter') // -> "Cover Letter | Job Tracker"

  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Same behavior as ResumeMatch: TXT in browser, PDF/Word via backend
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

  const generate = async () => {
    if (!resume.trim() || !jd.trim()) return

    try {
      setLoading(true)
      setError(null)
      setCoverLetter('')

      // Backend endpoint you create in Spring Boot
      const { data } = await api.post('/ai/cover-letter', {
        resumeText: resume,
        jobDescription: jd,
      })

      // We assume backend returns plain string (the letter)
      setCoverLetter(typeof data === 'string' ? data : String(data))
    } catch (err) {
      console.error(err)
      setError('Something went wrong while generating the cover letter. Please try again.')
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
          AI Cover Letter Generator
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your resume or paste it into the VS Code–style editor, paste the job description,
          and get a tailored cover letter.
        </p>
      </header>

      {/* Upload Resume — same style as ResumeMatch */}
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
          <span className="text-xs md:text-sm text-slate-400">
            <span className="font-mono text-emerald-300">.pdf</span>,{' '}
            <span className="font-mono text-emerald-300">.docx</span>, or{' '}
            <span className="font-mono text-emerald-300">.txt</span>
          </span>
        </div>

        {/* Hidden file input */}
        <input
          id="resumeUploader"
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleResumeUpload(file)
          }}
        />

        <p className="text-xs mt-2 text-slate-500">
          TXT files are processed in the browser. PDF/Word files are sent securely to the server for
          extraction.
        </p>
      </div>

      {/* Main panel — same card / colors as ResumeMatch */}
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
                Paste from job posting
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

        {/* Footer / controls – mirrors ResumeMatch style */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
              <span>AI engine ready</span>
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline">
              Tip: mention specific achievements from your resume that match the job.
            </span>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={isDisabled}
            className={`
              inline-flex items-center justify-center
              rounded-md px-4 py-2
              text-xs md:text-sm font-medium font-mono tracking-wide transition
              ${
                isDisabled
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.5)] shadow-emerald-500/30'
              }
            `}
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
                GENERATING...
              </>
            ) : (
              'GENERATE COVER LETTER'
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
      {coverLetter && (
        <section className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4">
            <p className="text-xs font-mono uppercase tracking-wide text-emerald-400">
              GENERATED COVER LETTER
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tailored cover letter based on your resume and the job description.
            </p>

            <div className="mt-3 rounded-xl bg-black/60 border border-slate-800/60 px-4 py-3 text-sm text-slate-100 whitespace-pre-wrap">
              {coverLetter}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
