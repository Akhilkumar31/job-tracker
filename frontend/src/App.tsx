import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import ResumeMatch from './pages/ResumeMatch'
import { useAuth } from './store/auth'
import AuthCallback from './pages/AuthCallback' // 👈 NEW
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import Support from "./pages/Support"
import Wishlist from "./pages/Wishlist"
import CoverLetter from "./pages/CoverLetter"

function Guard({children}:{children:JSX.Element}){
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />
}
export default function App(){
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="p-4 max-w-5xl mx-auto">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          {/* 👇 NEW: Google OAuth callback route (no Guard) */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<Guard><Dashboard/></Guard>} />
          <Route path="/applications" element={<Guard><Applications/></Guard>} />
          <Route path="/resume" element={<Guard><ResumeMatch/></Guard>} />

          <Route path="/profile" element={<Guard><Profile /></Guard>} />
          <Route path="/settings" element={<Guard><Settings /></Guard>} />
          <Route path="/support" element={<Guard><Support /></Guard>} />
          <Route path="/wishlist" element={<Guard><Wishlist /></Guard>} />
          <Route path="/cover-letter" element={<Guard><CoverLetter /></Guard>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  )
}
