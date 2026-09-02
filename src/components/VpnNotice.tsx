import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PARAGRAPHS = [
  "Bro တို့အနေနဲ့ Website ကိုစတင်အသုံးပြုမှာပဲဖြစ်ဖြစ် အကောင့်ဝယ်ဖို့ Order တင်မှာပဲဖြစ်ဖြစ် VPN လေးကိုမဖြစ်မနေချိတ်ပေးဖို့တောင်းဆိုချင်ပါတယ် Vpn မချိတ်ထားရင် Order တင်မရတာ အကောင့်ဝင်လို့မရတာတွေဖြစ်နိုင်ပါတယ်ဗျ",
  "ကျေးဇူးတင်ပါတယ်ခင်ဗျ",
];

export function VpnNotice() {
  const [open, setOpen] = useState(false);

  // Deliberately storage-free: this notice must appear on every visit and every
  // refresh, so nothing is persisted about having dismissed it. Opening from an
  // effect keeps the dialog client-only and avoids an SSR/hydration mismatch.
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="metal-card glow-cyan w-[calc(100%-1.75rem)] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl">
        <div aria-hidden className="h-1 w-full [background-image:var(--gradient-cyan-gold)]" />

        <div className="max-h-[82vh] overflow-y-auto px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
          <AlertDialogHeader className="items-center sm:text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary ring-4 ring-primary/10">
              <ShieldAlert className="size-7" />
            </span>
            <AlertDialogTitle className="sr-only">VPN အသိပေးချက်</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-1 text-left text-[15px] leading-[2.1] text-foreground/85">
                {PARAGRAPHS.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6">
            <AlertDialogAction className="glow-cyan h-11 w-full text-[15px] font-semibold">
              နားလည်ပါပြီ
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
