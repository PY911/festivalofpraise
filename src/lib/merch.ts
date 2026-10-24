import tshirt from "@/assets/merch-tshirt.jpg";
import jersey from "@/assets/merch-jersey.jpg";
import cloth from "@/assets/merch-cloth.jpg";
import tumbler from "@/assets/merch-tumbler.jpg";
import mug from "@/assets/merch-mug.jpg";

/** Sample catalogue — prices are placeholders until the church confirms them. */
export const PRICES_ARE_SAMPLE = true;

/** Order-desk WhatsApp number in international format without "+" (e.g. "233241234567"). Null = buyer picks the contact. */
export const ORDER_WHATSAPP: string | null = null;

export type Product = { id: string; name: string; price: number; image: string; options?: string[] };

export const PRODUCTS: Product[] = [
  { id: "tshirt", name: "Festival T-Shirt", price: 120, image: tshirt, options: ["S", "M", "L", "XL", "XXL"] },
  { id: "jersey", name: "@20 Jersey", price: 180, image: jersey, options: ["S", "M", "L", "XL", "XXL"] },
  { id: "cloth", name: "Anniversary Cloth (6 yards)", price: 250, image: cloth },
  { id: "tumbler", name: "Mini Tumbler Cup", price: 150, image: tumbler },
  { id: "mug", name: "Festival Mug", price: 70, image: mug },
];

export type CartLine = { id: string; name: string; option?: string; qty: number; price: number };

export const cartTotal = (lines: CartLine[]) => lines.reduce((s, l) => s + l.qty * l.price, 0);

export function orderMessage(name: string, phone: string, lines: CartLine[], notes?: string) {
  const rows = lines.map((l) => `• ${l.qty} × ${l.name}${l.option ? ` (${l.option})` : ""} — GHS ${l.qty * l.price}`);
  return [
    "Festival of Praise @20 — Merch order",
    `Name: ${name}`,
    `Phone: ${phone}`,
    ...rows,
    `Total: GHS ${cartTotal(lines)}`,
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean).join("\n");
}
