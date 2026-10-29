import { describe, expect, it } from "vitest";
import { canEnterSite, hasCurrentAgreement, isPolicyPath, AGREEMENT_VERSION } from "@/lib/site-agreement";

describe("Visitor agreement", () => {
  it("requires agreement to both terms and privacy before entry", () => {
    expect(canEnterSite(false, false)).toBe(false);
    expect(canEnterSite(true, false)).toBe(false);
    expect(canEnterSite(false, true)).toBe(false);
    expect(canEnterSite(true, true)).toBe(true);
  });
  it("allows reading both policies but not other pages before agreement", () => {
    expect(isPolicyPath("/terms")).toBe(true);
    expect(isPolicyPath("/privacy/")).toBe(true);
    expect(isPolicyPath("/")).toBe(false);
    expect(isPolicyPath("/ask/example")).toBe(false);
    expect(isPolicyPath("/terms/other")).toBe(false);
  });
  it("only recognizes agreement to the current policy version", () => {
    expect(hasCurrentAgreement(null)).toBe(false);
    expect(hasCurrentAgreement("2026-10-26")).toBe(false);
    expect(hasCurrentAgreement(AGREEMENT_VERSION)).toBe(true);
  });
});