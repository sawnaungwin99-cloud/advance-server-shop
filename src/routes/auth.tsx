import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — SNW Advance Server Shop" },
      { name: "description", content: "Login or create an account to buy Mobile Legends Advance Server accounts from SNW." },
      { property: "og:title", content: "Sign In — SNW Advance Server Shop" },
      { property: "og:description", content: "Login or create an account to buy Mobile Legends Advance Server accounts." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [forgot, setForgot] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    const redirectTo = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    setGoogleLoading(false);
    if (error) toast.error(error.message);
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email ထည့်ပါ / Enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("စကားဝှက်ပြန်လည်သတ်မှတ်ရန် လင့်ခ်ကို Email သို့ ပို့ပြီးပါပြီ / Reset link sent.");
  };


  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/", replace: true });
  };

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName.trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) navigate({ to: "/", replace: true });
    else toast.success("အကောင့်အတည်ပြုရန် သင့် Email ကို စစ်ဆေးပါ / Check your email to confirm.");
  };

  return (
    <main className="hero-aura flex min-h-screen items-center justify-center px-4 py-12">
      <div className="metal-card w-full max-w-md rounded-2xl p-6 glow-cyan">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            <Gamepad2 className="size-6 text-primary" />
          </span>
          <h1 className="brand-title text-sm text-gradient">SNW Advance Server Shop</h1>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            disabled={googleLoading || loading}
            onClick={signInWithGoogle}
            className="w-full gap-3 border-border bg-background/60 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/60"
          >
            <GoogleIcon className="size-5" />
            {t("google_login")}
          </Button>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-xs text-muted-foreground">{t("or_continue_with")}</span>
            <span className="h-px flex-1 bg-border/60" />
          </div>
        </div>

        <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("auth_login")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth_signup")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {forgot ? (
              <form onSubmit={sendReset} className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground">
                  သင့် Email ကိုထည့်ပါ။ စကားဝှက်ပြန်သတ်မှတ်ရန် လင့်ခ်ပို့ပေးပါမည်။ / Enter your email to receive a reset link.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="f-email">{t("email")}</Label>
                  <Input id="f-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full glow-cyan">
                  လင့်ခ်ပို့မည် / Send reset link
                </Button>
                <button
                  type="button"
                  onClick={() => setForgot(false)}
                  className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  ← {t("auth_login")}
                </button>
              </form>
            ) : (
              <form onSubmit={login} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="l-email">{t("email")}</Label>
                  <Input id="l-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="l-pass">{t("password")}</Label>
                  <Input
                    id="l-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full glow-cyan">
                  {t("auth_login")}
                </Button>
                <button
                  type="button"
                  onClick={() => setForgot(true)}
                  className="w-full text-xs text-primary underline-offset-4 hover:underline"
                >
                  စကားဝှက်မေ့နေပါသလား? / Forgot password?
                </button>
              </form>
            )}
          </TabsContent>


          <TabsContent value="signup">
            <form onSubmit={signup} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-name">{t("display_name")}</Label>
                <Input id="s-name" required maxLength={60} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-email">{t("email")}</Label>
                <Input id="s-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-pass">{t("password")}</Label>
                <Input
                  id="s-pass"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full glow-cyan">
                {t("auth_signup")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
