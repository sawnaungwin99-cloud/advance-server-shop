import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const KEY = "snw_welcome_seen_v2";

export function WelcomeNotice() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  const close = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <AlertDialogContent className="metal-card max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gradient">
            🎉 SNW Advance Server Shop မှ ကြိုဆိုပါတယ်!
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left text-sm leading-loose text-muted-foreground">
              <p>ကျွန်တော်တို့ရဲ့ Website ကို အသုံးပြုပေးတဲ့အတွက် အထူးကျေးဇူးတင်ပါတယ်။ ❤️</p>
              <p>
                💡 သင့်အနေနဲ့ Website ကို အသုံးပြုရာမှာ ပိုမိုအဆင်ပြေစေဖို့ အကောင့်ပြုလုပ်ပြီး (Login)
                ဝင်ထားရန် အကြံပြုချင်ပါတယ်။
              </p>
              <p>
                <span className="font-semibold text-foreground">🛒 အကောင့်မရှိလည်း ဝယ်လို့ရပါတယ်</span>
                <br />
                Login မဝင်ထားဘူးဆိုရင်လည်း ပုံမှန်အတိုင်း Advance Server များကို အလွယ်တကူ
                ဝယ်ယူနိုင်ပါတယ်ခင်ဗျာ။
              </p>
              <p>
                <span className="font-semibold text-foreground">🔐 ဒါပေမဲ့ Login ဝင်ထားပါက...</span>
                <br />✅ မိမိရဲ့ အချက်အလက်များ ပိုမိုလုံခြုံမှုရှိခြင်း။
                <br />✅ မိမိ မှာယူထားတဲ့ အော်ဒါ (Order) များကို အချိန်မရွေး ပြန်လည်စစ်ဆေးနိုင်ခြင်း
                စတဲ့ အကျိုးကျေးဇူးတွေ ရရှိမှာဖြစ်ပါတယ်။
              </p>
              <p>ယုံကြည်စွာ ရွေးချယ်ပေးတဲ့အတွက် ကျေးဇူးတင်ပါတယ်ခင်ဗျာ! 🙏</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>နားလည်ပါပြီ (Got it)</AlertDialogCancel>
          <AlertDialogAction
            className="glow-cyan"
            onClick={() => {
              close();
              navigate({ to: "/auth" });
            }}
          >
            အကောင့် ဝင်မည် (Login)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
