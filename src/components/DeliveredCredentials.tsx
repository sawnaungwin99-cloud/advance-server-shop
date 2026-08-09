import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VIDEO_LOGIN_URL } from "@/lib/videos";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("ကူးယူပြီးပါပြီ");
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm text-foreground">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/25"
      >
        <span className="inline-flex items-center gap-1">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} ကူးယူမည်
        </span>
      </button>
    </div>
  );
}

export function DeliveredCredentials({
  username,
  password,
  showVideo = true,
}: {
  username: string;
  password: string;
  showVideo?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-semibold text-gold">🔑 သင့်အကောင့် အချက်အလက်</p>
      <CopyRow label="Username / Email" value={username} />
      <CopyRow label="Password" value={password} />
      {showVideo && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Login ဝင်နည်း ဗီဒီယို</p>
          <div className="relative w-full overflow-hidden rounded-xl border border-border/70 pt-[56.25%]">
            <iframe
              src={VIDEO_LOGIN_URL}
              title="How to Login"
              allow="autoplay; fullscreen"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 size-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
