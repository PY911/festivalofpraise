import { describe, expect, it } from "vitest";
import { getFestivalFacts } from "@/lib/festival-knowledge";
describe("Festival assistant source rules", () => {
  it("keeps the festival date and unannounced time", () => {
    const facts = getFestivalFacts();
    expect(facts.event.date).toBe("2027-03-27");
    expect(facts.event.startTime).toBeNull();
  });
  it("does not interpret unpublished merchandise prices as free", () => {
    expect(getFestivalFacts().merchandise.map(p => p.price)).toEqual([null, null, null, null, null]);
  });
});