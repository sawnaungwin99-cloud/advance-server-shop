import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { PLANS } from "@/lib/plans";
import { notifyDelivered } from "@/lib/order-delivery.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SNW Advance Server Shop" },
      { name: "description", content: "Manage and fulfil Advance Server account orders." },
      { property: "og:title", content: "Admin Dashboard — SNW Advance Server Shop" },
      { property: "og:description", content: "Manage and fulfil Advance Server account orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = [
  { value: "pending", label: "Pending / စောင့်ဆိုင်းဆဲ" },
  { value: "confirmed", label: "Confirmed / အတည်ပြုပြီး" },
  { value: "delivered", label: "Delivered / ပြီးစီးပါပြီ" },
] as const;

const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

function AdminPage() {
  const { t } = useLang();
  const { isAdmin, user, loading } = useAuth();
  const qc = useQueryClient();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders } = useQuery({
    queryKey: ["all-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!term) return true;
      return [o.id, o.phone, o.ign, o.full_name, o.target_gmail, o.telegram_username]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [orders, q, statusFilter]);

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      let assign: Awaited<ReturnType<typeof assignStockToOrder>> | null = null;
      if (status === "confirmed" || status === "delivered") {
        try {
          assign = await assignStockToOrder({ data: { order_id: id } });
        } catch {
          assign = null;
        }
      }
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
      let notify: { telegram: boolean; reason: string } | null = null;
      if (status === "delivered") {
        try {
          notify = await notifyDelivered({ data: { order_id: id } });
        } catch {
          notify = { telegram: false, reason: "send_failed" };
        }
      }
      return { assign, notify };
    },
    onSuccess: ({ assign, notify }) => {
      toast.success("Order status updated");
      if (assign?.assigned === false) {
        toast.warning("Stock မရှိပါ — ဤ Plan အတွက် အကောင့်အသစ် ထည့်ပါ။");
      } else if (assign?.assigned) {
        toast.success("အကောင့်တစ်ခု အလိုအလျောက် ပေးအပ်ပြီးပါပြီ။");
      }
      if (notify && !notify.telegram) {
        toast.warning(
          notify.reason === "no_username"
            ? "Telegram username မပါသဖြင့် Telegram အကြောင်းကြားချက် မပို့နိုင်ပါ။"
            : "Telegram အကြောင်းကြားချက် မပို့နိုင်ပါ (customer က Bot ကို Start နှိပ်ထားရန်လိုပါသည်)။",
        );
      } else if (notify?.telegram) {
        toast.success("Telegram အကြောင်းကြားချက် ပို့ပြီးပါပြီ။");
      }
      qc.invalidateQueries({ queryKey: ["all-orders"] });
      qc.invalidateQueries({ queryKey: ["stock-accounts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const openReceipt = async (path: string) => {
    const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 600);
    if (error || !data) {
      toast.error("Receipt not available");
      return;
    }
    setReceiptUrl(data.signedUrl);
    window.open(data.signedUrl, "_blank", "noopener");
  };

  if (!loading && !user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-gradient">Admin Login</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Admin Dashboard ကို ဝင်ရောက်ရန် အကောင့်ဝင်ပါ။
          </p>
          <Button asChild className="mt-6 glow-cyan">
            <Link to="/auth">အကောင့်ဝင်ရန် / Login</Link>
          </Button>
        </main>
      </div>
    );
  }

  if (!loading && user && !isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">{t("admin_denied")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gradient">{t("admin_title")}</h1>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Order No. / Phone / Game ID ဖြင့် ရှာပါ"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("orders_empty")}</p>
          )}
          {filtered.map((o) => {
            const plan = PLANS.find((p) => p.key === o.plan_key);
            return (
              <div key={o.id} className="metal-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gradient">
                      {plan?.priceLabel ?? `${o.price_mmk} MMK`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Order No. #{o.id.slice(0, 8).toUpperCase()} ·{" "}
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-gold">{statusLabel(o.status)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.receipt_path && (
                      <Button variant="outline" size="sm" onClick={() => openReceipt(o.receipt_path!)}>
                        {t("view_receipt")}
                      </Button>
                    )}
                    <Select
                      value={STATUSES.some((s) => s.value === o.status) ? o.status : "pending"}
                      onValueChange={(v) => update.mutate({ id: o.id, status: v })}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <dl className="mt-4 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>Name — <span className="text-foreground/90">{o.full_name}</span></div>
                  <div>Phone — <span className="text-foreground/90">{o.phone}</span></div>
                  <div>Email — <span className="text-foreground/90">{o.target_gmail}</span></div>
                  <div>Game ID / IGN — <span className="text-foreground/90">{o.ign}</span></div>
                  <div>Telegram — <span className="text-foreground/90">{o.telegram_username || "-"}</span></div>
                  <div>Plan — <span className="text-foreground/90">{plan?.titleMy ?? o.plan_key}</span></div>
                </dl>
              </div>
            );
          })}
        </div>

        {receiptUrl && (
          <img
            src={receiptUrl}
            alt="Payment receipt"
            className="mt-6 max-h-96 rounded-xl border border-border"
          />
        )}
      </main>
    </div>
  );
}
