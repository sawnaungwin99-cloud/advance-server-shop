import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FLASH_PLANS, countdownFrom, pad2 } from "@/lib/flash-sale";
import type { Plan } from "@/lib/plans";

const LANTERNS = [
  { color: "text-gold", string: "h-6", delay: "lantern-delay-1" },
  { color: "text-primary", string: "h-10", delay: "lantern-delay-2" },
  { color: "text-destructive", string: "h-5", delay: "lantern-delay-3" },
  { color: "text-success", string: "h-9", delay: "lantern-delay-4" },
  { color: "text-gold", string: "h-7", delay: "lantern-delay-5" },
] as const;

function ThadingyutLanterns() {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-0 z-10 flex justify-around" aria-hidden="true">
      {LANTERNS.map((lantern, index) => (
        <div key={index} className={`festival-lantern ${lantern.color} ${lantern.delay}`}>
          <span className={`block w-px bg-current/55 ${lantern.string}`} />
          <svg viewBox="0 0 44 58" className="h-12 w-9 overflow-visible drop-shadow-lg sm:h-14 sm:w-11">
            <path d="M15 4h14l3 5H12l3-5Z" fill="currentColor" opacity=".75" />
            <path d="M10 11c0-3 24-3 24 0v29c0 8-24 8-24 0V11Z" fill="currentColor" />
            <path d="M15 12v29M22 10v34M29 12v29" fill="none" stroke="currentColor" strokeWidth="2" opacity=".45" />
            <ellipse cx="22" cy="25" rx="7" ry="13" fill="var(--background)" opacity=".18" />
            <path d="M14 45h16l-3 5H17l-3-5ZM19 50v6m6-6v6" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      ))}
    </div>
  );
}

const SNOWFLAKES = [
  { left: "4%", size: "text-xs", delay: "snow-delay-1", drift: "snow-drift-left" },
  { left: "12%", size: "text-lg", delay: "snow-delay-4", drift: "snow-drift-right" },
  { left: "22%", size: "text-sm", delay: "snow-delay-2", drift: "snow-drift-left" },
  { left: "31%", size: "text-xl", delay: "snow-delay-5", drift: "snow-drift-right" },
  { left: "41%", size: "text-xs", delay: "snow-delay-3", drift: "snow-drift-left" },
  { left: "50%", size: "text-lg", delay: "snow-delay-1", drift: "snow-drift-right" },
  { left: "60%", size: "text-sm", delay: "snow-delay-5", drift: "snow-drift-left" },
  { left: "69%", size: "text-xl", delay: "snow-delay-2", drift: "snow-drift-right" },
  { left: "78%", size: "text-xs", delay: "snow-delay-4", drift: "snow-drift-left" },
  { left: "87%", size: "text-lg", delay: "snow-delay-3", drift: "snow-drift-right" },
  { left: "95%", size: "text-sm", delay: "snow-delay-1", drift: "snow-drift-left" },
] as const;

function ChristmasSnow() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]" aria-hidden="true">
      <div className="christmas-snow-cap christmas-snow-cap-top" />
      {SNOWFLAKES.map((flake, index) => (
        <span
          key={index}
          className={`christmas-snowflake ${flake.size} ${flake.delay} ${flake.drift}`}
          style={{ left: flake.left }}
        >
          ❄
        </span>
      ))}
      <div className="christmas-snow-cap christmas-snow-cap-bottom" />
    </div>
  );
}

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

  const christmas = Boolean(settings.is_christmas_theme);
  const thadingyut = Boolean(settings.is_thadingyut_theme) && !christmas;

  return (
    <section className="px-4 pb-6">
      <div
        className={`relative mx-auto max-w-5xl overflow-hidden rounded-3xl border-2 border-red-600/70 bg-gradient-to-b from-red-950/70 via-black/70 to-black/70 p-5 shadow-[0_0_45px_-8px_rgba(239,68,68,0.75)] sm:p-8 ${thadingyut ? "pt-24 sm:pt-28" : ""} ${christmas ? "christmas-sale-card pt-14 sm:pt-16" : ""}`}
      >
        {thadingyut && <ThadingyutLanterns />}
        {christmas && <ChristmasSnow />}
        <div className="relative z-20 text-center">
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

        <div className="relative z-20 mt-7 grid gap-4 sm:grid-cols-2">
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

        <p className="relative z-20 mt-5 text-center text-xs text-red-200/70">
          ⚠️ အထူးလျော့ဈေး Plan များကို Promo Code ဖြင့် ထပ်မံ လျှော့ဝယ်၍ မရပါ။
        </p>
      </div>
    </section>
  );
}
