import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SNW Advance Server Shop" },
      { name: "description", content: "Manage and fulfil Advance Server account orders." },
      { property: "og:title", content: "Admin Dashboard — SNW Advance Server Shop" },
      { property: "og:description", content: "Manage and fulfil Advance Server account orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = ["pending", "processing", "completed", "rejected"] as const;

function AdminPage() {
  const { t } = useLang();
  const { isAdmin, user, loading } = useAuth();
  const qc = useQueryClient();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const { data: orders } = useQuery({
    queryKey: ["all-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["all-orders"] });
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

  if (!loading && (!user || !isAdmin)) {
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

        <div className="mt-6 space-y-4">
          {orders?.length === 0 && <p className="text-sm text-muted-foreground">{t("orders_empty")}</p>}
          {orders?.map((o) => {
            const plan = PLANS.find((p) => p.key === o.plan_key);
            return (
              <div key={o.id} className="metal-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gradient">{plan?.priceLabel ?? `${o.price_mmk} MMK`}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.receipt_path && (
                      <Button variant="outline" size="sm" onClick={() => openReceipt(o.receipt_path!)}>
                        {t("view_receipt")}
                      </Button>
                    )}
                    <Select value={o.status} onValueChange={(v) => update.mutate({ id: o.id, status: v })}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <dl className="mt-4 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>Name — <span className="text-foreground/90">{o.full_name}</span></div>
                  <div>Phone — <span className="text-foreground/90">{o.phone}</span></div>
                  <div>Target Gmail — <span className="text-foreground/90">{o.target_gmail}</span></div>
                  <div>In-Game Name — <span className="text-foreground/90">{o.ign}</span></div>
                </dl>
              </div>
            );
          })}
        </div>

        {receiptUrl && (
          <img src={receiptUrl} alt="Payment receipt" className="mt-6 max-h-96 rounded-xl border border-border" />
        )}
      </main>
    </div>
  );
}
