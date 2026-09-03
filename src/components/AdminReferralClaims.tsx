import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PLANS } from "@/lib/plans";

type Claim = {
  id: string;
  user_id: string;
  promo_code: string;
  points_at_claim: number;
  full_name: string | null;
  telegram_username: string | null;
  contact_email: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
};

function ClaimOrders({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ["referred-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("referred_orders", { _user_id: userId });
      if (error) throw error;
      return data ?? [];
    },
  });

  const completed = (data ?? []).filter((o) => o.status === "completed");

  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-secondary/30 p-3">
      <p className="text-xs font-semibold text-primary">
        ဖိတ်ခေါ်ထားသော အော်ဒါများ ({completed.length} completed / {(data ?? []).length} total)
      </p>
      {(data ?? []).length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">မှတ်တမ်းမရှိပါ။</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {(data ?? []).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="text-foreground/90">{o.full_name}</span>
              <span className="text-muted-foreground">
                · {PLANS.find((p) => p.key === o.plan_key)?.priceLabel ?? o.plan_key}
              </span>
              <span
                className={
                  o.status === "completed"
                    ? "font-semibold text-emerald-400"
                    : "font-semibold text-gold"
                }
              >
                {o.status}
              </span>
              <span className="text-muted-foreground">
                · {new Date(o.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminReferralClaims() {
  const qc = useQueryClient();

  const { data: claims } = useQuery({
    queryKey: ["referral-claims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_claims")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Claim[];
    },
  });

  const review = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("referral_claims").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Claim updated");
      qc.invalidateQueries({ queryKey: ["referral-claims"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <div className="space-y-4">
      {(claims ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">တောင်းဆိုမှု မရှိသေးပါ။</p>
      )}
      {(claims ?? []).map((c) => (
        <div key={c.id} className="metal-card rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold text-gradient">
                <Gift className="size-4 text-gold" /> {c.promo_code}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.full_name || "—"} · {c.telegram_username || "—"} · {c.contact_email || "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                အမှတ်: {c.points_at_claim} · {new Date(c.created_at).toLocaleString()}
              </p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  c.status === "approved"
                    ? "text-emerald-400"
                    : c.status === "rejected"
                      ? "text-destructive"
                      : "text-gold"
                }`}
              >
                {c.status}
              </p>
            </div>
            {c.status === "pending" && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: c.id, status: "approved" })}
                >
                  <Check className="size-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: c.id, status: "rejected" })}
                >
                  <X className="size-4" /> Reject
                </Button>
              </div>
            )}
          </div>
          <ClaimOrders userId={c.user_id} />
        </div>
      ))}
    </div>
  );
}
