import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Clock, Info, TriangleAlert } from "lucide-react";
import { FEATURES_MY, type Plan } from "@/lib/plans";
import { useLang } from "@/lib/i18n";

export function PlanCard({ plan, onBuy }: { plan: Plan; onBuy: (plan: Plan) => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`metal-card relative flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 ${
          plan.popular ? "glow-gold" : ""
        }`}
      >
        {plan.popular && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-gold-foreground">
            {t("popular")}
          </span>
        )}

        <p className="brand-title text-xs text-muted-foreground">{plan.nameEn}</p>
        <p className="mt-2 text-3xl font-bold text-gradient">{plan.priceLabel}</p>
        <p className="text-sm text-muted-foreground">{plan.titleMy}</p>

        <ul className="mt-5 space-y-2.5">
          {FEATURES_MY.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="size-3 text-primary" />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Button className="glow-cyan" onClick={() => onBuy(plan)}>
            {t("buy_now")}
          </Button>
          <Button variant="outline" onClick={() => setOpen(true)}>
            {t("view_details")}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-gradient">{plan.titleMy}</DialogTitle>
          </DialogHeader>

          <section className="space-y-4 text-sm leading-relaxed">
            <div>
              <h3 className="mb-1 flex items-center gap-2 font-semibold text-primary">
                <Info className="size-4" /> အကောင့်အကြောင်းအရာ
              </h3>
              <p className="text-muted-foreground">{plan.overview}</p>
            </div>

            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
              <h3 className="mb-1 flex items-center gap-2 font-semibold text-destructive">
                <TriangleAlert className="size-4" /> အရေးကြီးမှတ်ချက်
              </h3>
              <p className="text-foreground/85">{plan.warning}</p>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-gold">လိုအပ်သောအချက်အလက်များ</h3>
              <ul className="space-y-1.5 text-muted-foreground">
                {plan.required.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-secondary/60 p-3">
              <Clock className="size-4 text-primary" />
              <span>
                ကြာချိန် — <span className="font-semibold">၅ မိနစ်ခန့်</span>
              </span>
            </div>
          </section>

          <Button
            className="mt-2 w-full glow-cyan"
            onClick={() => {
              setOpen(false);
              onBuy(plan);
            }}
          >
            {t("buy_now")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
