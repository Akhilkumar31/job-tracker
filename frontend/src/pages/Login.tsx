import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../store/auth'
import { useTitle } from '../hooks/useTitle'

export default function Login() {
  useTitle('Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { login, loginWithGoogle } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await login(email, password)
    nav('/dashboard')
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token
        if (!accessToken) {
          console.error('No access_token from Google')
          setGoogleLoading(false)
          return
        }

        setGoogleLoading(true)

        // This calls /api/auth/oauth/google and stores the JWT in your auth store
        await loginWithGoogle(accessToken)

        // After token is stored, go to dashboard
        nav('/dashboard')
      } catch (err) {
        console.error('Google login failed', err)
        setGoogleLoading(false)
      }
    },
    onError: (err) => {
      console.error('Google login error', err)
      setGoogleLoading(false)
    },
    scope:
      'openid email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  })

  return (
    <div
      className="
        relative left-1/2 -translate-x-1/2 w-screen
        min-h-[calc(100vh-4rem)]
        bg-slate-950
        overflow-hidden
      "
    >
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/18 blur-3xl" />
        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.35),_transparent_55%)] opacity-70" />
        <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      <div
        className="
          relative flex flex-col lg:flex-row items-stretch
          h-full
          px-4 lg:px-8
          py-5 lg:py-4
          gap-5 lg:gap-8
        "
      >
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
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-emerald-400 via-sky-400 to-amber-300" />
              <div className="flex flex-col">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-emerald-300/80">
                  JobTracker
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Your job search command center
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-semibold text-slate-50 font-mono tracking-tight mb-3">
              Welcome back,
              <span className="block text-emerald-300">
                keep your hunt organized.
              </span>
            </h1>

            <p className="max-w-2xl text-[13px] sm:text-[14px] text-slate-300/95 mb-5">
              See exactly where every application stands. Follow up on time,
              avoid duplicates, and give each opportunity the attention it
              deserves.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono mb-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <p className="text-slate-400 mb-1">Tracked applications</p>
                <p className="text-lg font-semibold text-emerald-400">120+</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <p className="text-slate-400 mb-1">Average follow-ups</p>
                <p className="text-lg font-semibold text-sky-400">x3</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                <p className="text-slate-400 mb-1">Reply rate</p>
                <p className="text-lg font-semibold text-amber-300">↑ 2.1x</p>
              </div>
            </div>
          </div>

          <div
            className="
              mt-4 grid gap-5
              md:grid-cols-2
              text-[13px] font-mono
            "
          >
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

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-3 font-semibold">
                Small habits, big lift
              </p>

              <div className="space-y-3 text-[13px] text-slate-200 leading-relaxed">
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
                    Follow up weekly to stay on the radar. Silence kills
                    momentum.
                  </p>
                </div>

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
                    Rewrite your résumé for each job. A custom pitch always
                    outperforms a generic one.
                  </p>
                </div>

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
                    Referrals open doors cold applications never reach. Use
                    them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
            <div className="mb-4">
              <p className="text-[11px] font-mono text-emerald-300 mb-1">
                Sign in
              </p>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-50 font-mono tracking-tight">
                Back to your job map
              </h2>
              <p className="mt-1 text-[12px] text-slate-400 font-mono">
                Pick up where you left off – your applications are waiting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
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

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[11px] font-mono text-slate-400">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    className="text-[11px] font-mono text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>

                {/* Password + Eye Toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="
                      w-full rounded-md border border-slate-700 bg-slate-900/90
                      px-3 pr-9 py-2.5 text-sm text-slate-200 font-mono
                      outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70
                      placeholder:text-slate-500
                    "
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="
                      absolute inset-y-0 right-2 flex items-center
                      text-slate-500 hover:text-emerald-300
                      transition
                    "
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      // Eye open icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      // Eye with slash icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.477 10.485A3 3 0 0115 12c0 .512-.128.994-.354 1.414M9.88 9.88A3 3 0 0012 9c1.657 0 3 1.343 3 3a3 3 0 01-.879 2.121M6.228 6.228C4.357 7.297 2.97 8.94 2.458 12 3.732 16.057 7.523 19 12 19c1.46 0 2.846-.313 4.095-.877M17.772 17.772C19.643 16.703 21.03 15.06 21.542 12 20.268 7.943 16.477 5 12 5c-.963 0-1.896.138-2.782.395"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="
                  w-full rounded-md bg-emerald-500 text-slate-900 font-mono
                  py-2.5 text-sm font-semibold tracking-wide
                  hover:bg-emerald-400 active:bg-emerald-500
                  transition
                  shadow-lg shadow-emerald-500/30
                "
              >
                SIGN IN
              </button>
            </form>

            <div className="mt-4">
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                <div className="h-px flex-1 bg-slate-700/70" />
                <span className="font-mono">New to JobTracker?</span>
                <div className="h-px flex-1 bg-slate-700/70" />
              </div>

              <div className="text-center text-[11px] text-slate-400 font-mono mb-3">
                <Link
                  to="/register"
                  className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
                >
                  Create an account
                </Link>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!googleLoading) {
                      setGoogleLoading(true)
                      googleLogin()
                    }
                  }}
                  disabled={googleLoading}
                  className="
                    flex w-full items-center justify-center gap-2
                    rounded-md border border-slate-700 bg-slate-900/80
                    px-3 py-2.5
                    text-xs sm:text-sm font-mono text-slate-100
                    hover:bg-slate-800/90 transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {googleLoading ? (
                    <span>Signing you in…</span>
                  ) : (
                    <>
                      <img
                        src="../../google.png"
                        alt="Google logo"
                        className="h-4 w-4"
                      />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Full-screen overlay while Google login is in progress */}
      {googleLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-6 py-4 shadow-2xl shadow-black/60">
            <p className="text-sm font-mono text-slate-200">
              Signing you in with Google…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
