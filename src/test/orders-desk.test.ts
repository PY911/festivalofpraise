import { describe, expect, it } from "vitest";

import { digestsEqual, formatOrderItems, ordersToCsv, type OrderRecord } from "@/lib/orders-desk";

const orders: OrderRecord[] = [
  {
    id: "order-1",
    created_at: "2026-11-14T23:10:49.099172+00:00",
    customer_name: 'Ama "Praise" Mensah',
    phone: "024 123 4567",
    notes: "Call, then leave at reception",
    items: [{ id: "tumbler", name: "Mini Tumbler Cup", qty: 2, price: 200 }],
    total_ghs: 400,
    status: "new",
  },
  {
    id: "order-2",
    created_at: "2026-11-13T08:06:18.539763+00:00",
    customer_name: "Kojo Boateng",
    phone: "050 000 0000",
    notes: null,
    items: [{ id: "cloth", name: "Anniversary Cloth", option: "2 yards", qty: 1, price: 150 }],
    total_ghs: 150,
    status: "paid",
  },
];

describe("Orders desk export", () => {
  it("includes one row for every order with its contact, items, total, status and notes", () => {
    const csv = ordersToCsv(orders);

    expect(csv).toContain('"order-1"');
    expect(csv).toContain('"order-2"');
    expect(csv).toContain('"Ama ""Praise"" Mensah"');
    expect(csv).toContain('"024 123 4567"');
    expect(csv).toContain('"2 × Mini Tumbler Cup — GH₵200 each"');
    expect(csv).toContain('"1 × Anniversary Cloth (2 yards) — GH₵150 each"');
    expect(csv).toContain('"400"');
    expect(csv).toContain('"paid"');
    expect(csv).toContain('"Call, then leave at reception"');
  });

  it("does not let customer-entered cells become spreadsheet formulas", () => {
    const csv = ordersToCsv([{ ...orders[0]!, customer_name: "=2+2", notes: "+233501234567" }]);

    expect(csv).toContain('"'=2+2"');
    expect(csv).toContain('"'+233501234567"');
  });
});

describe("Orders desk data formatting and PIN comparison", () => {
  it("keeps every cart line in the order display", () => {
    expect(formatOrderItems([...orders[0]!.items, ...orders[1]!.items])).toBe(
      "2 × Mini Tumbler Cup — GH₵200 each\n1 × Anniversary Cloth (2 yards) — GH₵150 each",
    );
  });

  it("accepts matching PIN digests and rejects different ones", () => {
    const digest = new Uint8Array([1, 2, 3, 4]);

    expect(digestsEqual(digest, new Uint8Array([1, 2, 3, 4]))).toBe(true);
    expect(digestsEqual(digest, new Uint8Array([1, 2, 3, 5]))).toBe(false);
    expect(digestsEqual(digest, new Uint8Array([1, 2, 3]))).toBe(false);
  });
});
