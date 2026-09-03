import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentAccounts } from "@/components/PaymentAccounts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notifyOrder } from "@/lib/telegram.functions";
import { useLang } from "@/lib/i18n";
import { TELEGRAM_URL, type Plan } from "@/lib/plans";
import { SELF_REFERRAL_ERROR, discountForPrice, mmk } from "@/lib/referral";

const PENDING_CHECKOUT_KEY = "snw-pending-checkout";

type PendingCheckout = {
  planKey: string;
  form: { full_name: string; phone: string; target_gmail: string; ign: string; telegram_username: string };
  promo: string;
};

function loadPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingCheckout;
  } catch {
    return null;
  }
}

function clearPendingCheckout() {
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
}

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  target_gmail: z.string().trim().email().max(255),
  ign: z.string().trim().min(1).max(60),
  telegram_username: z.string().trim().max(80),
});

export function CheckoutDialog({
  plan,
  open,
  onOpenChange,
}: {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", target_gmail: "", ign: "", telegram_username: "" });
  const [promo, setPromo] = useState("");
  const [checking, setChecking] = useState(false);
  const [applied, setApplied] = useState<{ code: string; referrer_id: string; discount: number } | null>(null);

  useEffect(() => {
    if (user && open) {
      const pending = loadPendingCheckout();
      if (pending) {
        setForm(pending.form);
        setPromo(pending.promo);
        clearPendingCheckout();
        toast.info("Login ဝင်ပြီးပါပြီ။ ဝယ်ယူမှု ဆက်လုပ်နိုင်ပါပြီ။");
      }
    }
  }, [user, open]);

  const discount = applied?.discount ?? 0;
  const finalPrice = Math.max(0, (plan?.price ?? 0) - discount);

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setDone(false);
      setFile(null);
      setPromo("");
      setApplied(null);
      setForm({ full_name: "", phone: "", target_gmail: "", ign: "", telegram_username: "" });
    }
  };

  const applyPromo = async () => {
    if (!plan) return;
    const code = promo.trim();
    if (!code) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.rpc("referral_lookup", { _code: code });
      if (error) throw error;
      if (!data) {
        setApplied(null);
        toast.error("Promo Code မမှန်ကန်ပါ");
        return;
      }
      if (user?.id && data === user.id) {
        setApplied(null);
        toast.error(SELF_REFERRAL_ERROR);
        return;
      }
      const d = discountForPrice(plan.price);
      setApplied({ code, referrer_id: data as string, discount: d });
      toast.success(`Promo Code အောင်မြင်ပါသည် — ${mmk(d)} လျှော့ပေးပါမည်။`);
    } catch (err) {
      setApplied(null);
      toast.error(err instanceof Error ? err.message : "Promo Code စစ်ဆေး၍ မရပါ");
    } finally {
      setChecking(false);
    }
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    if (!user) {
      sessionStorage.setItem(
        PENDING_CHECKOUT_KEY,
        JSON.stringify({ planKey: plan.key, form, promo } satisfies PendingCheckout),
      );
      toast.error(t("auth_required_toast"));
      navigate({ to: "/auth" });
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    if (!file) {
      toast.error(t("f_receipt"));
      return;
    }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${user?.id ?? "guest"}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("receipts").upload(path, file);
      if (upErr) throw upErr;

      const { error } = await supabase.from("orders").insert({
        user_id: user?.id ?? null,
        plan_key: plan.key,
        price_mmk: finalPrice,
        discount_mmk: discount,
        referral_code: applied?.code ?? null,
        referrer_id: applied?.referrer_id ?? null,
        receipt_path: path,
        ...parsed.data,
      });
      if (error) throw error;

      try {
        await notifyOrder({
          data: {
            ...parsed.data,
            plan_label: applied
              ? `${plan.priceLabel} · Promo ${applied.code} · ${mmk(finalPrice)}`.slice(0, 80)
              : plan.priceLabel,
            receipt_path: path,
          },
        });
      } catch (notifyErr) {
        console.error("Telegram notify failed", notifyErr);
      }

      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-[oklch(0.18_0.02_260/0.92)] backdrop-blur-xl sm:max-w-lg">
        {done ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 glow-cyan">
              <Send className="size-6 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-xl text-gradient">{t("order_done_title")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t("order_done_desc")}</p>
            <Button asChild className="w-full glow-cyan">
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer noopener">
                <Send className="size-4" /> {t("telegram_cta")}
              </a>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => close(false)}>
              OK
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {t("checkout_title")} — <span className="text-gradient">{plan?.priceLabel}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gold">{t("pay_title")}</p>
              <PaymentAccounts />
            </div>

            <form onSubmit={submit} className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">{t("f_name")}</Label>
                <Input
                  id="full_name"
                  maxLength={100}
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("f_phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={20}
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gmail">{t("f_gmail")}</Label>
                <Input
                  id="gmail"
                  type="email"
                  maxLength={255}
                  required
                  value={form.target_gmail}
                  onChange={(e) => setForm({ ...form, target_gmail: e.target.value })}
                />
                <p className="text-xs leading-relaxed text-destructive">{t("f_gmail_help")}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ign">{t("f_ign")}</Label>
                <Input
                  id="ign"
                  maxLength={60}
                  required
                  value={form.ign}
                  onChange={(e) => setForm({ ...form, ign: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telegram_username">{t("f_telegram")}</Label>
                <Input
                  id="telegram_username"
                  maxLength={80}
                  placeholder="@username"
                  value={form.telegram_username}
                  onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="promo">Promo Code ထည့်ရန်</Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    maxLength={40}
                    placeholder="SNW-USER-101"
                    value={promo}
                    onChange={(e) => {
                      setPromo(e.target.value);
                      setApplied(null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={checking || !promo.trim()}
                    onClick={applyPromo}
                  >
                    {checking ? "..." : "အတည်ပြုရန်"}
                  </Button>
                </div>
              </div>

              <div className="space-y-1 rounded-xl border border-border/60 bg-secondary/30 px-3 py-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>ကျသင့်ငွေ</span>
                  <span>{mmk(plan?.price ?? 0)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Promo လျှော့ငွေ{applied ? ` (${applied.code})` : ""}</span>
                    <span>- {mmk(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border/60 pt-2 font-bold text-gold">
                  <span>စုစုပေါင်း ပေးရမည့်ငွေ</span>
                  <span>{mmk(finalPrice)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receipt">{t("f_receipt")}</Label>
                <label
                  htmlFor="receipt"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-3 text-sm text-muted-foreground"
                >
                  <Upload className="size-4 text-primary" />
                  {file ? file.name : t("f_receipt")}
                </label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full glow-cyan">
                {submitting ? t("submitting") : t("submit_order")}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
