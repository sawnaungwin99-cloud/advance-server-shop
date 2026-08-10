import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const assignStockToOrder = createServerFn({ method: "POST" })
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

    const { data: order, error: orderErr } = await context.supabase
      .from("orders")
      .select("id, plan_key, delivered_username, delivered_password")
      .eq("id", data.order_id)
      .maybeSingle();
    if (orderErr || !order) throw new Error("Order not found");

    if (order.delivered_username && order.delivered_password) {
      return {
        assigned: true as const,
        reason: "already" as const,
        username: order.delivered_username,
        password: order.delivered_password,
      };
    }

    const { data: stock } = await context.supabase
      .from("stock_accounts")
      .select("id, username, password")
      .eq("plan_key", order.plan_key)
      .eq("status", "available")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!stock) return { assigned: false as const, reason: "out_of_stock" as const };

    const { error: soldErr } = await context.supabase
      .from("stock_accounts")
      .update({ status: "sold", order_id: order.id, sold_at: new Date().toISOString() })
      .eq("id", stock.id)
      .eq("status", "available");
    if (soldErr) throw soldErr;

    const { error: upErr } = await context.supabase
      .from("orders")
      .update({
        delivered_username: stock.username,
        delivered_password: stock.password,
        status: "completed",
      })
      .eq("id", order.id);
    if (upErr) throw upErr;

    return {
      assigned: true as const,
      reason: "assigned" as const,
      username: stock.username,
      password: stock.password,
    };
  });
