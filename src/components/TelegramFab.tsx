import { Send } from "lucide-react";
import { TELEGRAM_URL } from "@/lib/plans";

export function TelegramFab() {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Contact Admin on Telegram"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground glow-cyan transition-transform hover:scale-105"
    >
      <Send className="size-5" />
      <span className="hidden sm:inline">Telegram</span>
    </a>
  );
}
