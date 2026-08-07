import { Send, Bot, Music2, Facebook } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CONTACTS = [
  { label: "Telegram Account", value: "@ssnnww2025", href: "https://t.me/ssnnww2025", Icon: Send },
  { label: "Telegram BOT", value: "@SNWADVANCESHOPBOT", href: "https://t.me/SNWADVANCESHOPBOT", Icon: Bot },
  {
    label: "TikTok",
    value: "@maysuaung1994",
    href: "https://www.tiktok.com/@maysuaung1994?_r=1&_t=ZS-98f55C4Z7Iq",
    Icon: Music2,
  },
  { label: "Facebook", value: "SNW Advance Shop", href: "https://www.facebook.com/share/1DSfgqpnpE/", Icon: Facebook },
];

export function ContactDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-gradient">Contact Us</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {CONTACTS.map(({ label, value, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="metal-card flex items-center gap-3 rounded-xl px-4 py-3 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Icon className="size-5 text-primary" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">{value}</span>
              </span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
