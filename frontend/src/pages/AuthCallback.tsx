import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/http";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finishLogin() {
      // Extract token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        return navigate("/login");
      }

      // Save token
      localStorage.setItem("token", token);

      // Optional: verify token + preload user data
      try {
        await Promise.all([
          api.get("/me"),
          api.get("/apps"),
          api.get("/reminders"),
        ]);
      } catch {
        // If token invalid, go back to login
        localStorage.removeItem("token");
        return navigate("/login");
      }

      // Redirect to dashboard
      navigate("/applications");
    }

    finishLogin();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 shadow-xl shadow-black/40">
        <div className="text-slate-300 font-mono text-sm tracking-wide">
          Signing you in…
        </div>
      </div>
    </div>
  );
}
