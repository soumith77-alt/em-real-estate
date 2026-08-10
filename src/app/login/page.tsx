"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/stores/useSession";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const [email, setEmail] = useState("kyle@emrealestate.ca");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwValid = pw.length >= 6;
  const canSubmit = emailValid && pwValid && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!canSubmit) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    signIn(email);
    router.push("/home");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-paper px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid place-items-center h-9 w-9 rounded-sm bg-ink text-card font-display font-semibold tracking-tight">
            EM
          </div>
          <div>
            <div className="font-display text-[15px] font-medium tracking-tight text-ink">
              EM Real Estate
            </div>
            <div className="eyebrow">Private workspace</div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-card border border-rule rounded-sm p-6 space-y-5"
        >
          <div>
            <h1 className="font-display text-[20px] font-medium tracking-tight text-ink">
              Sign in
            </h1>
            <p className="text-[13px] text-slate mt-1">
              This workspace is private to EM Real Estate.
            </p>
          </div>

          <label className="block">
            <div className="eyebrow mb-1.5">Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 border border-rule bg-paper rounded-sm text-[14px] focus:outline-none focus:border-blueprint"
              autoComplete="email"
            />
            {email && !emailValid && (
              <div className="text-[12px] text-fail mt-1">
                That doesn&rsquo;t look like a valid email.
              </div>
            )}
          </label>

          <label className="block">
            <div className="eyebrow mb-1.5">Password</div>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full h-10 px-3 border border-rule bg-paper rounded-sm text-[14px] focus:outline-none focus:border-blueprint"
              autoComplete="current-password"
            />
            {pw && !pwValid && (
              <div className="text-[12px] text-fail mt-1">
                Six characters minimum.
              </div>
            )}
          </label>

          {err && (
            <div className="text-[13px] text-fail bg-fail-tint border border-fail/30 rounded-sm px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-10 bg-blueprint text-card rounded-sm text-[14px] font-medium hover:bg-blueprint-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-[12px]">
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-slate hover:text-blueprint underline underline-offset-2"
            >
              Forgot password
            </button>
            <span className="flex items-center gap-1.5 text-slate">
              <Lock size={12} /> Single-tenant hosting
            </span>
          </div>
        </form>

        {showReset && (
          <div
            role="dialog"
            className="mt-4 bg-card border border-rule rounded-sm p-4 text-[13px] text-slate"
          >
            An administrator must reset passwords for this workspace. Contact
            your workspace owner.
            <div className="mt-2 text-right">
              <button
                onClick={() => setShowReset(false)}
                className="text-blueprint underline underline-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-2 mt-6 text-center">
          Documents in this workspace never leave EM&rsquo;s
          controlled infrastructure.
        </p>
      </div>
    </div>
  );
}
