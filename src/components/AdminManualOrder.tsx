import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PLANS } from "@/lib/plans";

export function AdminManualOrder() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [planKey, setPlanKey] = useState(PLANS[0]?.key ?? "");
  const [amount, setAmount] = useState(String(PLANS[0]?.price ?? ""));
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const price = Number(amount);
    if (!planKey || !Number.isFinite(price) || price <= 0) {
      toast.error("Plan နှင့် ရောင်းရငွေပမာဏ မှန်ကန်စွာ ဖြည့်ပါ။");
      return;
    }
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Admin အကောင့် ဝင်ရန်လိုပါသည်။");

      let receiptPath: string | null = null;
      if (file) {
        const path = `${uid}/manual-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("receipts").upload(path, file);
        if (upErr) throw upErr;
        receiptPath = path;
      }

      const { error } = await supabase.from("orders").insert({
        user_id: uid,
        plan_key: planKey,
        price_mmk: Math.round(price),
        full_name: "Telegram (ပြင်ပအရောင်း)",
        phone: "-",
        target_gmail: "manual@telegram.local",
        ign: "-",
        payment_method: "telegram",
        status: "completed",
        source: "telegram",
        receipt_path: receiptPath,
      });
      if (error) throw error;

      toast.success("Telegram အရောင်းစာရင်း သွင်းပြီးပါပြီ။");
      qc.invalidateQueries({ queryKey: ["all-orders"] });
      qc.invalidateQueries({ queryKey: ["analytics-orders"] });
      qc.invalidateQueries({ queryKey: ["plan-sales"] });
      setOpen(false);
      setFile(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "စာရင်းသွင်း၍ မရပါ။");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glow-cyan">
          <Send className="size-4" /> Telegram အရောင်းစာရင်းသွင်းရန်
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Telegram အရောင်းစာရင်းသွင်းရန်</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Plan ရွေးချယ်ရန်</Label>
            <Select
              value={planKey}
              onValueChange={(v) => {
                setPlanKey(v);
                const p = PLANS.find((x) => x.key === v);
                if (p) setAmount(String(p.price));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.priceLabel} — {p.nameMy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">ရောင်းရငွေပမာဏ</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              ငွေလွှဲပြေစာ (Screenshot) တင်ရန်
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button className="w-full glow-cyan" disabled={saving} onClick={submit}>
            {saving ? "သိမ်းဆည်းနေသည်..." : "စာရင်းသွင်းမည်"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
