import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { Flame, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GuestContext } from "@/lib/guest-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [guestMode, setGuestMode] = useState(true);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setGuestMode(false);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setGuestMode(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setNotice("Check your email to confirm your account, then sign in.");
    }

    setLoading(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (session || guestMode) {
    return (
      <GuestContext.Provider value={{ guestMode, exitGuestMode: () => setGuestMode(false) }}>
        {children}
      </GuestContext.Provider>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center glow-primary">
            <Flame className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">IronMind</h1>
            <p className="text-sm text-muted-foreground">AI Fitness Coach</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="bg-background border-border" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="bg-background border-border" />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
            {notice && <p className="text-xs text-accent">{notice}</p>}

            <Button type="submit" variant="fire" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <button
          onClick={() => setGuestMode(true)}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          Continue exploring as guest
        </button>
      </div>
    </div>
  );
}
