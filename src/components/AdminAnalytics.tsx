import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { PLANS } from "@/lib/plans";

const COMPLETED = ["completed", "delivered"];

type Row = {
  id: string;
  plan_key: string;
  price_mmk: number;
  discount_mmk: number;
  status: string;
  source: string;
  created_at: string;
  full_name: string;
};

const mmk = (n: number) => `${n.toLocaleString("en-US")} MMK`;

function Card({ title, revenue, count }: { title: string; revenue: number; count: number }) {
  return (
    <div className="metal-card rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-2 text-lg font-bold text-gradient">{mmk(revenue)}</p>
      <p className="text-[11px] text-muted-foreground">စုစုပေါင်းရောင်းရငွေ</p>
      <p className="mt-2 text-sm font-semibold text-gold">{count} ခု</p>
      <p className="text-[11px] text-muted-foreground">ရောင်းရသည့်အကောင့်အရေအတွက်</p>
    </div>
  );
}

export function AdminAnalytics() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: orders } = useQuery({
    queryKey: ["analytics-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, plan_key, price_mmk, discount_mmk, status, source, created_at, full_name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const sold = useMemo(
    () => (orders ?? []).filter((o) => COMPLETED.includes(o.status.toLowerCase())),
    [orders],
  );

  const sum = (rows: Row[]) => ({
    revenue: rows.reduce((a, r) => a + (r.price_mmk - (r.discount_mmk ?? 0)), 0),
    count: rows.length,
  });

  const now = new Date();
  const daily = sum(sold.filter((r) => new Date(r.created_at).toDateString() === now.toDateString()));
  const monthly = sum(
    sold.filter((r) => {
      const d = new Date(r.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }),
  );
  const yearly = sum(sold.filter((r) => new Date(r.created_at).getFullYear() === now.getFullYear()));
  const all = sum(sold);

  const hasRange = Boolean(from || to);
  const ranged = useMemo(() => {
    if (!hasRange) return sold;
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59.999`) : null;
    return sold.filter((r) => {
      const d = new Date(r.created_at);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [sold, from, to, hasRange]);

  const rangeTotals = sum(ranged);

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-bold text-gradient">အရောင်းနှင့် ဝင်ငွေ စာရင်းဇယား</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="ယနေ့ အရောင်းစာရင်း" {...(hasRange ? rangeTotals : daily)} />
        <Card title="ယခုလ အရောင်းစာရင်း" {...(hasRange ? rangeTotals : monthly)} />
        <Card title="ယခုနှစ် အရောင်းစာရင်း" {...(hasRange ? rangeTotals : yearly)} />
        <Card title="စုစုပေါင်း အရောင်းစာရင်း" {...(hasRange ? rangeTotals : all)} />
      </div>

      <div className="metal-card rounded-2xl p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <CalendarRange className="size-4" /> ရက်စွဲအလိုက် စစ်ဆေးရန်
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">စတင်မည့်ရက်</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">အဆုံးသတ်မည့်ရက်</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button
            variant="outline"
            disabled={!hasRange}
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            <RotateCcw className="size-4" /> ပြန်လည်စတင်ရန်
          </Button>
        </div>
      </div>

      <div className="metal-card overflow-x-auto rounded-2xl p-4">
        <p className="text-sm font-semibold text-primary">အသေးစိတ် အရောင်းစာရင်း</p>
        <table className="mt-3 w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-2">ရက်စွဲ</th>
              <th className="py-2">Plan</th>
              <th className="py-2">ဝယ်ယူသူ</th>
              <th className="py-2">ရင်းမြစ်</th>
              <th className="py-2 text-right">ရောင်းရငွေ</th>
            </tr>
          </thead>
          <tbody>
            {ranged.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-xs text-muted-foreground">
                  မှတ်တမ်း မရှိသေးပါ။
                </td>
              </tr>
            )}
            {ranged.map((r) => (
              <tr key={r.id} className="border-t border-border/50">
                <td className="py-2 text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="py-2">{PLANS.find((p) => p.key === r.plan_key)?.priceLabel ?? r.plan_key}</td>
                <td className="py-2">{r.full_name}</td>
                <td className="py-2 text-xs text-muted-foreground">
                  {r.source === "telegram" ? "Telegram (ပြင်ပအရောင်း)" : "Website"}
                </td>
                <td className="py-2 text-right font-semibold text-gold">
                  {mmk(r.price_mmk - (r.discount_mmk ?? 0))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={4} className="py-2 text-xs text-muted-foreground">
                စုစုပေါင်း ({rangeTotals.count} ခု)
              </td>
              <td className="py-2 text-right font-bold text-gradient">{mmk(rangeTotals.revenue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
