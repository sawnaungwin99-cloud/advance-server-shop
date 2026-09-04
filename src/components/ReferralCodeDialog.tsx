import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2, RefreshCw, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function ReferralCodeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: Boolean(user) && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("promo_code, display_name")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id }, { onConflict: "id" })
        .select("promo_code, display_name")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Promo Code ထုတ်ပေးပြီးပါပြီ။");
      qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "မအောင်မြင်ပါ"),
  });

  const code = profile?.promo_code ?? "";

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Promo Code ကူးယူပြီးပါပြီ။");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-gradient">
            <Ticket className="size-5 text-primary" /> My Referral Code
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-loose text-muted-foreground">
          မိမိ၏ သီးသန့် Promo Code ကို သူငယ်ချင်းများထံ မျှဝေပါ။ သူတို့ ဝယ်ယူချိန်တွင် ဤ Code ကို
          ထည့်သွင်းပါက သူတို့လည်း လျှော့စျေးရပြီး သင့်အတွက်လည်း အမှတ် ရရှိပါမည်။
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : code ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">မိမိ၏ Promo Code</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-gold/40 bg-background/60 px-3 py-2 font-mono text-lg font-bold tracking-wider text-gold">
                {code}
              </span>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />} ကူးယူရန်
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="w-full glow-cyan"
            disabled={generate.isPending}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Promo Code ထုတ်ယူရန်
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
