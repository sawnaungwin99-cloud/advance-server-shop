import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CHAT_ID = "7784625394";

const inputSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20),
  target_gmail: z.string().trim().email().max(255),
  ign: z.string().trim().min(1).max(60),
  telegram_username: z.string().trim().max(80).optional().default(""),
  plan_label: z.string().trim().max(80),
  receipt_path: z.string().trim().max(300),
});

export const notifyOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env["TELEGRAM_BOT_TOKEN"];
    if (!token) return { ok: false as const, error: "bot token missing" };

    const text = [
      "🛒 Order အသစ်ရောက်ရှိပါသည်။",
      `👤 အမည်: ${data.full_name}`,
      `📞 ဖုန်းနံပါတ်: ${data.phone}`,
      `📧 Gmail: ${data.target_gmail}`,
      `🎮 Game Name: ${data.ign}`,
      `✈️ Telegram Username: ${data.telegram_username || "-"}`,
      `💳 Plan: ${data.plan_label}`,
    ].join("\n");

    const send = async (method: string, body: BodyInit, headers?: HeadersInit) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        ...(headers ? { headers } : {}),
        body,
      });
      const out = await res.text();
      if (!res.ok) console.error(`Telegram ${method} failed [${res.status}]: ${out}`);
      return res.ok;
    };

    const msgOk = await send(
      "sendMessage",
      JSON.stringify({ chat_id: CHAT_ID, text }),
      { "Content-Type": "application/json" },
    );

    let photoOk = false;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: fileData, error } = await supabaseAdmin.storage
        .from("receipts")
        .download(data.receipt_path);
      if (error || !fileData) throw error ?? new Error("receipt not found");
      const fd = new FormData();
      fd.append("chat_id", CHAT_ID);
      fd.append("caption", `🧾 ငွေလွှဲပြေစာ — ${data.full_name}`);
      fd.append("photo", fileData, data.receipt_path.split("/").pop() ?? "receipt.png");
      photoOk = await send("sendPhoto", fd);
    } catch (err) {
      console.error("Telegram photo send failed:", err);
    }

    return { ok: msgOk, photoOk };
  });
