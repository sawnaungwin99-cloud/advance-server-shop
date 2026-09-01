import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { History, RotateCcw, Search } from "lucide-react";
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
import { assignStockToOrder } from "@/lib/inventory.functions";
import { AdminInventory } from "@/components/AdminInventory";
import { DeliveredCredentials } from "@/components/DeliveredCredentials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  { value: "processing", label: "Processing / ဆောင်ရွက်နေပြီ" },
  { value: "completed", label: "Completed / ပြီးစီးပြီ" },
  { value: "rejected", label: "Rejected / ငြင်းပယ်သည်" },
] as const;

const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

function AdminPage() {
  const { t } = useLang();
  const { isAdmin, user, loading } = useAuth();
  const qc = useQueryClient();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

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

  const { data: auditLogs } = useQuery({
    queryKey: ["order-audit-logs"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const logsByOrder = useMemo(() => {
    const map: Record<string, NonNullable<typeof auditLogs>> = {};
    for (const log of auditLogs ?? []) {
      (map[log.order_id] ??= []).push(log);
    }
    return map;
  }, [auditLogs]);

  const hasFilters = q.trim() !== "" || statusFilter !== "all" || planFilter !== "all";

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (planFilter !== "all" && o.plan_key !== planFilter) return false;
      if (!term) return true;
      return [o.id, o.phone, o.ign, o.full_name, o.target_gmail, o.telegram_username]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [orders, q, statusFilter, planFilter]);


  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      let assign: Awaited<ReturnType<typeof assignStockToOrder>> | null = null;
      let notify: { telegram: boolean; reason: string } | null = null;

      if (status === "completed") {
        // Server function assigns stock AND flips the order to "completed".
        // Do NOT swallow the error: if it fails the status must not look updated.
        assign = await assignStockToOrder({ data: { order_id: id } });
        if (!assign.assigned) {
          throw new Error("Stock မရှိပါ — ဤ Plan အတွက် အကောင့်အသစ် ထည့်ပါ။");
        }
        try {
          notify = await notifyDelivered({ data: { order_id: id } });
        } catch {
          notify = { telegram: false, reason: "send_failed" };
        }
      } else {
        // Every other status is a plain admin update through RLS.
        const { error } = await supabase.from("orders").update({ status }).eq("id", id);
        if (error) throw error;
      }

      return { assign, notify };
    },
    onSuccess: ({ assign, notify }) => {
      toast.success("Order status updated");

      if (assign?.assigned) {
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
      qc.invalidateQueries({ queryKey: ["order-audit-logs"] });
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

        <Tabs defaultValue="orders" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-96">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="stock">Stock / Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
        <div className="mt-6 flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Order No. / Phone / Name / Game ID ဖြင့် ရှာပါ"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-56">
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
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full lg:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {PLANS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.priceLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={!hasFilters}
            onClick={() => {
              setQ("");
              setStatusFilter("all");
              setPlanFilter("all");
            }}
          >
            <RotateCcw className="size-4" /> Clear Filters
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {hasFilters ? "No orders found matching your search" : t("orders_empty")}
            </p>
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

                {o.delivered_username && o.delivered_password && (
                  <div className="mt-4">
                    <DeliveredCredentials
                      username={o.delivered_username}
                      password={o.delivered_password}
                    />
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-border/60 bg-secondary/30 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <History className="size-4" /> Audit Log / History
                  </p>
                  {(logsByOrder[o.id] ?? []).length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No status changes recorded yet.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {(logsByOrder[o.id] ?? []).map((log) => (
                        <li key={log.id} className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-muted-foreground">
                            {statusLabel(log.previous_status ?? "—")}
                          </span>
                          <span className="text-muted-foreground">➔</span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-semibold ${
                              log.new_status === "completed"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : log.new_status === "rejected"
                                  ? "bg-destructive/15 text-destructive"
                                  : log.new_status === "processing"
                                    ? "bg-primary/15 text-primary"
                                    : "bg-gold/15 text-gold"
                            }`}
                          >
                            {statusLabel(log.new_status)}
                          </span>
                          <span className="text-muted-foreground">
                            · {log.changed_by_email ?? log.changed_by ?? "system"} ·{" "}
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
          </TabsContent>

          <TabsContent value="stock" className="mt-6">
            <AdminInventory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
