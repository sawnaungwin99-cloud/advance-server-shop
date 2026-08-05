import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { PAYMENTS } from "@/lib/plans";

export function PaymentAccounts() {
  const { t } = useLang();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PAYMENTS.map((p) => (
        <div key={p.key} className="metal-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gold">{p.label}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy(p.number, p.key)}
              className="h-7 gap-1 px-2 text-xs"
            >
              {copied === p.key ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied === p.key ? t("copied") : t("copy")}
            </Button>
          </div>
          <p className="mt-2 font-mono text-lg tracking-wider text-foreground">{p.number}</p>
          <p className="text-xs text-muted-foreground">
            {t("acc_name")}: <span className="text-foreground/90">{p.name}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
