import { Link, useNavigate } from "@tanstack/react-router";
import { Gamepad2, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { ContactDialog } from "@/components/ContactDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";

export function Header() {
  const { lang, setLang, t } = useLang();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  const links = (
    <>
      <Link
        to="/"
        className="text-sm text-muted-foreground transition-colors hover:text-primary"
        onClick={() => setOpen(false)}
      >
        {t("nav_shop")}
      </Link>
      {user && (
        <Link
          to="/orders"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
          onClick={() => setOpen(false)}
        >
          {t("nav_orders")}
        </Link>
      )}
      <button
        type="button"
        className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
        onClick={() => {
          setOpen(false);
          setContactOpen(true);
        }}
      >
        {t("nav_contact")}
      </button>
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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary glow-cyan">
            <Gamepad2 className="size-5 text-primary" />
          </span>
          <span className="brand-title text-[11px] leading-tight sm:text-sm">
            <span className="text-gradient">SNW</span>{" "}
            <span className="text-foreground/90">Advance Server Shop</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-5 md:flex">{links}</nav>

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <div className="flex overflow-hidden rounded-full border border-border bg-secondary/60 p-0.5">
            <button
              onClick={() => setLang("my")}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${lang === "my" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              🇲🇲 MM
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              🇬🇧 EN
            </button>
          </div>

          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden sm:inline-flex">
              <LogOut className="size-4" /> {t("nav_logout")}
            </Button>
          ) : (
            <Button asChild size="sm" className="glow-cyan">
              <Link to="/auth">{t("nav_login")}</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 md:hidden">
          {links}
          {user && (
            <button onClick={handleSignOut} className="text-left text-sm text-muted-foreground">
              {t("nav_logout")}
            </button>
          )}
        </div>
      )}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </header>
  );
}
