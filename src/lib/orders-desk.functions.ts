import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import {
  ORDER_STATUSES,
  digestsEqual,
  type OrderItem,
  type OrderRecord,
} from "@/lib/orders-desk";

const pinInput = z.object({ pin: z.string().min(1).max(200) });

async function pinDigest(pin: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(pin);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

async function suppliedPinMatches(suppliedPin: string): Promise<boolean> {
  // This helper is called only from server handlers; secrets never enter the browser bundle.
  const configuredPin = process.env["ORDERS_DESK_PIN"];
  if (!configuredPin) throw new Error("Orders desk access is not configured");
  const [supplied, configured] = await Promise.all([
    pinDigest(suppliedPin),
    pinDigest(configuredPin),
  ]);
  return digestsEqual(supplied, configured);
}

export const listOrders = createServerFn({ method: "POST" })
  .inputValidator(pinInput)
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (!(await suppliedPinMatches(data.pin))) return { ok: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const orders: OrderRecord[] = [];
    const pageSize = 1000;

    // PostgREST caps each response; paginate so the desk and export include every order.
    for (let from = 0; ; from += pageSize) {
      const { data: rows, error } = await supabaseAdmin
        .from("merch_orders")
        .select("id, created_at, customer_name, phone, notes, items, total_ghs, status")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Orders desk query failed:", error.message);
        throw new Error("Orders could not be loaded");
      }

      orders.push(
        ...rows.map((row) => ({
          id: row.id,
          created_at: row.created_at,
          customer_name: row.customer_name,
          phone: row.phone,
          notes: row.notes,
          items: (Array.isArray(row.items) ? row.items : []) as OrderItem[],
          total_ghs: Number(row.total_ghs),
          status: row.status,
        })),
      );
      if (rows.length < pageSize) break;
    }

    return { ok: true as const, orders };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator(
    pinInput.extend({
      orderId: z.string().uuid(),
      status: z.enum(ORDER_STATUSES),
    }),
  )
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (!(await suppliedPinMatches(data.pin))) return { ok: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error } = await supabaseAdmin
      .from("merch_orders")
      .update({ status: data.status })
      .eq("id", data.orderId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Order status update failed:", error.message);
      throw new Error("Order status could not be updated");
    }
    if (!updated) return { ok: false as const };
    return { ok: true as const, status: data.status };
  });
