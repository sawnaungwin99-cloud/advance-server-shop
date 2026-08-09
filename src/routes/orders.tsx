import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Header } from "@/components/Header";
import { TelegramFab } from "@/components/TelegramFab";
import { DeliveredCredentials } from "@/components/DeliveredCredentials";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { PLANS, TELEGRAM_URL } from "@/lib/plans";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — SNW Advance Server Shop" },
      { name: "description", content: "Track the progress of your Mobile Legends Advance Server account orders." },
      { property: "og:title", content: "My Orders — SNW Advance Server Shop" },
      { property: "og:description", content: "Track the progress of your Advance Server account orders." },
    ],
  }),
  component: OrdersPage,
});

export const STATUS_KEYS = {
  pending: "st_pending",
  processing: "st_processing",
  completed: "st_completed",
  rejected: "st_rejected",
} as const;

function OrdersPage() {
  const { t } = useLang();
  const { user, loading } = useAuth();

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gradient">{t("orders_title")}</h1>

        {!loading && !user && (
          <div className="metal-card mt-6 rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("gate_desc")}</p>
            <Button asChild className="mt-4 glow-cyan">
              <Link to="/auth">{t("gate_cta")}</Link>
            </Button>
          </div>
        )}

        {user && (
          <div className="mt-6 space-y-4">
            {orders?.length === 0 && <p className="text-sm text-muted-foreground">{t("orders_empty")}</p>}
            {orders?.map((o) => {
              const plan = PLANS.find((p) => p.key === o.plan_key);
              const statusKey = STATUS_KEYS[o.status as keyof typeof STATUS_KEYS] ?? "st_pending";
              return (
                <div key={o.id} className="metal-card rounded-2xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gradient">{plan?.priceLabel ?? `${o.price_mmk} MMK`}</p>
                      <p className="text-xs text-muted-foreground">{plan?.titleMy}</p>
                    </div>
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
                      {t(statusKey)}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                    <div>အမည် — <span className="text-foreground/90">{o.full_name}</span></div>
                    <div>ဖုန်း — <span className="text-foreground/90">{o.phone}</span></div>
                    <div>Gmail — <span className="text-foreground/90">{o.target_gmail}</span></div>
                    <div>IGN — <span className="text-foreground/90">{o.ign}</span></div>
                  </dl>
                  {o.delivered_username && o.delivered_password && (
                    <div className="mt-4">
                      <DeliveredCredentials
                        username={o.delivered_username}
                        password={o.delivered_password}
                      />
                    </div>
                  )}
                  {o.admin_note && <p className="mt-3 text-sm text-gold">{o.admin_note}</p>}
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <a href={TELEGRAM_URL} target="_blank" rel="noreferrer noopener">
                      <Send className="size-4" /> {t("telegram_cta")}
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <TelegramFab />
    </div>
  );
}
