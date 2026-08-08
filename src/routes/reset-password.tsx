import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — SNW Advance Server Shop" },
      { name: "description", content: "Set a new password for your SNW Advance Server Shop account." },
      { property: "og:title", content: "Reset Password — SNW Advance Server Shop" },
      { property: "og:description", content: "Set a new password for your SNW Advance Server Shop account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("စကားဝှက် နှစ်ခု မတူညီပါ / Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("စကားဝှက် ပြောင်းလဲပြီးပါပြီ / Password updated");
    navigate({ to: "/", replace: true });
  };

  return (
    <main className="hero-aura flex min-h-screen items-center justify-center px-4 py-12">
      <div className="metal-card w-full max-w-md rounded-2xl p-6 glow-cyan">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            <KeyRound className="size-6 text-primary" />
          </span>
          <h1 className="brand-title text-sm text-gradient">စကားဝှက် အသစ်ထည့်ပါ / New Password</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="np">စကားဝှက်အသစ် / New password</Label>
            <Input id="np" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp">အတည်ပြုစကားဝှက် / Confirm password</Label>
            <Input id="cp" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full glow-cyan">
            သိမ်းဆည်းမည် / Save
          </Button>
        </form>
      </div>
    </main>
  );
}
