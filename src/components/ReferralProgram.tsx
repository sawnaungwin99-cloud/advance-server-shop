import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Copy, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { requestReferralReward } from "@/lib/referral.functions";
import {
  REFERRAL_GOAL,
  REFERRAL_GUIDE_INTRO,
  REFERRAL_GUIDE_STEPS,
  REFERRAL_GUIDE_TITLE,
  REFERRAL_GUIDE_WARNING,
} from "@/lib/referral";

export function ReferralProgram() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("promo_code, display_name")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: points } = useQuery({
    queryKey: ["my-referral-points", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_referral_points");
      if (error) throw error;
      return Number(data ?? 0);
    },
  });

  const { data: claims } = useQuery({
    queryKey: ["my-referral-claims", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_claims")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const claim = useMutation({
    mutationFn: async () =>
      requestReferralReward({
        data: { full_name: profile?.display_name ?? "", telegram_username: "" },
      }),
    onSuccess: (res) => {
      toast.success("တောင်းဆိုမှု ပေးပို့ပြီးပါပြီ။ Admin မှ စစ်ဆေးပေးပါမည်။");
      if (!res.telegram) toast.warning("Telegram အကြောင်းကြားချက် မပို့နိုင်ပါ။");
      qc.invalidateQueries({ queryKey: ["my-referral-claims", user?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "မအောင်မြင်ပါ"),
  });

  if (!user) return null;

  const count = points ?? 0;
  const pct = Math.min(100, (count / REFERRAL_GOAL) * 100);
  const pending = (claims ?? []).some((c) => c.status === "pending");
  const code = profile?.promo_code ?? "…";

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Promo Code ကူးယူပြီးပါပြီ။");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="metal-card mt-6 rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gradient">
        <Users className="size-5 text-primary" />
        သူငယ်ချင်းဖိတ်ခေါ်မှု (Referral Program)
      </h2>

      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground">မိမိ၏ သီးသန့် Promo Code</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-gold/40 bg-background/60 px-3 py-2 font-mono text-lg font-bold tracking-wider text-gold">
            {code}
          </span>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} ကူးယူရန်
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            သူငယ်ချင်းဖိတ်ခေါ်မှု: {count}/{REFERRAL_GOAL}
          </span>
          <span className="text-xs text-muted-foreground">
            (Completed အော်ဒါများသာ ရေတွက်ပါသည်)
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-border bg-secondary/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Button
        className="mt-5 w-full glow-cyan"
        size="lg"
        disabled={count < REFERRAL_GOAL || pending || claim.isPending}
        onClick={() => claim.mutate()}
      >
        <Gift className="size-5" />
        {pending
          ? "တောင်းဆိုမှု စောင့်ဆိုင်းဆဲ..."
          : "Advance Server အကောင့် တောင်းဆိုရန်"}
      </Button>
      {count < REFERRAL_GOAL && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          နောက်ထပ် {REFERRAL_GOAL - count} ယောက် လိုအပ်ပါသေးသည်။
        </p>
      )}

      {(claims ?? []).length > 0 && (
        <ul className="mt-4 space-y-2">
          {(claims ?? []).map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-xs"
            >
              <span className="text-muted-foreground">
                {new Date(c.created_at).toLocaleString()} · {c.promo_code}
              </span>
              <span
                className={
                  c.status === "approved"
                    ? "font-semibold text-emerald-400"
                    : c.status === "rejected"
                      ? "font-semibold text-destructive"
                      : "font-semibold text-gold"
                }
              >
                {c.status === "approved"
                  ? "ပေးအပ်ပြီး"
                  : c.status === "rejected"
                    ? "ငြင်းပယ်သည်"
                    : "စောင့်ဆိုင်းဆဲ"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 rounded-xl border border-border/60 bg-secondary/30 p-4">
        <h3 className="text-base font-bold text-gold">ဘယ်လိုအလုပ်လုပ်သလဲ?</h3>
        <p className="mt-3 text-sm font-semibold text-foreground/90">{REFERRAL_GUIDE_TITLE}</p>
        <p className="mt-2 text-sm leading-loose text-muted-foreground">{REFERRAL_GUIDE_INTRO}</p>
        <p className="mt-4 text-sm font-semibold text-primary">ဘယ်လို ပါဝင်ရမလဲ?</p>
        <ul className="mt-2 space-y-3">
          {REFERRAL_GUIDE_STEPS.map((s) => (
            <li key={s} className="text-sm leading-loose text-muted-foreground">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-loose text-destructive">{REFERRAL_GUIDE_WARNING}</p>
      </div>
    </section>
  );
}
