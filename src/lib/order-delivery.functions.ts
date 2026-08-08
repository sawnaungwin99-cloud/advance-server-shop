import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DELIVERED_TEXT = [
  "🎉 SNW Advance Server Shop 🎉",
  "",
  "မင်္ဂလာပါ၊ သင်မှာယူထားသော Advance Server အကောင့်ကို ဆောင်ရွက်ပေးပြီးပါပြီခင်ဗျာ။ ဝယ်ယူအားပေးမှုကို ကျေးဇူးအထူးတင်ရှိပါသည်။",
].join("\n");

export const notifyDelivered = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ order_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { data: order, error } = await context.supabase
      .from("orders")
      .select("telegram_username, full_name")
      .eq("id", data.order_id)
      .maybeSingle();
    if (error || !order) throw new Error("Order not found");

    const token = process.env["TELEGRAM_BOT_TOKEN"];
    const raw = (order.telegram_username ?? "").trim().replace(/^@/, "");
    if (!token || !raw) return { telegram: false as const, reason: "no_username" as const };

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: `@${raw}`, text: DELIVERED_TEXT }),
    });
    if (!res.ok) {
      console.error("Telegram delivered notice failed:", await res.text());
      return { telegram: false as const, reason: "send_failed" as const };
    }
    return { telegram: true as const, reason: "sent" as const };
  });
