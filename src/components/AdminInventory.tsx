import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PLANS } from "@/lib/plans";

type Stock = {
  id: string;
  plan_key: string;
  username: string;
  password: string;
  status: string;
  created_at: string;
};

export function AdminInventory() {
  const qc = useQueryClient();
  const [planKey, setPlanKey] = useState(PLANS[0]?.key ?? "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bulk, setBulk] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: stock } = useQuery({
    queryKey: ["stock-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_accounts")
        .select("id, plan_key, username, password, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Stock[];
    },
  });

  const summary = useMemo(() => {
    return PLANS.map((p) => {
      const rows = (stock ?? []).filter((s) => s.plan_key === p.key);
      return {
        key: p.key,
        label: p.nameEn,
        available: rows.filter((s) => s.status === "available").length,
        sold: rows.filter((s) => s.status === "sold").length,
      };
    });
  }, [stock]);

  const visible = (stock ?? []).filter((s) => filter === "all" || s.status === filter);

  const add = useMutation({
    mutationFn: async (rows: { plan_key: string; username: string; password: string }[]) => {
      if (rows.length === 0) throw new Error("No accounts to add");
      const { error } = await supabase.from("stock_accounts").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (n) => {
      toast.success(`${n} account(s) added`);
      setUsername("");
      setPassword("");
      setBulk("");
      qc.invalidateQueries({ queryKey: ["stock-accounts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stock_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["stock-accounts"] });
    },
  });

  const addBulk = () => {
    const rows = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [u, p] = l.split(/[|,\t:]/).map((x) => x?.trim() ?? "");
        return { plan_key: planKey, username: u ?? "", password: p ?? "" };
      })
      .filter((r) => r.username && r.password);
    add.mutate(rows);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.key} className="metal-card rounded-2xl p-4">
            <p className="truncate text-sm font-semibold text-gradient">{s.label}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Available — <span className="font-bold text-primary">{s.available}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Sold — <span className="font-bold text-gold">{s.sold}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="metal-card space-y-4 rounded-2xl p-5">
        <div className="space-y-1.5">
          <Label>Plan Type</Label>
          <Select value={planKey} onValueChange={setPlanKey}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLANS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.nameEn} — {p.priceLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="stock-user">Username / Email</Label>
            <Input id="stock-user" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock-pass">Password</Label>
            <Input id="stock-pass" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button
            onClick={() =>
              add.mutate([{ plan_key: planKey, username: username.trim(), password: password.trim() }])
            }
            disabled={!username.trim() || !password.trim() || add.isPending}
          >
            Add
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bulk">Bulk paste (one per line: username | password)</Label>
          <Textarea
            id="bulk"
            rows={5}
            placeholder={"user1@mail.com | pass123\nuser2@mail.com | pass456"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <Button variant="outline" onClick={addBulk} disabled={!bulk.trim() || add.isPending}>
            Bulk add
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{visible.length} item(s)</p>
      </div>

      <div className="space-y-2">
        {visible.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 bg-secondary/30 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-sm">
                {s.username} <span className="text-muted-foreground">/ {s.password}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {PLANS.find((p) => p.key === s.plan_key)?.nameEn ?? s.plan_key} ·{" "}
                <span className={s.status === "sold" ? "text-gold" : "text-primary"}>{s.status}</span>
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove.mutate(s.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
