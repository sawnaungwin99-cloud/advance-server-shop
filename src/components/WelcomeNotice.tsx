import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";

export function WelcomeNotice() {
  const { lang } = useLang();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("snw-notice") === "1") return;
    setOpen(true);
  }, [loading, user]);

  const close = () => {
    setOpen(false);
    window.sessionStorage.setItem("snw-notice", "1");
  };

  const my = lang === "my";

  return (
    <AlertDialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <AlertDialogContent className="metal-card glow-cyan sm:max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/15 glow-cyan">
            <BellRing className="size-5 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-gradient">
            {my ? "သတိပေးချက်" : "Notice"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center leading-loose">
            {my
              ? "Website ကို အသုံးမပြုခင် သို့မဟုတ် အကောင့်မဝယ်ခင် အရင်ဆုံး Login ဝင်ထားပေးပါ။ Login ဝင်ထားမှသာ သင့် Order အခြေအနေကို စောင့်ကြည့်နိုင်ပြီး ပိုမိုလုံခြုံစိတ်ချရပါမည်။"
              : "Please log in before using the website or purchasing an account. Logging in lets you track your order status safely."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full glow-cyan" onClick={close}>
            <Link to="/auth">{my ? "Login ဝင်မယ်" : "Log in"}</Link>
          </Button>
          <AlertDialogAction asChild>
            <Button variant="outline" className="w-full" onClick={close}>
              {my ? "ဆက်ကြည့်မယ်" : "Continue browsing"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
