import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PAYMENTS } from "@/lib/plans";

export function PaymentAccounts() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    toast.success("ကူးယူပြီးပါပြီ");
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PAYMENTS.map((p) => (
        <div
          key={p.key}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.gradient} p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/20`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/15 blur-[2px]"
          />
          <div className="relative flex items-start justify-end">
            <span className={`text-lg font-extrabold tracking-tight ${p.fg}`}>{p.label}</span>
          </div>

          <div className="relative mt-6">
            <p className={`text-xs ${p.sub}`}>Account Number</p>
            <p className={`mt-1 font-mono text-2xl font-bold tracking-wider ${p.fg}`}>{p.number}</p>
            <p className={`mt-1 text-base font-semibold ${p.fg}`}>({p.name})</p>
          </div>

          <div className="relative mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => copy(p.number, p.key)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold backdrop-blur transition ${p.btn}`}
            >
              {copied === p.key ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              ကူးယူမည်
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
