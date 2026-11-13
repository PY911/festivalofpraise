import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ORDER_STATUSES = ["new", "paid", "collected", "cancelled"] as const;

async function pinOk(pin: string) {
  const expected = process.env["ORDERS_DESK_PIN"];
  if (!expected) throw new Error("Orders desk PIN is not set up yet.");
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(pin)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i]! ^ y[i]!;
  return diff === 0;
}

const pinSchema = z.object({ pin: z.string().min(1).max(100) });

export const listOrders = createServerFn({ method: "POST" })
  .inputValidator((d) => pinSchema.parse(d))
  .handler(async ({ data }) => {
    if (!(await pinOk(data.pin))) return { ok: false as const, orders: [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("merch_orders")
      .select("id, created_at, customer_name, phone, notes, items, total_ghs, status")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error("Could not load orders.");
    return {
      ok: true as const,
      orders: (rows ?? []).map((r) => ({ ...r, items: JSON.stringify(r.items), total_ghs: Number(r.total_ghs) })),
    };
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    pinSchema.extend({ id: z.string().uuid(), status: z.enum(ORDER_STATUSES) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await pinOk(data.pin))) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("merch_orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Could not update order.");
    return { ok: true as const };
  });
