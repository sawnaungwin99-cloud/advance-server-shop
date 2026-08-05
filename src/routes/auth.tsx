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

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

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

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("auth_login")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth_signup")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
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
            </form>
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
