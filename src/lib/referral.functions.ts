import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CHAT_ID = "7784625394";
const GOAL = 5;

export const requestReferralReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().trim().max(100).optional().default(""),
        telegram_username: z.string().trim().max(80).optional().default(""),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: points } = await supabase.rpc("referral_points", { _user_id: userId });
    const verified = Number(points ?? 0);
    if (verified < GOAL) {
      throw new Error("သူငယ်ချင်း ၅ ယောက် မပြည့်သေးပါ။");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("promo_code, display_name")
      .eq("id", userId)
      .maybeSingle();

    const { data: existing } = await supabase
      .from("referral_claims")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) {
      throw new Error("သင့်တောင်းဆိုမှုကို စောင့်ဆိုင်းဆဲ ဖြစ်ပါသည်။");
    }

    const email = (claims as { email?: string } | null)?.email ?? "";
    const fullName = data.full_name || profile?.display_name || "-";
    const promo = profile?.promo_code ?? "-";

    const { error: insErr } = await supabase.from("referral_claims").insert({
      user_id: userId,
      promo_code: promo,
      points_at_claim: verified,
      full_name: fullName,
      telegram_username: data.telegram_username,
      contact_email: email,
    });
    if (insErr) throw insErr;

    let telegram = false;
    const token = process.env["TELEGRAM_BOT_TOKEN"];
    if (token) {
      const text = [
        "🎁 Free Advance Server Claim Request",
        "",
        `👤 အမည်: ${fullName}`,
        `📧 Email: ${email || "-"}`,
        `✈️ Telegram Username: ${data.telegram_username || "-"}`,
        `🏷️ Promo Code: ${promo}`,
        `✅ အောင်မြင်သော ဖိတ်ခေါ်မှု: ${verified}/${GOAL}`,
      ].join("\n");
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text }),
        });
        telegram = res.ok;
        if (!res.ok) console.error("Telegram claim notify failed:", await res.text());
      } catch (err) {
        console.error("Telegram claim notify error:", err);
      }
    }

    return { ok: true as const, telegram, points: verified };
  });
