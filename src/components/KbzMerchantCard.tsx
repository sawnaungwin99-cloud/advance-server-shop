import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import qr from "@/assets/kbzpay_merchant_qr.jpg.asset.json";

const SHORT_CODE = "100089164";

export function KbzMerchantCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SHORT_CODE);
      setCopied(true);
      toast.success("ဆိုင်ကုဒ် ကူးယူပြီးပါပြီ");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };
  const openApp = () => {
    navigator.clipboard?.writeText(SHORT_CODE).catch(() => {});
    window.location.href = "kbzpay://";
    setTimeout(() => {
      if (!document.hidden) toast.info("KBZPay App မတွေ့ပါ — QR scan ဖတ်ခြင်း (သို့) အကောင့်နံပါတ်သို့ လွှဲနိုင်ပါသည်။");
    }, 1800);
  };

  return (
    <div className="rounded-2xl border border-primary/40 bg-secondary/40 p-4">
      <p className="text-sm font-bold text-primary">KBZPay Merchant — AWAYAR</p>
      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <img src={qr.url} alt="AWAYAR KBZPay Merchant QR" className="w-40 rounded-xl bg-background" loading="lazy" />
        <div className="w-full space-y-2 text-sm">
          <p className="text-muted-foreground">ဆိုင်ကုဒ် (Short Code)</p>
          <p className="font-mono text-xl font-bold">{SHORT_CODE}</p>
          <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} ကူးယူမည်
          </button>
          <button type="button" onClick={openApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground glow-cyan">
            <ExternalLink className="size-4" /> KBZPay App ဖွင့်၍ ငွေချေမည်
          </button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            App ပွင့်လာလျှင် Scan/Pay ထဲတွင် ဆိုင်ကုဒ်ကို ထည့်၍ လွှဲပါ (ကုဒ်ကို အလိုအလျောက် ကူးပေးထားပါသည်)။ ကွန်ပျူတာဖြင့်ကြည့်ပါက QR ကို ဖုန်းဖြင့် Scan ဖတ်ပါ။ ငွေလွှဲပြီး Screenshot ကို အောက်တွင် တင်ပေးပါ။
          </p>
        </div>
      </div>
    </div>
  );
}
