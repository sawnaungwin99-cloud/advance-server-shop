import { useEffect, useState } from "react";
import { useHydrated } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getRecentSales, recentSalePlanName, recentSalePrice, recentSaleTime } from "@/lib/recent-sales";

export function RecentSalesTicker() {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const [display, setDisplay] = useState({ index: 0, visible: false, now: 0 });
  const { data, isError } = useQuery({
    queryKey: ["recent-completed-sales"],
    enabled: hydrated && !dismissed,
    queryFn: async () => {
      const { data: rows, error } = await supabase.rpc("recent_completed_sales");
      if (error) throw error;
      return rows ?? [];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const hasSales = Boolean(data?.length) && !isError;
  useEffect(() => {
    if (!hasSales || dismissed) return;
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    const show = () => {
      if (document.hidden) {
        timer = setTimeout(show, 5000);
        return;
      }
      setDisplay({ index, visible: true, now: Date.now() });
      timer = setTimeout(() => {
        setDisplay((current) => ({ ...current, visible: false }));
        index += 1;
        timer = setTimeout(show, 13_000);
      }, 7000);
    };
    timer = setTimeout(show, 5000);
    return () => clearTimeout(timer);
  }, [hasSales, dismissed]);

  const sales = getRecentSales(data ?? [], display.now);
  const sale = sales.length ? sales[display.index % sales.length] : undefined;
  if (dismissed || isError || !display.visible || !sale) return null;

  return (
    <aside
      aria-label="လတ်တလော ဝယ်ယူမှု"
      className="fixed bottom-24 left-4 z-40 w-[calc(100%-2rem)] max-w-[360px] rounded-lg border border-primary/30 bg-card p-4 shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 sm:bottom-5 sm:left-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
          <ShoppingBag className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <BadgeCheck className="size-3.5 shrink-0" aria-hidden="true" /> လတ်တလော ဝယ်ယူမှု
          </p>
          <p className="mt-1 text-xs leading-6 text-foreground">
            {sale.buyer_label ? <span className="font-semibold text-foreground">{sale.buyer_label}</span> : "ဝယ်ယူသူတစ်ဦး"} မှ <span className="font-semibold text-gold">{recentSalePlanName(sale.plan_key)}</span>{recentSalePrice(sale.plan_key) && <> (<span className="font-semibold text-primary">{recentSalePrice(sale.plan_key)}</span>)</>} ဝယ်ယူသွားပါသည်။
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{recentSaleTime(sale.purchased_at, display.now)}</p>
        </div>
        <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground" aria-label="ဝယ်ယူမှု အသိပေးချက် ပိတ်ရန်" title="ဝယ်ယူမှု အသိပေးချက် ပိတ်ရန်" onClick={() => setDismissed(true)}>
          <X className="size-4" />
        </Button>
      </div>
    </aside>
  );
}