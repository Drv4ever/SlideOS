import { useState } from "react";
import { ArrowRight, CheckCircle2, FileStack, LayoutTemplate, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const valuePoints = [
  {
    icon: Sparkles,
    title: "Prompt to deck",
    text: "Generate a first draft of your presentation from a single idea.",
  },
  {
    icon: LayoutTemplate,
    title: "Edit visually",
    text: "Refine structure, theme, layout, and slide content in one workflow.",
  },
  {
    icon: FileStack,
    title: "Save and reopen",
    text: "Persist each presentation and continue later without losing progress.",
  },
];

const trustPoints = [
  "JWT-based authentication",
  "Private saved presentations",
  "PPTX export workflow",
];

export function AuthForm({ onAuthSuccess, theme }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const palette = theme?.colors || {
    primary: "#6366f1",
    secondary: "#a5b4fc",
    background: "#eef2ff",
    text: "#312e81",
  };

  const fonts = theme?.fonts || {
    heading: "Poppins",
    body: "Source Sans Pro",
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (error) {
      alert(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 15% 20%, ${palette.secondary}50, transparent 30%),
            radial-gradient(circle at 85% 15%, ${palette.primary}22, transparent 28%),
            linear-gradient(180deg, ${palette.background}, #f8fbff)`,
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-stretch gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/65 p-8 shadow-[0_30px_80px_rgba(99,102,241,0.12)] backdrop-blur md:p-10">
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
              style={{
                borderColor: `${palette.primary}30`,
                color: palette.text,
                backgroundColor: `${palette.secondary}18`,
              }}
            >
              <ShieldCheck className="h-4 w-4" />
              AI presentation workspace for reviews, pitches, and class decks
            </div>

            <h1
              className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl"
              style={{
                color: palette.text,
                fontFamily: `${fonts.heading}, sans-serif`,
              }}
            >
              Build, edit, save, and present polished slide decks from one prompt.
            </h1>

            <p
              className="mt-6 max-w-2xl text-lg leading-8"
              style={{
                color: palette.text,
                opacity: 0.78,
                fontFamily: `${fonts.body}, sans-serif`,
              }}
            >
              SlideOS combines AI generation, structured outline editing, a visual slide editor,
              and presentation persistence so the full workflow stays in one place.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {valuePoints.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-3xl border bg-white/75 p-5 shadow-sm"
                  style={{ borderColor: `${palette.primary}18` }}
                >
                  <div
                    className="mb-4 inline-flex rounded-2xl p-3"
                    style={{
                      background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                      color: "#fff",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: palette.text, fontFamily: `${fonts.heading}, sans-serif` }}
                  >
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: palette.text, opacity: 0.72 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border bg-slate-950 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Workflow</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Prompt {"->"} Preview {"->"} Editor {"->"} Save
                </h2>
              </div>
              <div
                className="hidden rounded-full px-4 py-2 text-sm font-medium md:block"
                style={{
                  background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                }}
              >
                Review ready
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/80">
              {trustPoints.map((point) => (
                <div key={point} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-[32px] border-0 bg-white p-0 shadow-[0_28px_90px_rgba(49,46,129,0.18)]">
          <div
            className="absolute inset-x-0 top-0 h-2"
            style={{
              background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
            }}
          />

          <div className="p-8 md:p-10">
            <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                onClick={() => setMode("login")}
                className="flex-1 rounded-xl"
                style={
                  mode === "login"
                    ? {
                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                        color: "#fff",
                      }
                    : undefined
                }
              >
                Login
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "ghost"}
                onClick={() => setMode("register")}
                className="flex-1 rounded-xl"
                style={
                  mode === "register"
                    ? {
                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                        color: "#fff",
                      }
                    : undefined
                }
              >
                Register
              </Button>
            </div>

            <div className="mt-8">
              <h2
                className="text-3xl font-semibold"
                style={{
                  color: palette.text,
                  fontFamily: `${fonts.heading}, sans-serif`,
                }}
              >
                {mode === "login" ? "Continue your workspace" : "Create your account"}
              </h2>
              <p className="mt-3 text-sm leading-6" style={{ color: palette.text, opacity: 0.72 }}>
                {mode === "login"
                  ? "Access your saved presentations, reopen previous work, and continue editing."
                  : "Start with a prompt, generate a draft deck, and keep every revision tied to your account."}
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={submit}>
              {mode === "register" && (
                <div className="space-y-2">
                  <Label style={{ color: palette.text }}>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label style={{ color: palette.text }}>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: palette.text }}>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                />
              </div>

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-xl text-base font-semibold"
                disabled={loading}
                style={{
                  background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                  color: "#fff",
                }}
              >
                {loading ? "Please wait..." : mode === "login" ? "Login to SlideOS" : "Create account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
}
