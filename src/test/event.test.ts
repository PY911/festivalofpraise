import { describe, expect, it } from "vitest";
import { EVENT, SOCIAL, buildIcs, getMapUrl, getRemaining, getStartTimestamp } from "@/lib/event";
import { PRODUCTS, cartTotal, orderMessage, priceFor, quotedTotal } from "@/lib/merch";

describe("countdown", () => {
  it("counts to the start of festival day (27 March 2027, Accra) while no time is announced", () => {
    expect(getStartTimestamp("2027-03-27", null)).toBe(Date.UTC(2027, 2, 27, 0, 0));
  });
  it("uses the official time once it is set", () => {
    expect(getStartTimestamp("2027-03-27", "16:00")).toBe(Date.UTC(2027, 2, 27, 16, 0));
  });
  it("splits remaining time into days/hours/minutes/seconds", () => {
    const t = Date.UTC(2027, 2, 27);
    const r = getRemaining(t, t - (2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5000));
    expect(r).toMatchObject({ days: 2, hours: 3, minutes: 4, seconds: 5, done: false });
  });
});

describe("calendar and map", () => {
  it("saves 27 March 2027 as an all-day calendar event", () => {
    const ics = buildIcs("20261025T132500Z");
    expect(ics).toContain("DTSTART;VALUE=DATE:20270327");
    expect(ics).toContain("DTEND;VALUE=DATE:20270328");
    expect(ics).toContain(`SUMMARY:${EVENT.name}`);
    expect(ics).toContain(`LOCATION:${EVENT.venue}`);
  });

  it("points the directions button at a Google Maps search for the church venue", () => {
    expect(EVENT.venue).toBe("Bethlehem, Off Golf City Main Road");
    expect(EVENT.organizer).toBe("Bethlehem Methodist Church");
    expect(EVENT.mapQuery).toBe("Bethlehem Methodist Church, Off Golf City Main Road");
    expect(getMapUrl()).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.mapQuery)}`,
    );
  });
});

describe("social pages", () => {
  it("links to the church's real Instagram, TikTok and Facebook pages", () => {
    expect(SOCIAL.map((s) => s.url)).toEqual([
      "https://www.instagram.com/bethlehemonline_/",
      "https://www.tiktok.com/@bethlehemonline",
      "https://www.facebook.com/BethlehemSociety",
    ]);
  });
});

describe("cart", () => {
  it("totals quantity × price", () => {
    expect(
      cartTotal([
        { id: "a", name: "A", qty: 2, price: 120 },
        { id: "b", name: "B", qty: 1, price: 70 },
      ]),
    ).toBe(310);
  });

  it("prices the mini tumbler cup at GH₵200", () => {
    expect(PRODUCTS.find((p) => p.id === "tumbler")!.price).toBe(200);
  });

  it("sells the anniversary cloth by the yard at the updated prices", () => {
    const cloth = PRODUCTS.find((p) => p.id === "cloth")!;
    expect(priceFor(cloth, "1 yard")).toBe(60);
    expect(priceFor(cloth, "2 yards")).toBe(100);
    expect(priceFor(cloth, "4 yards")).toBe(200);
    expect(priceFor(cloth, "6 yards")).toBe(300);
  });

  it("sells the air refresher / lapel pin at 30 each or 50 for two once its photo is uploaded", () => {
    const pin = PRODUCTS.find((p) => p.id === "lapel-pin");
    if (pin) {
      expect(priceFor(pin, "1 piece")).toBe(30);
      expect(priceFor(pin, "2 pieces")).toBe(50);
    }
  });

  it("lists the real merch items and marks the jersey out of stock", () => {
    expect(PRODUCTS.map((p) => p.id)).toEqual([
      "cloth",
      "tumbler",
      "jersey",
      "brooch",
      "air-refresher",
    ]);
    expect(PRODUCTS.find((p) => p.id === "jersey")?.inStock).toBe(false);
    expect(PRODUCTS.find((p) => p.id === "brooch")?.price).toBe(30);
    expect(PRODUCTS.find((p) => p.id === "air-refresher")?.price).toBe(30);
  });

  it("quotes a real total when every item in the order has a price", () => {
    const lines = [{ id: "tumbler", name: "Mini Tumbler Cup", qty: 2, price: 200 }];
    expect(quotedTotal(lines)).toBe(400);
    expect(orderMessage("Jane", "024 123 4567", lines)).toContain("Total: GH₵400");
  });

  it("has no total while any item is still unpriced", () => {
    const lines = [
      { id: "tumbler", name: "Mini Tumbler Cup", qty: 1, price: 200 },
      { id: "cloth", name: "Anniversary Cloth (6 yards)", qty: 1 },
    ];
    expect(quotedTotal(lines)).toBeNull();
    expect(orderMessage("Jane", "024 123 4567", lines)).toContain("Total: To be announced soon");
  });

  it("uses a to-be-announced total when merch pricing is not yet final", () => {
    const message = orderMessage("Jane", "024 123 4567", [{ id: "a", name: "A", qty: 1 }]);

    expect(message).toContain("Total: To be announced soon");
    expect(message).not.toContain("GHS");
  });
});
