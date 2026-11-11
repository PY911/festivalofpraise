import clothPhoto from "@/assets/anniversary-cloth.jpg.asset.json";
import tumblerPhoto from "@/assets/mini-tumbler-cup.jpg.asset.json";

/** Order-desk WhatsApp number in international format without "+" (e.g. "233241234567"). Null = buyer picks the contact. */
export const ORDER_WHATSAPP: string | null = null;

export type Product = {
  id: string;
  name: string;
  image: string;
  price?: number;
  options?: string[];
  /** Per-option prices (e.g. cloth sold by the yard). Falls back to `price` when absent. */
  optionPrices?: Record<string, number>;
  /** Extra line shown under the price (e.g. "Pre-order"). */
  note?: string;
};

/**
 * Only items with real photos are listed — t-shirt, jersey, mug and
 * air refresher / lapel pin return once their photos are uploaded.
 * A product with no price yet shows "to be announced" instead of a number.
 */
export const PRODUCTS: Product[] = [
  {
    id: "cloth",
    name: "Anniversary Cloth",
    image: clothPhoto.url,
    options: ["1 yard", "2 yards", "4 yards"],
    optionPrices: { "1 yard": 80, "2 yards": 150, "4 yards": 300 },
  },
  { id: "tumbler", name: "Mini Tumbler Cup", image: tumblerPhoto.url, price: 200 },
];

export type CartLine = { id: string; name: string; option?: string; qty: number; price?: number | undefined };

/** Price of one unit of a product, honouring per-option prices. Undefined while unpriced. */
export function priceFor(p: Product, option?: string): number | undefined {
  if (p.optionPrices && option !== undefined) return p.optionPrices[option];
  return p.price;
}

/** Lowest advertised price of a product, for the card badge. */
export function fromPrice(p: Product): number | undefined {
  if (p.optionPrices) return Math.min(...Object.values(p.optionPrices));
  return p.price;
}

export const money = (n: number) => `GH₵${n.toLocaleString("en-US")}`;

export const cartTotal = (lines: CartLine[]) => lines.reduce((s, l) => s + l.qty * (l.price ?? 0), 0);

/** The real total, or null while any item in the order still has no price. */
export const quotedTotal = (lines: CartLine[]) =>
  lines.length && lines.every((l) => l.price !== undefined) ? cartTotal(lines) : null;

const unpriced = PRODUCTS.filter((p) => fromPrice(p) === undefined);

export const PRICE_NOTE = unpriced.length
  ? `Place your order now — prices for the ${unpriced.map((p) => p.name).join(" and ")} will be announced soon.`
  : "Place your order now — more items (t-shirt, jersey, mug, lapel pin) are coming soon.";

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
