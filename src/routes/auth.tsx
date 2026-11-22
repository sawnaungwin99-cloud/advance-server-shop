import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) toast.error(result.error.message);
      if (result.redirected) return;
      // AuthProvider observes the session established by the managed helper.
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google ဖြင့် ဝင်ရောက်မှု မအောင်မြင်ပါ။ ထပ်စမ်းပေးပါ။");
    } finally {
      setGoogleLoading(false);
    }
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
            className="google-sign-in w-full gap-2.5 px-3 py-2.5 text-sm font-medium"
          >
            <GoogleIcon className="size-[18px] shrink-0" />
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
