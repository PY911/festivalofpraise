export const ORDER_STATUSES = [
  "new",
  "awaiting_payment",
  "paid",
  "collected",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  collected: "Collected",
  cancelled: "Cancelled",
};

export type OrderItem = {
  id?: string;
  name?: string;
  option?: string;
  qty?: number;
  price?: number;
};

export type OrderRecord = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  notes: string | null;
  items: OrderItem[];
  total_ghs: number;
  status: string;
};

export const formatMoney = (amount: number) => `GH₵${amount.toLocaleString("en-US")}`;

export function formatOrderItems(items: OrderItem[]): string {
  if (!items.length) return "—";
  return items
    .map((item) => {
      const quantity = typeof item.qty === "number" ? item.qty : 1;
      const name = typeof item.name === "string" && item.name ? item.name : "Item";
      const option = typeof item.option === "string" && item.option ? ` (${item.option})` : "";
      const price = typeof item.price === "number" ? ` — ${formatMoney(item.price)} each` : "";
      return `${quantity} × ${name}${option}${price}`;
    })
    .join("\n");
}

function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  // Prevent spreadsheet programs from evaluating customer-entered text as a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** One spreadsheet row per order. The caller supplies the complete, unfiltered order list. */
export function ordersToCsv(orders: OrderRecord[]): string {
  const header = [
    "Order ID",
    "Ordered at",
    "Customer name",
    "Phone",
    "Items",
    "Total (GHS)",
    "Status",
    "Notes",
  ];
  const rows = orders.map((order) => [
    order.id,
    order.created_at,
    order.customer_name,
    order.phone,
    formatOrderItems(order.items),
    order.total_ghs,
    order.status,
    order.notes,
  ]);
  return `\ufeff${[header, ...rows]
    .map((row) => row.map((cell) => csvCell(cell)).join(","))
    .join("\r\n")}`;
}

/** Compare equal-length digests without returning early on a different byte. */
export function digestsEqual(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}
