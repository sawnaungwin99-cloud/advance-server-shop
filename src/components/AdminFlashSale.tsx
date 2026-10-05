import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Flame, Leaf, RotateCcw, Snowflake, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { countdownFrom, pad2 } from "@/lib/flash-sale";

export function AdminFlashSale() {
  const qc = useQueryClient();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

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
  });

  const save = useMutation({
    mutationFn: async (patch: {
      is_active?: boolean;
      is_christmas_theme?: boolean;
      is_summer_theme?: boolean;
      is_thadingyut_theme?: boolean;
      start_at?: string | null;
      ends_at?: string | null;
    }) => {
      if (settings?.id) {
        const { error } = await supabase.from("flash_sale_settings").update(patch).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("flash_sale_settings").insert(patch);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flash-sale-settings"] });
      toast.success("အထူးလျော့ဈေး အချက်အလက် သိမ်းဆည်းပြီးပါပြီ။");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "မအောင်မြင်ပါ"),
  });

  const cd = countdownFrom(settings?.ends_at, now);
  const running = Boolean(settings?.is_active) && !cd.done;

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gold">
        <Flame className="size-5 text-red-500" /> အထူးလျော့ဈေး စီမံခန့်ခွဲမှု
      </h2>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
        <Label htmlFor="flash-toggle" className="text-sm">
          အထူးလျော့ဈေး အစီအစဉ် ဖွင့်/ပိတ်
        </Label>
        <Switch
          id="flash-toggle"
          checked={Boolean(settings?.is_active)}
          onCheckedChange={(v) => save.mutate({ is_active: v })}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
        <Label htmlFor="thadingyut-toggle" className="text-sm leading-relaxed">
          သီတင်းကျွတ် မီးပုံးအလှ ဖွင့်/ပိတ်
        </Label>
        <Switch
          id="thadingyut-toggle"
          checked={Boolean(settings?.is_thadingyut_theme)}
          disabled={save.isPending}
          onCheckedChange={(value) => save.mutate({ is_thadingyut_theme: value })}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
        <Label htmlFor="christmas-toggle" className="flex items-center gap-2 text-sm leading-relaxed">
          <Snowflake className="size-4 shrink-0 text-primary" />
          ခရစ်စမတ် နှင်းအလှ ဖွင့်/ပိတ်
        </Label>
        <Switch
          id="christmas-toggle"
          checked={Boolean(settings?.is_christmas_theme)}
          disabled={save.isPending}
          onCheckedChange={(value) => save.mutate({ is_christmas_theme: value })}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
        <Label htmlFor="summer-toggle" className="flex items-center gap-2 text-sm leading-relaxed">
          <Leaf className="size-4 shrink-0 text-gold" />
          နွေရာသီ သစ်ရွက်ကြွေအလှ ဖွင့်/ပိတ် (Summer Promotion Decoration)
        </Label>
        <Switch
          id="summer-toggle"
          checked={Boolean(settings?.is_summer_theme)}
          disabled={save.isPending}
          onCheckedChange={(value) => save.mutate({ is_summer_theme: value })}
        />
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">လက်ရှိအခြေအနေ</span>
          <span className={running ? "font-bold text-emerald-400" : "font-bold text-muted-foreground"}>
            {running ? "အသက်ဝင်နေသည် (Active)" : "ပိတ်ထားသည် (Inactive)"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground">ကျန်ရှိချိန်</span>
          <span className="font-bold text-gold">
            {running
              ? `${cd.days} ရက် ${pad2(cd.hours)}:${pad2(cd.minutes)}:${pad2(cd.seconds)}`
              : "—"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground">ပြီးဆုံးမည့်အချိန်</span>
          <span>{settings?.ends_at ? new Date(settings.ends_at).toLocaleString() : "—"}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1 bg-red-600 text-white hover:bg-red-500"
          disabled={save.isPending}
          onClick={() => {
            const start = new Date();
            const end = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
            save.mutate({ is_active: true, start_at: start.toISOString(), ends_at: end.toISOString() });
          }}
        >
          <RotateCcw className="size-4" /> ၃ ရက်စာ အစီအစဉ် အသစ်ပြန်စမည်
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={save.isPending}
          onClick={() => save.mutate({ is_active: false })}
        >
          <StopCircle className="size-4" /> အခုချက်ချင်း ရပ်တန့်မည်
        </Button>
      </div>
    </div>
  );
}
