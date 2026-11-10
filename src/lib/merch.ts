import tshirt from "@/assets/merch-tshirt.jpg";
import jersey from "@/assets/merch-jersey.jpg";
import clothPhoto from "@/assets/anniversary-cloth.jpg.asset.json";
import tumblerPhoto from "@/assets/mini-tumbler-cup.jpg.asset.json";
import mug from "@/assets/merch-mug.jpg";

/** Order-desk WhatsApp number in international format without "+" (e.g. "233241234567"). Null = buyer picks the contact. */
export const ORDER_WHATSAPP: string | null = null;

export type Product = { id: string; name: string; image: string; price?: number; options?: string[] };

/** A product with no price yet shows "to be announced" instead of a number. */
export const PRODUCTS: Product[] = [
  { id: "tshirt", name: "Festival T-Shirt", image: tshirt, options: ["S", "M", "L", "XL", "XXL"] },
  { id: "jersey", name: "@20 Jersey", image: jersey, options: ["S", "M", "L", "XL", "XXL"] },
  { id: "cloth", name: "Anniversary Cloth (6 yards)", image: clothPhoto.url },
  { id: "tumbler", name: "Mini Tumbler Cup", image: tumblerPhoto.url, price: 200 },
  { id: "mug", name: "Festival Mug", image: mug },
];

export type CartLine = { id: string; name: string; option?: string; qty: number; price?: number | undefined };

export const money = (n: number) => `GH₵${n.toLocaleString("en-US")}`;

export const cartTotal = (lines: CartLine[]) => lines.reduce((s, l) => s + l.qty * (l.price ?? 0), 0);

/** The real total, or null while any item in the order still has no price. */
export const quotedTotal = (lines: CartLine[]) =>
  lines.length && lines.every((l) => l.price !== undefined) ? cartTotal(lines) : null;

const priced = PRODUCTS.filter((p) => p.price !== undefined);

export const PRICE_NOTE = priced.length
  ? `Place your order now — ${priced.map((p) => `${p.name} is ${money(p.price!)}`).join(", ")}. Prices for the other items will be announced soon.`
  : "Place your order now — pricing will be announced soon.";

export function orderMessage(name: string, phone: string, lines: CartLine[], notes?: string) {
  const rows = lines.map((l) => `• ${l.qty} × ${l.name}${l.option ? ` (${l.option})` : ""}`);
  const total = quotedTotal(lines);
  return [
    "Festival of Praise @20 — Merch order",
    `Name: ${name}`,
    `Phone: ${phone}`,
    ...rows,
    total === null ? "Total: To be announced soon" : `Total: ${money(total)}`,
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean).join("\n");
}
