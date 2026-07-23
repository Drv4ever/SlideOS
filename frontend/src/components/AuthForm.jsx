import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function AuthForm({ onAuthSuccess, theme, isModal = false }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const palette = theme?.colors || {
    primary: "#0078d4",
    secondary: "#50e4ff",
    background: "#f8fafc",
    text: "#0f172a",
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    onAuthSuccess(data.user);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "login" : "register";
      const payload =
        mode === "login" ? { email, password } : { name, email, password };

      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Authentication failed");
      }

      handleAuthSuccess(data);
    } catch (error) {
      alert(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Google sign-in failed");
      }

      handleAuthSuccess(data);
    } catch (error) {
      alert(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex justify-center items-center select-none font-jakarta ${isModal ? '' : 'py-12 px-4'}`}>
      <div className={`w-full ${isModal ? 'bg-transparent' : 'max-w-sm border border-slate-200/80 bg-white p-6 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.06)] relative'}`}>
        {!isModal && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />}
        
        {/* Tab Selection */}
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${
              mode === "login"
                ? "bg-white text-blue-600 shadow-2xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${
              mode === "register"
                ? "bg-white text-blue-600 shadow-2xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Title & Subtitle */}
        <div className="text-left mb-6">
          <h2 className="text-xl font-extrabold text-slate-850">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
            {mode === "login"
              ? "Access your saved deck outlines and slide presentations."
              : "Save your outlines and collaborate on slides instantly."}
          </p>
        </div>

        {/* Input Fields */}
        <form className="space-y-4 text-left" onSubmit={submit}>
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-blue-500/25"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-blue-500/25"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-blue-500/25"
            />
          </div>

          <Button
            type="submit"
            className="mt-2 h-11 w-full rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-[0.98] border-t border-white/20 border-x border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_12px_rgba(37,99,235,0.2)]"
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              color: "#fff",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Please wait...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 justify-center">
                <span>{mode === "login" ? "Login to SlideOS" : "Create Account"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Continue with Google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => alert("Google sign-in failed")}
            text={mode === "login" ? "signin_with" : "signup_with"}
            shape="pill"
            width="320"
          />
        </div>
      </div>
    </div>
  );
}

// Inline fallback spinner icon
function Loader2({ className }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
