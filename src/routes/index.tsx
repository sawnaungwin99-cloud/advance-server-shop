import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Sparkles, Zap, Gift, ArrowRight, Headphones } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PlanCard } from "@/components/PlanCard";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { TelegramFab } from "@/components/TelegramFab";
import { FlashSaleSection } from "@/components/FlashSaleSection";
import { ReferralProgram } from "@/components/ReferralProgram";
import { FLASH_PLANS } from "@/lib/flash-sale";

import { useLang } from "@/lib/i18n";
import { PLANS, type Plan } from "@/lib/plans";
import { getBestSellerKey, groupPlanSales } from "@/lib/plan-sales";
import { useAuth } from "@/hooks/useAuth";
import { ContactDialog } from "@/components/ContactDialog";
import cinematicWarrior from "@/assets/cinematic-warrior.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SNW Advance Server Shop — MLBB Advance Server Accounts" },
      {
        name: "description",
        content:
          "Buy trusted Mobile Legends Advance Server accounts from SNW. Free diamonds, early heroes, events and buff/nerf previews. KBZPay & WavePay accepted.",
      },
      { property: "og:title", content: "SNW Advance Server Shop — MLBB Advance Server Accounts" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Trusted Mobile Legends Advance Server accounts. Free diamonds, early heroes, instant delivery in ~5 minutes.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const { data: salesByPlan } = useQuery({
    queryKey: ["plan-sales-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("plan_sales_counts");
      if (error) throw error;
      return groupPlanSales(data ?? []);
    },
    // Public aggregate polling works for visitors without exposing private orders.
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  const bestSellerKey = salesByPlan ? getBestSellerKey(PLANS, salesByPlan) : undefined;

  const onBuy = (p: Plan) => {
    setPlan(p);
    setOpen(true);
  };

  useEffect(() => {
    if (user) {
      try {
        const raw = sessionStorage.getItem("snw-pending-checkout");
        if (raw) {
          const pending = JSON.parse(raw) as { planKey: string };
          const pendingPlan = [...PLANS, ...FLASH_PLANS].find((p) => p.key === pending.planKey);
          if (pendingPlan) {
            setPlan(pendingPlan);
            setOpen(true);
          }
        }
      } catch {
        // ignore malformed session data
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="cinematic-shell cinematic-hero relative isolate overflow-hidden px-5">
          <img src={cinematicWarrior} alt="Fantasy warrior in black armor on a fiery battlefield" width={1920} height={1024} fetchPriority="high" className="cinematic-hero-image absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="cinematic-hero-shade absolute inset-0 -z-10" />
          <div className="mx-auto max-w-7xl py-16 sm:py-20 lg:py-24">
            <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 border-l-2 border-primary pl-3 text-xs font-semibold text-primary">
              <Sparkles className="size-4" />
              SNW GAMING · MLBB ADVANCE SERVER
            </span>
            <h1 className="cinematic-headline mt-6 text-4xl font-black leading-[1.12] sm:text-6xl lg:text-7xl">ENTER THE<br /><span className="text-primary">NEXT LEVEL</span></h1>
            <p className="mt-5 max-w-md text-sm leading-loose text-muted-foreground sm:text-base">
              {lang === "en" ? "Unlock the future of Mobile Legends. Explore new heroes, enjoy free diamonds, and experience every update first with a trusted Advance Server account." : "Mobile Legends ရဲ့ အသစ်ထွက်မယ့် Hero များ၊ Free Diamonds နှင့် Update များကို အရင်ဆုံး စမ်းသပ်ကစားနိုင်ဖို့ ယုံကြည်စိတ်ချရသော Advance Server အကောင့်များကို ရွေးချယ်လိုက်ပါ။"}
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg" className="h-12 px-6 font-bold"><a href="#plans">EXPLORE PACKAGES <ArrowRight /></a></Button>
              <Button variant="outline" size="lg" className="h-12 border-primary/50 bg-background/40 px-6" onClick={() => setSupportOpen(true)}><Headphones /> CONTACT SUPPORT</Button>
            </div>

            <div className="mt-4">
              {user && (
                <Button variant="outline" size="lg" className="h-auto min-h-10 whitespace-normal border-primary/40 text-primary" onClick={() => setReferralOpen(true)}>
                  <Gift className="size-5" />
                  Advance Server Free ရယူရန်
                </Button>
              )}
            </div>

            {user && (
              <Dialog open={referralOpen} onOpenChange={setReferralOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                  <DialogTitle className="sr-only">Advance Server Free ရယူရန်</DialogTitle>
                  <ReferralProgram />
                </DialogContent>
              </Dialog>
            )}

            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3 border-t border-primary/20 pt-5 text-center text-[11px] leading-loose text-muted-foreground">
              <div>
                <Zap className="mx-auto mb-2 size-4 text-primary" />{lang === "en" ? "~5 min delivery" : "၅ မိနစ်အတွင်း"}
              </div>
              <div>
                <ShieldCheck className="mx-auto mb-1 size-4 text-primary" />
                {lang === "en" ? "Trusted service" : "စိတ်ချရသော ဝန်ဆောင်မှု"}
              </div>
              <div>
                <Sparkles className="mx-auto mb-1 size-4 text-primary" />
                Free Diamonds
              </div>
            </div>
            </div>
          </div>
        </section>

        <FlashSaleSection onBuy={onBuy} />

        <section id="plans" className="mx-auto max-w-6xl px-4 pb-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gradient sm:text-3xl">{t("plans_title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("plans_sub")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <PlanCard key={p.key} plan={p} onBuy={onBuy} sold={salesByPlan?.[p.key] ?? 0} isBestSeller={p.key === bestSellerKey} />
            ))}
          </div>

        </section>
      </main>

      <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SNW Advance Server Shop
        <span className="mx-2 opacity-40">·</span>
        <Link to="/admin" className="opacity-50 transition hover:text-primary hover:opacity-100">
          Admin
        </Link>
      </footer>

      <CheckoutDialog plan={plan} open={open} onOpenChange={setOpen} />
      <ContactDialog open={supportOpen} onOpenChange={setSupportOpen} />
      <TelegramFab />

    </div>
  );
}
