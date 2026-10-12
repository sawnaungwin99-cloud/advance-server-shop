import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X, UserRound } from "lucide-react";
import { useState } from "react";
import { ContactDialog } from "@/components/ContactDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { StoreInfoDialog } from "@/components/StoreInfoDialog";

export function Header() {
  const { lang, setLang, t } = useLang();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [infoView, setInfoView] = useState<"news" | "guide" | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  const links = (
    <>
      <Link
        to="/"
        className="cinematic-nav-link"
        onClick={() => setOpen(false)}
      >
        {lang === "en" ? "Home" : "ပင်မ"}
      </Link>
      <Link to="/" hash="plans" className="cinematic-nav-link" onClick={() => setOpen(false)}>{lang === "en" ? "Packages" : "Plan များ"}</Link>
      <Button variant="ghost" className="cinematic-nav-link h-auto justify-start rounded-none p-0" onClick={() => { setOpen(false); setInfoView("news"); }}>{lang === "en" ? "News & Updates" : "သတင်းများ"}</Button>
      <Button variant="ghost" className="cinematic-nav-link h-auto justify-start rounded-none p-0" onClick={() => { setOpen(false); setInfoView("guide"); }}>{lang === "en" ? "How to Buy" : "ဝယ်ယူနည်း"}</Button>
      {user && (
        <Link
          to="/orders"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
          onClick={() => setOpen(false)}
        >
          {t("nav_orders")}
        </Link>
      )}
      <Button variant="ghost"
        type="button"
        className="cinematic-nav-link h-auto justify-start rounded-none p-0"
        onClick={() => {
          setOpen(false);
          setContactOpen(true);
        }}
      >
        {t("nav_contact")}
      </Button>
      {isAdmin && (
        <Link
          to="/admin"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
          onClick={() => setOpen(false)}
        >
          {t("nav_admin")}
        </Link>
      )}
    </>
  );

  return (
    <header className="cinematic-shell sticky top-0 z-40 border-b border-primary/30 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-4 xl:flex xl:gap-6">
        <Link to="/" aria-label="SNW Advance Server Shop home" className="flex min-w-0 items-center gap-2 xl:shrink-0">
          <svg viewBox="0 0 64 64" className="size-9 shrink-0 text-primary sm:size-11" fill="currentColor" aria-hidden="true"><path d="M30 8 8 32l14 15 9-10-5-5 13-14zm12 9-9 10 5 5-13 14 9 10 22-24z" /></svg>
          <span className="min-w-0"><span className="cinematic-wordmark block text-2xl font-black italic leading-none text-primary sm:text-3xl">SNW</span><span className="block text-[8px] font-semibold leading-loose text-foreground sm:text-[10px]">ADVANCE SERVER SHOP</span></span>
        </Link>

        <nav aria-label="Main navigation" className="ml-auto hidden items-center gap-5 xl:flex">{links}</nav>

        <div className="flex shrink-0 items-center gap-1.5 xl:ml-3">
          <div className="flex overflow-hidden rounded-full border border-border bg-secondary/60 p-0.5">
            <Button variant="ghost" size="sm"
              aria-label="Myanmar language" aria-pressed={lang === "my"}
              onClick={() => setLang("my")}
              className={`h-7 rounded-full px-2 text-[10px] transition-colors ${lang === "my" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              MM
            </Button>
            <Button variant="ghost" size="sm"
              aria-label="English language" aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
              className={`h-7 rounded-full px-2 text-[10px] transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              EN
            </Button>
          </div>

          {user ? (<><Button asChild variant="outline" size="icon" className="border-primary/50" title={t("nav_orders")}><Link to="/orders" aria-label={t("nav_orders")}><UserRound /></Link></Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden border-primary/50 sm:inline-flex">
              <LogOut className="size-4" /> {t("nav_logout")}
            </Button></>
          ) : (
            <Button asChild size="sm" className="px-2 sm:px-3">
              <Link to="/auth">{t("nav_login")}</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="flex flex-col gap-5 border-t border-primary/20 px-5 py-5 xl:hidden">
          {links}
          {user && (
            <Button variant="ghost" onClick={handleSignOut} className="justify-start p-0 text-sm text-muted-foreground">
              {t("nav_logout")}
            </Button>
          )}
        </nav>
      )}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      <StoreInfoDialog view={infoView} onClose={() => setInfoView(null)} />
    </header>
  );
}
