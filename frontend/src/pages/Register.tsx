import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../store/auth'
import { useTitle } from '../hooks/useTitle'

export default function Register() {
  useTitle('Register')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { register } = useAuth()
  const nav = useNavigate()

  // Password must be at least 8 characters, include a number and a special character
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/
  const isPasswordValid = passwordRegex.test(password)
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== ''
  const isFormValid = isPasswordValid && doPasswordsMatch

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Guard: don't submit if invalid
    if (!isFormValid) {
      return
    }

    try {
      setErrorMsg('') // clear any previous error

      await register(email, password)
      nav('/dashboard')
    } catch (err: any) {
      // Expecting backend to send "User already exists" or similar
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        const msg =
          typeof data === 'string'
            ? data
            : data?.message || 'Registration failed. Please try again.'
        setErrorMsg(msg)
      } else {
        setErrorMsg('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div
      className="
        relative left-1/2 -translate-x-1/2 w-screen
        min-h-[calc(100vh-4rem)]
        bg-slate-950
        overflow-hidden
      "
    >
      {/* Big background art – fills whole page (same palette as Login) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/18 blur-3xl" />
        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.35),_transparent_55%)] opacity-70" />
        <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Content */}
      <div
        className="
          relative flex flex-col lg:flex-row items-stretch
          h-full
          px-4 lg:px-8
          py-5 lg:py-4
          gap-5 lg:gap-8
        "
      >
        {/* LEFT HERO – same breadth style as Login, filled with facts + tips */}
        <section
          className="
            flex-[1.5]
            min-w-[55%]
            rounded-3xl border border-slate-800/70
            bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/40
            backdrop-blur-xl
            px-5 sm:px-7 lg:px-8
            py-5 lg:py-6
            shadow-[0_24px_70px_rgba(0,0,0,0.9)]
            flex flex-col justify-between
          "
        >
          {/* Top copy */}
          <div>
            {/* Decorative vertical ribbon + label */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-emerald-400 via-sky-400 to-amber-300" />
              <div className="flex flex-col">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-emerald-300/80">
                  JobTracker
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Create your job search home base
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-semibold text-slate-50 font-mono tracking-tight mb-3">
              Set up your space once,
              <span className="block text-emerald-300">
                reuse it for every application.
              </span>
            </h1>

            <p className="max-w-2xl text-[13px] sm:text-[14px] text-slate-300/95 mb-5">
              With a single account you get a clean board for every role you
              chase. Keep links, notes, interview dates, and follow-ups exactly
              where you expect them instead of buried in tabs and screenshots.
            </p>

            {/* Small “why sign up” cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono mb-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <p className="text-emerald-300 mb-1 font-semibold">One hub</p>
                <p className="text-slate-300">
                  Store every role, company link, and status in one place.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <p className="text-sky-300 mb-1 font-semibold">Clear next step</p>
                <p className="text-slate-300">
                  See what needs attention today, not “sometime this week”.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <p className="text-amber-300 mb-1 font-semibold">Less stress</p>
                <p className="text-slate-300">
                  Turn “I hope I remember” into a simple, visual checklist.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom section – same kind of facts + tips as Login */}
          <div
            className="
              mt-4 grid gap-5
              md:grid-cols-2
              text-[13px] font-mono
            "
          >
            {/* Facts */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-3 font-semibold">
                Job hunt by the numbers
              </p>
              <div className="space-y-2.5 text-[13px] text-slate-200 leading-relaxed">
                <p>
                  <span className="text-emerald-400 font-semibold">1 in 5</span>{' '}
                  applicants never customize their résumé.
                </p>
                <p>
                  <span className="text-sky-400 font-semibold">80%</span> of
                  people stretch the truth on their résumé.
                </p>
                <p>
                  <span className="text-amber-300 font-semibold">65%</span> of
                  jobs aren&apos;t publicly advertised.
                </p>
                <p>
                  <span className="text-rose-300 font-semibold">70%</span> of
                  résumés contain at least one typo.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-3 font-semibold">
                Make your account count
              </p>

              <div className="space-y-3 text-[13px] text-slate-200 leading-relaxed">
                {/* Tip 1 */}
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-emerald-400 mr-3 mt-[3px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l9 6 9-6M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
                    />
                  </svg>
                  <p>
                    Log every application the moment you hit submit. Your future
                    self will thank you.
                  </p>
                </div>

                {/* Tip 2 */}
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-sky-400 mr-3 mt-[3px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12h6m-6 4h6M8 8h.01M12 8h4m-8 4h.01m0 4h.01M4 6v12a2 2 0 002 2h8l4-4V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"
                    />
                  </svg>
                  <p>
                    Keep short notes on each company. It makes personalized
                    follow-ups almost effortless.
                  </p>
                </div>

                {/* Tip 3 */}
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-amber-300 mr-3 mt-[3px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 10a4 4 0 11-2.828-2.828M6 14a4 4 0 102.828 2.828M12 8v2m0 4v2m3-3h2m-10 0H5"
                    />
                  </svg>
                  <p>
                    Use follow-up reminders instead of your memory. Systems beat
                    stress every time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT – Register card, same breadth style as Login card */}
        <section className="w-full lg:max-w-md flex items-center justify-center">
          <div
            className="
              w-full
              rounded-3xl border border-slate-800/80
              bg-slate-900/80 backdrop-blur-xl
              shadow-[0_24px_70px_rgba(0,0,0,0.9)]
              px-6 sm:px-7 py-5
            "
          >
            {/* Header */}
            <div className="mb-4">
              <p className="text-[11px] font-mono text-emerald-300 mb-1">
                Create account
              </p>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-50 font-mono tracking-tight">
                Start your job map
              </h2>
              <p className="mt-1 text-[12px] text-slate-400 font-mono">
                A single login for all your roles, notes, and follow-ups.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  EMAIL
                </label>
                <input
                  className="
                    w-full rounded-md border border-slate-700 bg-slate-900/90
                    px-3 py-2.5 text-sm text-slate-200 font-mono
                    outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70
                    placeholder:text-slate-500
                  "
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  PASSWORD
                </label>
                <input
                  type="password"
                  className="
                    w-full rounded-md border border-slate-700 bg-slate-900/90
                    px-3 py-2.5 text-sm text-slate-200 font-mono
                    outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70
                    placeholder:text-slate-500
                  "
                  placeholder="Choose a strong password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-slate-500 font-mono">
                  Use at least 8 characters with numbers &amp; symbols.
                </p>
                {password && !isPasswordValid && (
                  <p className="mt-1 text-[11px] text-rose-400 font-mono">
                    Password must be at least 8 characters and include a number
                    and a special character.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  className="
                    w-full rounded-md border border-slate-700 bg-slate-900/90
                    px-3 py-2.5 text-sm text-slate-200 font-mono
                    outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70
                    placeholder:text-slate-500
                  "
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && !doPasswordsMatch && (
                  <p className="mt-1 text-[11px] text-rose-400 font-mono">
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Sign up button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`
                  w-full rounded-md font-mono
                  py-2.5 text-sm font-semibold tracking-wide
                  transition
                  ${
                    isFormValid
                      ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 active:bg-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                SIGN UP
              </button>

              {/* Backend error (e.g., "User already exists") */}
              {errorMsg && (
                <p className="mt-1 text-[11px] text-rose-400 font-mono">
                  {errorMsg}
                </p>
              )}
            </form>

            {/* Extra mini-benefits under the form to fill height */}
            <div className="mt-4 space-y-2 text-[11px] text-slate-400 font-mono">
              <p>• Save roles, links, and notes in seconds.</p>
              <p>• See your whole pipeline instead of scattered tabs.</p>
              <p>• Come back tomorrow and know exactly where you left off.</p>
            </div>

            {/* Footer */}
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              <p>By continuing, you agree to our terms and privacy policy.</p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Already have an account?</span>
              <button
                type="button"
                className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
                onClick={() => nav('/login')}
              >
                Log in
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
