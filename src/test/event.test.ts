import { describe, expect, it } from "vitest";
import { EVENT, buildIcs, getMapUrl, getRemaining, getStartTimestamp } from "@/lib/event";
import { cartTotal, orderMessage } from "@/lib/merch";

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

  it("points the directions button at a Google Maps search for the venue", () => {
    expect(getMapUrl()).toBe(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.venue)}`);
  });
});

describe("cart", () => {
  it("totals quantity × price", () => {
    expect(cartTotal([{ id: "a", name: "A", qty: 2, price: 120 }, { id: "b", name: "B", qty: 1, price: 70 }])).toBe(310);
  });

  it("uses a to-be-announced total when merch pricing is not yet final", () => {
    const message = orderMessage("Jane", "024 123 4567", [{ id: "a", name: "A", qty: 1, price: 0 }]);

    expect(message).toContain("Total: To be announced soon");
    expect(message).not.toContain("GHS");
  });
});
