// frontend/src/components/Navbar.tsx (or wherever it lives)
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../store/auth"

export default function Navbar() {
  const { token, logout, user, loadProfile } = useAuth()
  const nav = useNavigate()
  const { pathname } = useLocation()

  const [open, setOpen] = useState(false)

  // Load profile (and thus username) when we have a token but no user yet
  useEffect(() => {
    if (token && !user) {
      void loadProfile()
    }
  }, [token, user, loadProfile])

  const username = user?.name || "User"

  const linkBase =
    "px-4 py-2 text-sm font-mono rounded-md transition-colors duration-150 tracking-wide"
  const linkActive = "bg-slate-800 text-slate-100 border border-slate-700 shadow-inner"
  const linkInactive = "text-slate-300 hover:text-white hover:bg-slate-800/50"

  const handleLogout = () => {
    const overlay = document.createElement("div")
    overlay.className =
      "fixed inset-0 bg-black/80 flex items-center justify-center text-white text-3xl animate-fadeout z-[9999]"
    overlay.innerHTML = "Logging out..."
    document.body.appendChild(overlay)

    setTimeout(() => {
      logout()
      nav("/login")
      overlay.remove()
    }, 1200)
  }

  return (
    <nav
      className="
      sticky top-0 z-50 
      flex items-center justify-between 
      px-6 py-4 
      bg-slate-950/95 backdrop-blur 
      border-b border-slate-800 
      shadow-[0_2px_4px_rgba(0,0,0,0.35)]
    "
    >
      {/* Left — Brand */}
      <Link
        to="/dashboard"
        className="flex items-center text-base font-mono font-bold text-slate-200 tracking-widest"
      >
        <img src="../favicon.png" alt="logo" className="w-10 h-10 inline-block mr-3" />
        JobTracker
      </Link>

      {/* Right — Links */}
      <div className="flex items-center gap-6">
        {token ? (
          <>
            <Link
              to="/dashboard"
              className={`${linkBase} ${pathname === "/dashboard" ? linkActive : linkInactive}`}
            >
              Dashboard
            </Link>

            <Link
              to="/applications"
              className={`${linkBase} ${pathname === "/applications" ? linkActive : linkInactive}`}
            >
              Applications
            </Link>

            <Link
              to="/resume"
              className={`${linkBase} ${pathname === "/resume" ? linkActive : linkInactive}`}
            >
              Resume Match
            </Link>

            <Link
              to="/wishlist"
              className={`${linkBase} ${pathname === "/wishlist" ? linkActive : linkInactive}`}
            >
              Wishlist
            </Link>

            <Link
              to="/cover-letter"
              className={`${linkBase} ${pathname === "/cover-letter" ? linkActive : linkInactive}`}
            >
              Cover Letter
            </Link>

            {/* Username Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="
                  flex items-center gap-2
                  px-3 py-1.5 
                  text-xs font-mono
                  rounded 
                  bg-[#3C3C3C]
                  text-[#F0F0F0]
                  border border-[#3C3C3C]
                  hover:bg-[#454545]
                  hover:text-white
                  focus:outline-none 
                  focus:ring-1 focus:ring-[#007ACC]
                  transition-colors
                "
              >
                <span className="max-w-[7rem] truncate inline-block">{username}</span>
                <span className="text-[10px] opacity-80">▾</span>
              </button>

              {open && (
                <div
                  className="
                    absolute right-0 mt-1 w-56 
                    rounded 
                    border border-[#3C3C3C]
                    bg-[#252526]
                    shadow-[0_8px_24px_rgba(0,0,0,0.6)]
                    text-xs font-mono
                    z-50
                  "
                >
                  <Link
                    to="/profile"
                    className="block px-3 py-1.5 text-[#F0F0F0] hover:bg-[#094771] hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="block px-3 py-1.5 text-[#F0F0F0] hover:bg-[#094771] hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Settings
                  </Link>

                  <Link
                    to="/support"
                    className="block px-3 py-1.5 text-[#F0F0F0] hover:bg-[#094771] hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Support
                  </Link>

                  <div className="my-1 h-px bg-[#3C3C3C]" />

                  <button
                    onClick={handleLogout}
                    className="
                      w-full text-left 
                      px-3 py-1.5 
                      text-[#F48771]
                      hover:bg-[#5A1D1D]
                      hover:text-white
                    "
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`${linkBase} ${pathname === "/login" ? linkActive : linkInactive}`}
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`${linkBase} ${pathname === "/register" ? linkActive : linkInactive}`}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
