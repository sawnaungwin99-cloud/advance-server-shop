import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PlanCard } from "@/components/PlanCard";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { TelegramFab } from "@/components/TelegramFab";
import { PaymentAccounts } from "@/components/PaymentAccounts";
import { WelcomeNotice } from "@/components/WelcomeNotice";
import { VideoTutorials } from "@/components/VideoTutorials";

import { useLang } from "@/lib/i18n";
import { PLANS, type Plan } from "@/lib/plans";

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
      {
        property: "og:description",
        content: "Trusted Mobile Legends Advance Server accounts. Free diamonds, early heroes, instant delivery in ~5 minutes.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useLang();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);

  const onBuy = (p: Plan) => {
    setPlan(p);
    setOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="hero-aura relative overflow-hidden px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs text-primary">
              <Sparkles className="size-4" />
              <span className="snw-gaming text-2xl leading-none sm:text-3xl">SNW GAMING</span>
            </span>
            <h1 className="mt-5 text-2xl font-bold leading-snug sm:text-4xl">{t("hero_title")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-loose text-muted-foreground sm:text-base">
              {t("hero_sub")}
            </p>
            <Button asChild size="lg" className="mt-8 glow-cyan">
              <a href="#plans">{t("hero_cta")}</a>
            </Button>

            <div className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="metal-card rounded-xl p-3">
                <Zap className="mx-auto mb-1 size-4 text-gold" />၅ မိနစ်အတွင်း
              </div>
              <div className="metal-card rounded-xl p-3">
                <ShieldCheck className="mx-auto mb-1 size-4 text-primary" />
                စိတ်ချရသော ဝန်ဆောင်မှု
              </div>
              <div className="metal-card rounded-xl p-3">
                <Sparkles className="mx-auto mb-1 size-4 text-gold" />
                Free Diamonds
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-6xl px-4 pb-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gradient sm:text-3xl">{t("plans_title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("plans_sub")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <PlanCard key={p.key} plan={p} onBuy={onBuy} />
            ))}
          </div>

          <div className="mt-12">
            <h3 className="mb-3 text-center text-lg font-semibold text-gold">{t("pay_title")}</h3>
            <div className="mx-auto max-w-2xl">
              <PaymentAccounts />
            </div>
          </div>
        </section>

        <VideoTutorials />
      </main>

      <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SNW Advance Server Shop
        <span className="mx-2 opacity-40">·</span>
        <Link to="/admin" className="opacity-50 transition hover:text-primary hover:opacity-100">
          Admin
        </Link>
      </footer>

      <WelcomeNotice />
      <CheckoutDialog plan={plan} open={open} onOpenChange={setOpen} />
      <TelegramFab />

    </div>
  );
}
