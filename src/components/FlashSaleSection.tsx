import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FLASH_PLANS, countdownFrom, pad2 } from "@/lib/flash-sale";
import type { Plan } from "@/lib/plans";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[4.25rem] rounded-xl border border-red-500/40 bg-black/50 px-3 py-2 text-center">
      <div className="text-2xl font-extrabold text-gold sm:text-3xl">{pad2(value)}</div>
      <div className="mt-0.5 text-[0.65rem] text-red-200/80">{label}</div>
    </div>
  );
}

export function FlashSaleSection({ onBuy }: { onBuy: (p: Plan) => void }) {
  const [now, setNow] = useState(() => Date.now());

  const { data: settings } = useQuery({
    queryKey: ["flash-sale-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sale_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const cd = countdownFrom(settings?.ends_at, now);
  if (!settings?.is_active || cd.done) return null;

  return (
    <section className="px-4 pb-6">
      <div className="mx-auto max-w-5xl rounded-3xl border-2 border-red-600/70 bg-gradient-to-b from-red-950/70 via-black/70 to-black/70 p-5 shadow-[0_0_45px_-8px_rgba(239,68,68,0.75)] sm:p-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/60 bg-red-600/20 px-4 py-1 text-xs font-semibold text-red-200">
            <Flame className="size-4 animate-pulse text-red-400" /> FLASH SALE
          </span>
          <h2 className="mt-4 text-xl font-extrabold leading-snug text-red-100 sm:text-3xl">
            🔥 အထူးသတင်း - (၃) ရက်သာ ရရှိမည့် အထူးလျော့ဈေး အစီအစဉ်!
          </h2>
          <p className="mt-2 text-sm text-red-200/85">သတ်မှတ်ချိန်အတွင်း အမြန်ဆုံး ဝယ်ယူလိုက်ပါ!</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Unit value={cd.days} label="ရက်" />
            <Unit value={cd.hours} label="နာရီ" />
            <Unit value={cd.minutes} label="မိနစ်" />
            <Unit value={cd.seconds} label="စက္ကန့်" />
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {FLASH_PLANS.map((p) => (
            <div
              key={p.key}
              className="rounded-2xl border border-red-500/40 bg-black/55 p-5 text-center backdrop-blur-sm"
            >
              <h3 className="text-sm font-bold tracking-wide text-red-100 sm:text-base">{p.titleMy}</h3>
              <div className="mt-4 flex items-baseline justify-center gap-3">
                <span className="text-base text-muted-foreground line-through">{p.originalPriceLabel}</span>
                <span className="text-3xl font-extrabold text-gold drop-shadow-[0_0_12px_rgba(255,200,60,0.5)]">
                  {p.priceLabel}
                </span>
              </div>
              <ul className="mt-4 space-y-1 text-left text-xs text-muted-foreground">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full bg-red-600 font-bold text-white hover:bg-red-500"
                onClick={() => onBuy(p)}
              >
                🔥 အခုပဲ ဝယ်ယူမည်
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-red-200/70">
          ⚠️ အထူးလျော့ဈေး Plan များကို Promo Code ဖြင့် ထပ်မံ လျှော့ဝယ်၍ မရပါ။
        </p>
      </div>
    </section>
  );
}
