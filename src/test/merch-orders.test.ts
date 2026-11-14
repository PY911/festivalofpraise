import { describe, expect, it } from "vitest";

import { ORDER_WHATSAPP, orderMessage } from "@/lib/merch";

describe("Merch order handoff", () => {
  it("uses the confirmed WhatsApp order-desk number", () => {
    expect(ORDER_WHATSAPP).toBe("233504070722");
  });

  it("includes the customer's details and every cart line in the WhatsApp message", () => {
    const message = orderMessage("Ama Mensah", "024 123 4567", [
      { id: "tumbler", name: "Mini Tumbler Cup", qty: 2, price: 200 },
      { id: "cloth", name: "Anniversary Cloth", option: "2 yards", qty: 1, price: 150 },
    ]);

    expect(message).toContain("Name: Ama Mensah");
    expect(message).toContain("Phone: 024 123 4567");
    expect(message).toContain("2 × Mini Tumbler Cup");
    expect(message).toContain("1 × Anniversary Cloth (2 yards)");
    expect(message).toContain("Total: GH₵550");
  });
});
