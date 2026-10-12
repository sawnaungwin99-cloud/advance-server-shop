import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { VIDEO_ORDER_URL } from "@/lib/videos";

export function StoreInfoDialog({ view, onClose }: { view: "news" | "guide" | null; onClose: () => void }) {
  const { lang } = useLang();
  const guide = view === "guide";
  const steps = lang === "en"
    ? ["Choose your Advance Server package.", "Enter your account and contact information.", "Make your payment and upload the payment screenshot.", "Submit your order. View your account details in My Orders once completed."]
    : ["သင့်အတွက် သင့်တော်သော Advance Server Plan ကို ရွေးချယ်ပါ။", "အကောင့်နှင့် ဆက်သွယ်ရန် အချက်အလက်များကို ဖြည့်ပါ။", "ငွေလွှဲပြီး ငွေလွှဲပြေစာ Screenshot တင်ပါ။", "အော်ဒါတင်ပြီး ပြီးစီးပါက ကျွန်ုပ်၏ အော်ဒါများတွင် အကောင့်အချက်အလက်ကို ကြည့်ပါ။"];
  return <Dialog open={view !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>{guide ? (lang === "en" ? "How to Buy" : "ဝယ်ယူနည်း") : (lang === "en" ? "News & Updates" : "သတင်းနှင့် အပ်ဒိတ်များ")}</DialogTitle></DialogHeader>
      {guide ? <><ol className="space-y-5 py-3">{steps.map((step, i) => <li key={step} className="flex gap-3 text-sm leading-relaxed"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 font-bold text-primary">{i + 1}</span><span>{step}</span></li>)}</ol><Button asChild variant="outline"><a href={VIDEO_ORDER_URL} target="_blank" rel="noopener noreferrer">{lang === "en" ? "Watch ordering tutorial" : "ဝယ်ယူနည်း ဗီဒီယိုကြည့်ရန်"}<ArrowUpRight /></a></Button></> : <div className="flex gap-3 py-4"><CheckCircle2 className="size-5 shrink-0 text-primary"/><p className="text-sm leading-loose text-muted-foreground">{lang === "en" ? "Browse current Advance Server packages and prices on the shop page. Active limited-time promotions appear in the Flash Sale section." : "လက်ရှိ Advance Server Plan များနှင့် ဈေးနှုန်းများကို ပင်မစာမျက်နှာတွင် ကြည့်နိုင်ပါသည်။ ဖွင့်ထားသော အထူးလျှော့ဈေးများကို Flash Sale အပိုင်းတွင် ပြသထားပါသည်။"}</p></div>}
    </DialogContent>
  </Dialog>;
}